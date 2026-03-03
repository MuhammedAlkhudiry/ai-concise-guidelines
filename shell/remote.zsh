#!/usr/bin/env zsh

# Usage:
#   remote <namespace>
#   remote <namespace> "php artisan about"
#   remote <namespace> -- php artisan queue:work --once

remote_main() {
  local namespace="${1:-}"

  if [[ -z "$namespace" ]]; then
    echo "Usage: remote <namespace> [--] [command]"
    echo "Examples:"
    echo "  remote ajeer-prod"
    echo "  remote ajeer-prod \"php artisan about\""
    echo "  remote ajeer-prod -- php artisan queue:work --once"
    return 1
  fi

  shift

  local context
  if [[ "$namespace" == *-dev || "$namespace" == *-stg || "$namespace" == *-uat ]]; then
    context="preprod"
  elif [[ "$namespace" == *-prod ]]; then
    context="production"
  else
    echo "Invalid namespace suffix. Please use a namespace ending with -dev, -stg, -uat, or -prod."
    return 1
  fi

  local pod_name
  pod_name=$(kubectl get pods -n "$namespace" --context "$context" | grep -E '^(laravel|ajeer)-' | awk '{print $1}' | head -n 1)

  if [[ -z "$pod_name" ]]; then
    echo "No matching laravel or ajeer pod found."
    return 1
  fi

  if [[ "$1" == "--" ]]; then
    shift
  fi

  if [[ "$#" -gt 0 ]]; then
    local remote_command
    if [[ "$#" -eq 1 ]]; then
      remote_command="$1"
    else
      remote_command=$(printf "%q " "$@")
      remote_command="${remote_command% }"
    fi
    echo "Running command in pod '$pod_name' (namespace: $namespace, context: $context): $remote_command"
    kubectl exec -n "$namespace" --context "$context" -it "$pod_name" -- sh -lc "$remote_command"
    return $?
  fi

  echo "Attempting interactive shell in pod '$pod_name' (namespace: $namespace, context: $context)."
  kubectl exec -n "$namespace" --context "$context" -it "$pod_name" -- bash || \
  kubectl exec -n "$namespace" --context "$context" -it "$pod_name" -- sh
}

remote_main "$@"
