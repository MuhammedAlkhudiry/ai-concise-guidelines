#!/usr/bin/env zsh

# Usage:
#   remote-info <namespace> [--full]
# Example:
#   remote-info ajeer-dev

GUM_BIN="$(command -v gum 2>/dev/null || true)"

has_gum() {
  [[ -n "$GUM_BIN" ]]
}

print_title() {
  if has_gum; then
    "$GUM_BIN" style --bold --foreground 212 "$1"
  else
    echo "$1"
  fi
}

print_warn() {
  if has_gum; then
    "$GUM_BIN" style --foreground 214 "$1"
  else
    echo "$1"
  fi
}

print_muted() {
  if has_gum; then
    "$GUM_BIN" style --foreground 246 "$1"
  else
    echo "$1"
  fi
}

print_ok() {
  if has_gum; then
    "$GUM_BIN" style --foreground 42 "$1"
  else
    echo "$1"
  fi
}

print_block() {
  local color="${1:-252}"
  local content="$2"

  if [[ -z "$content" ]]; then
    return 0
  fi

  if has_gum; then
    while IFS= read -r line; do
      "$GUM_BIN" style --foreground "$color" "$line"
    done <<< "$content"
  else
    echo "$content"
  fi
}

print_section() {
  echo ""
  if has_gum; then
    "$GUM_BIN" style --bold --foreground 81 "== $1 =="
  else
    echo "== $1 =="
  fi
}

print_kv() {
  local label
  label="$(printf "%-18s" "$1")"
  if has_gum; then
    printf "  %s %s\n" "$("$GUM_BIN" style --foreground 244 "$label")" "$("$GUM_BIN" style --foreground 252 "$2")"
  else
    printf "  %-18s %s\n" "$1" "$2"
  fi
}

run_or_warn() {
  local label="$1"
  shift
  local output
  output="$("$@" 2>&1)"
  local exit_code=$?

  if [[ -n "$output" ]]; then
    if [[ $exit_code -eq 0 ]]; then
      print_block 252 "$output"
    else
      print_block 214 "$output"
    fi
  fi

  if [[ $exit_code -ne 0 ]]; then
    print_warn "[warn] $label failed (exit $exit_code)"
  fi
  return 0
}

capture_or_warn() {
  local label="$1"
  shift
  local output
  output="$("$@" 2>/dev/null)"
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    print_warn "[warn] $label failed (exit $exit_code)"
    return 1
  fi
  echo "$output"
  return 0
}

count_rows_by_resource() {
  local namespace="$1"
  local context="$2"
  local resource="$3"
  local count
  count=$(kubectl get "$resource" -n "$namespace" --context "$context" --no-headers 2>/dev/null | wc -l | tr -d ' ')
  if [[ -z "$count" ]]; then
    echo "0"
    return
  fi
  echo "$count"
}

print_usage_summary() {
  local namespace="$1"
  local context="$2"

  local totals
  totals="$(kubectl top pods -n "$namespace" --context "$context" --no-headers 2>/dev/null | awk '
    function cpu_to_m(v) {
      if (v ~ /m$/) { sub(/m$/, "", v); return v + 0 }
      return (v + 0) * 1000
    }
    function mem_to_mi(v) {
      if (v ~ /Ki$/) { sub(/Ki$/, "", v); return (v + 0) / 1024 }
      if (v ~ /Mi$/) { sub(/Mi$/, "", v); return v + 0 }
      if (v ~ /Gi$/) { sub(/Gi$/, "", v); return (v + 0) * 1024 }
      if (v ~ /Ti$/) { sub(/Ti$/, "", v); return (v + 0) * 1024 * 1024 }
      if (v ~ /K$/)  { sub(/K$/, "", v); return (v + 0) / 1024 }
      if (v ~ /M$/)  { sub(/M$/, "", v); return v + 0 }
      if (v ~ /G$/)  { sub(/G$/, "", v); return (v + 0) * 1024 }
      return v + 0
    }
    {
      if ($2 == "<unknown>" || $3 == "<unknown>") {
        unknown++
        next
      }
      pods++
      cpu_m += cpu_to_m($2)
      mem_mi += mem_to_mi($3)
    }
    END {
      printf "%d|%.0f|%.2f|%d\n", pods, cpu_m, mem_mi / 1024, unknown
    }
  ')"

  local metrics_exit=$?
  if [[ $metrics_exit -ne 0 || -z "$totals" ]]; then
    echo "Metrics unavailable (kubectl top failed)."
    return 1
  fi

  local pods_count total_cpu_m total_mem_gi unknown_count
  IFS='|' read -r pods_count total_cpu_m total_mem_gi unknown_count <<< "$totals"

  print_kv "pods with metrics" "$pods_count"
  print_kv "total cpu" "${total_cpu_m}m"
  print_kv "total memory" "${total_mem_gi}Gi"
  print_kv "unknown metrics" "$unknown_count"

  return 0
}

print_top_pods() {
  local namespace="$1"
  local context="$2"

  local top_cpu
  top_cpu="$(capture_or_warn "top pods by cpu" kubectl top pods -n "$namespace" --context "$context" --sort-by=cpu)"
  if [[ -n "$top_cpu" ]]; then
    print_title "Top pods by CPU"
    print_block 252 "$(echo "$top_cpu" | head -n 11)"
  fi

  local top_memory
  top_memory="$(capture_or_warn "top pods by memory" kubectl top pods -n "$namespace" --context "$context" --sort-by=memory)"
  if [[ -n "$top_memory" ]]; then
    echo ""
    print_title "Top pods by Memory"
    print_block 252 "$(echo "$top_memory" | head -n 11)"
  fi
}

remote_info_main() {
  local namespace="${1:-}"
  local full_mode="${2:-}"

  if [[ -z "$namespace" ]]; then
    print_warn "Usage: remote-info <namespace> [--full]"
    print_muted "Example: remote-info ajeer-dev"
    return 1
  fi

  if ! command -v kubectl >/dev/null 2>&1; then
    print_warn "kubectl is required but not found in PATH."
    return 1
  fi

  local context
  if [[ "$namespace" == *-dev || "$namespace" == *-stg || "$namespace" == *-uat ]]; then
    context="preprod"
  elif [[ "$namespace" == *-prod ]]; then
    context="production"
  else
    print_warn "Invalid namespace suffix. Please use a namespace ending with -dev, -stg, -uat, or -prod."
    return 1
  fi

  local generated_at
  generated_at="$(date '+%Y-%m-%d %H:%M:%S')"

  print_title "remote-info summary"
  print_kv "namespace" "$namespace"
  print_kv "context" "$context"
  print_kv "generated" "$generated_at"

  print_section "Overview"
  run_or_warn "namespace" kubectl get namespace "$namespace" --context "$context"
  print_kv "pods" "$(count_rows_by_resource "$namespace" "$context" "pods")"
  print_kv "deployments" "$(count_rows_by_resource "$namespace" "$context" "deployments")"
  print_kv "services" "$(count_rows_by_resource "$namespace" "$context" "services")"
  print_kv "ingresses" "$(count_rows_by_resource "$namespace" "$context" "ingress")"

  print_section "Resource Usage (CPU/Memory)"
  if print_usage_summary "$namespace" "$context"; then
    echo ""
    print_top_pods "$namespace" "$context"
  fi

  print_section "Pods"
  run_or_warn "pods" kubectl get pods -n "$namespace" --context "$context" -o wide

  print_section "Workloads"
  run_or_warn "workloads" kubectl get deployments,statefulsets,daemonsets -n "$namespace" --context "$context"
  run_or_warn "batch workloads" kubectl get jobs,cronjobs -n "$namespace" --context "$context"

  print_section "Networking"
  run_or_warn "networking" kubectl get svc,ingress -n "$namespace" --context "$context" -o wide

  print_section "Issues (Non-Running Pods)"
  local pod_issues
  pod_issues="$(kubectl get pods -n "$namespace" --context "$context" --field-selector=status.phase!=Running,status.phase!=Succeeded 2>/dev/null)"
  if [[ -z "$pod_issues" || "$pod_issues" == No\ resources\ found* ]]; then
    print_ok "No non-running pods."
  else
    print_block 214 "$pod_issues"
  fi

  print_section "Recent Warning Events (Last 15)"
  local warning_events
  warning_events="$(kubectl get events -n "$namespace" --context "$context" --field-selector type!=Normal --sort-by=.lastTimestamp 2>/dev/null | tail -n 15)"
  if [[ -z "$warning_events" || "$warning_events" == No\ resources\ found* ]]; then
    print_ok "No warning events."
  else
    print_block 214 "$warning_events"
  fi

  if [[ "$full_mode" == "--full" ]]; then
    print_section "Full Snapshot"
    print_muted "Expanded resource and metrics output:"
    run_or_warn "all resources" kubectl get all -n "$namespace" --context "$context" -o wide
    run_or_warn "config and storage" kubectl get configmaps,secrets,pvc,hpa,resourcequota,limitrange -n "$namespace" --context "$context"
    run_or_warn "pod metrics" kubectl top pods -n "$namespace" --context "$context"
    run_or_warn "node metrics" kubectl top nodes --context "$context"
  fi
}

remote_info_main "$@"
