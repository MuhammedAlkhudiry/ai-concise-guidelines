#!/usr/bin/env zsh

# Usage:
#   remote-info <namespace>
# Example:
#   remote-info ajeer-dev

print_section() {
  echo
  echo "=== $1 ==="
}

run_or_warn() {
  "$@"
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    echo "Command failed ($exit_code): $*"
  fi
  return 0
}

remote_info_main() {
  local namespace="${1:-}"

  if [[ -z "$namespace" ]]; then
    echo "Usage: remote-info <namespace>"
    echo "Example: remote-info ajeer-dev"
    return 1
  fi

  if ! command -v kubectl >/dev/null 2>&1; then
    echo "kubectl is required but not found in PATH."
    return 1
  fi

  local context
  if [[ "$namespace" == *-dev || "$namespace" == *-stg || "$namespace" == *-uat ]]; then
    context="preprod"
  elif [[ "$namespace" == *-prod ]]; then
    context="production"
  else
    echo "Invalid namespace suffix. Please use a namespace ending with -dev, -stg, -uat, or -prod."
    return 1
  fi

  echo "Collecting namespace info for '$namespace' (context: $context)..."

  print_section "Namespace"
  run_or_warn kubectl get namespace "$namespace" --context "$context" -o wide
  run_or_warn kubectl describe namespace "$namespace" --context "$context"

  print_section "Core Resources (kubectl get all)"
  run_or_warn kubectl get all -n "$namespace" --context "$context" -o wide

  print_section "Pods"
  run_or_warn kubectl get pods -n "$namespace" --context "$context" -o wide

  print_section "Workloads"
  run_or_warn kubectl get deployments,statefulsets,daemonsets,replicasets -n "$namespace" --context "$context" -o wide
  run_or_warn kubectl get jobs,cronjobs -n "$namespace" --context "$context"

  print_section "Networking"
  run_or_warn kubectl get svc,endpoints,ingress -n "$namespace" --context "$context" -o wide

  print_section "Config & Storage"
  run_or_warn kubectl get configmaps,secrets,pvc -n "$namespace" --context "$context"

  print_section "Autoscaling & Limits"
  run_or_warn kubectl get hpa,resourcequota,limitrange -n "$namespace" --context "$context"

  print_section "Recent Events"
  run_or_warn kubectl get events -n "$namespace" --context "$context" --sort-by=.lastTimestamp

  print_section "Pod Descriptions"
  local -a pods
  pods=("${(@f)$(kubectl get pods -n "$namespace" --context "$context" -o name 2>/dev/null)}")

  if (( ${#pods[@]} == 0 )); then
    echo "No pods found."
    return 0
  fi

  local pod
  for pod in "${pods[@]}"; do
    echo
    echo "--- ${pod} ---"
    run_or_warn kubectl describe "$pod" -n "$namespace" --context "$context"
  done
}

remote_info_main "$@"
