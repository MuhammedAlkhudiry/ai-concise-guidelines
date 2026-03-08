#!/usr/bin/env zsh

# Usage:
#   remote-tinker <namespace> 'dump(App\\Models\\User::latest()->first());'
#   remote-tinker <namespace> --file /path/to/query.php
#   remote-tinker <namespace> --stdin <<'PHP'
#   dump(App\Models\User::query()->count());
#   PHP

print_usage() {
  printf '%s\n' "Usage: remote-tinker <namespace> [--file <path> | --stdin | php-code]"
  printf '%s\n' "Examples:"
  printf '%s\n' "  remote-tinker ajeer-stg 'dump(App\\\\Models\\\\User::latest()->first());'"
  printf '%s\n' "  remote-tinker ajeer-stg --file /tmp/query.php"
  printf '%s\n' "  remote-tinker ajeer-stg --stdin <<'PHP'"
  printf '%s\n' "  dump(App\\Models\\User::query()->count());"
  printf '%s\n' "  PHP"
}

resolve_remote_bin() {
  if [[ -x "$HOME/bin/remote" ]]; then
    echo "$HOME/bin/remote"
    return 0
  fi

  local remote_bin
  remote_bin="$(command -v remote 2>/dev/null)"

  if [[ -n "$remote_bin" ]]; then
    echo "$remote_bin"
    return 0
  fi

  echo "remote executable not found. Run the installer again: bun src/init.ts --local" >&2
  return 1
}

remote_tinker_main() {
  if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
    print_usage
    return 0
  fi

  local namespace="${1:-}"

  if [[ -z "$namespace" ]]; then
    print_usage
    return 1
  fi

  shift

  local php_code=""
  local file_path=""
  local read_stdin=false

  while [[ "$#" -gt 0 ]]; do
    case "$1" in
      --help|-h)
        print_usage
        return 0
        ;;
      --file)
        if [[ -n "$php_code" || "$read_stdin" == true || -n "$file_path" ]]; then
          echo "Choose exactly one input source: inline code, --file, or --stdin." >&2
          return 1
        fi

        file_path="${2:-}"
        if [[ -z "$file_path" ]]; then
          echo "--file requires a path." >&2
          return 1
        fi

        shift 2
        ;;
      --stdin)
        if [[ -n "$php_code" || -n "$file_path" || "$read_stdin" == true ]]; then
          echo "Choose exactly one input source: inline code, --file, or --stdin." >&2
          return 1
        fi

        read_stdin=true
        shift
        ;;
      --)
        shift
        if [[ "$#" -eq 0 ]]; then
          echo "Missing PHP code after --." >&2
          return 1
        fi

        php_code="$*"
        break
        ;;
      *)
        if [[ -n "$file_path" || "$read_stdin" == true ]]; then
          echo "Choose exactly one input source: inline code, --file, or --stdin." >&2
          return 1
        fi

        php_code="${php_code:+$php_code }$1"
        shift
        ;;
    esac
  done

  if [[ -n "$file_path" ]]; then
    if [[ ! -f "$file_path" ]]; then
      echo "File not found: $file_path" >&2
      return 1
    fi

    php_code="$(<"$file_path")"
  elif [[ "$read_stdin" == true || ( ! -t 0 && -z "$php_code" ) ]]; then
    php_code="$(cat)"
  fi

  if [[ -z "$php_code" ]]; then
    print_usage
    return 1
  fi

  local remote_bin
  remote_bin="$(resolve_remote_bin)" || return 1

  local code_b64
  code_b64="$(printf '%s' "$php_code" | base64 | tr -d '\n')"

  local remote_command
  remote_command="CODE_B64='${code_b64}'; env HOME=/tmp PSYSH_TRUST_PROJECT=never php artisan tinker --execute=\"\$(php -r 'echo base64_decode(\$argv[1]);' \"\$CODE_B64\")\""

  "$remote_bin" "$namespace" "$remote_command"
}

remote_tinker_main "$@"
