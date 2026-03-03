#!/usr/bin/env zsh

# Usage:
#   hosts list
#   hosts add <domain> [ip]
#   hosts delete
#   hosts backups
#   hosts cleanup [keep]

hosts_main() {
  local action="${1:-delete}"
  local hosts_file="/etc/hosts"
  local backup_glob="${hosts_file}.bak.*"
  local keep_count="${HOSTS_BACKUP_KEEP:-10}"
  local cleanup_count
  local backup_count
  local domains
  local backups
  local old_backups
  local selected
  local domain
  local ip
  local tmp_file
  local backup_file

  setopt localoptions nonomatch

  if [[ ! -r "$hosts_file" ]]; then
    echo "Cannot read $hosts_file"
    return 1
  fi

  case "$action" in
    list)
      awk '
        BEGIN {
          ignore["localhost"] = 1
          ignore["broadcasthost"] = 1
          ignore["local"] = 1
          ignore["ip6-localhost"] = 1
          ignore["ip6-loopback"] = 1
          ignore["ip6-localnet"] = 1
          ignore["ip6-mcastprefix"] = 1
          ignore["ip6-allnodes"] = 1
          ignore["ip6-allrouters"] = 1
        }
        /^[[:space:]]*#/ || NF < 2 { next }
        {
          for (i = 2; i <= NF; i++) {
            if ($i ~ /^#/) break
            if (!ignore[$i]) print $i
          }
        }
      ' "$hosts_file" | sort -u
      ;;
    backups)
      ls -1t $backup_glob 2>/dev/null || echo "No backups found."
      ;;
    cleanup)
      cleanup_count="${2:-$keep_count}"

      if [[ ! "$cleanup_count" =~ ^[0-9]+$ ]]; then
        echo "Usage: hosts cleanup [keep]"
        return 1
      fi

      if (( cleanup_count < 1 )); then
        echo "Cleanup keep count must be >= 1"
        return 1
      fi

      backup_count=$(ls -1 $backup_glob 2>/dev/null | wc -l | tr -d ' ')
      if [[ "$backup_count" == "0" ]]; then
        echo "No backups found."
        return 0
      fi

      if (( backup_count <= cleanup_count )); then
        echo "No cleanup needed. Backups: $backup_count, keep: $cleanup_count"
        return 0
      fi

      old_backups=$(ls -1t $backup_glob 2>/dev/null | tail -n +"$((cleanup_count + 1))")
      if [[ -z "$old_backups" ]]; then
        echo "No cleanup needed."
        return 0
      fi

      echo "$old_backups" | while IFS= read -r backup_path; do
        [[ -n "$backup_path" ]] && sudo rm -f "$backup_path"
      done

      echo "Removed old backups. Kept newest $cleanup_count."
      ;;
    add)
      domain="$2"
      ip="${3:-127.0.0.1}"

      if [[ -z "$domain" ]]; then
        echo "Usage: hosts add <domain> [ip]"
        return 1
      fi

      if [[ "$domain" =~ [[:space:]] ]]; then
        echo "Invalid domain '$domain'"
        return 1
      fi

      if [[ ! "$domain" =~ ^[A-Za-z0-9.-]+$ ]]; then
        echo "Invalid domain '$domain'"
        return 1
      fi

      if ! awk -v domain="$domain" '
        /^[[:space:]]*#/ || NF < 2 { next }
        {
          for (i = 2; i <= NF; i++) {
            if ($i ~ /^#/) break
            if ($i == domain) {
              found = 1
              exit
            }
          }
        }
        END { exit found ? 0 : 1 }
      ' "$hosts_file"; then
        :
      else
        echo "Domain '$domain' already exists in $hosts_file"
        return 1
      fi

      tmp_file=$(mktemp)
      if [[ -z "$tmp_file" ]]; then
        echo "Failed to create temporary file."
        return 1
      fi

      if ! cp "$hosts_file" "$tmp_file"; then
        rm -f "$tmp_file"
        echo "Failed to prepare temporary hosts file."
        return 1
      fi

      printf '\n%s %s\n' "$ip" "$domain" >> "$tmp_file"

      backup_file="${hosts_file}.bak.$(date +%Y%m%d%H%M%S)"
      if ! sudo cp "$hosts_file" "$backup_file"; then
        rm -f "$tmp_file"
        echo "Failed to create backup at $backup_file"
        return 1
      fi

      if ! sudo cp "$tmp_file" "$hosts_file"; then
        rm -f "$tmp_file"
        echo "Failed to update $hosts_file"
        return 1
      fi

      rm -f "$tmp_file"
      echo "Added domain '$domain' with IP '$ip' to $hosts_file"
      echo "Backup created at $backup_file"

      backups=$(ls -1 $backup_glob 2>/dev/null | wc -l | tr -d ' ')
      if (( backups > keep_count )); then
        old_backups=$(ls -1t $backup_glob 2>/dev/null | tail -n +"$((keep_count + 1))")
        if [[ -n "$old_backups" ]]; then
          echo "$old_backups" | while IFS= read -r backup_path; do
            [[ -n "$backup_path" ]] && sudo rm -f "$backup_path"
          done
          echo "Auto-cleaned old backups (kept newest $keep_count)."
        fi
      fi
      ;;
    delete|remove|rm)
      domains=$(awk '
        BEGIN {
          ignore["localhost"] = 1
          ignore["broadcasthost"] = 1
          ignore["local"] = 1
          ignore["ip6-localhost"] = 1
          ignore["ip6-loopback"] = 1
          ignore["ip6-localnet"] = 1
          ignore["ip6-mcastprefix"] = 1
          ignore["ip6-allnodes"] = 1
          ignore["ip6-allrouters"] = 1
        }
        /^[[:space:]]*#/ || NF < 2 { next }
        {
          for (i = 2; i <= NF; i++) {
            if ($i ~ /^#/) break
            if (!ignore[$i]) print $i
          }
        }
      ' "$hosts_file" | sort -u)

      if [[ -z "$domains" ]]; then
        echo "No custom domains found in $hosts_file"
        return 0
      fi

      if ! command -v fzf >/dev/null; then
        echo "fzf is required for interactive selection."
        return 1
      fi

      selected=$(printf '%s\n' "$domains" | fzf \
        --height=40% \
        --reverse \
        --border=rounded \
        --prompt="Hosts > " \
        --header="Select a domain to delete" \
        --exit-0)

      if [[ -z "$selected" ]]; then
        return 1
      fi

      tmp_file=$(mktemp)
      if [[ -z "$tmp_file" ]]; then
        echo "Failed to create temporary file."
        return 1
      fi

      awk -v domain="$selected" '
        /^[[:space:]]*#/ || NF == 0 { print; next }
        {
          kept_count = 0
          comment = ""

          for (i = 2; i <= NF; i++) {
            if ($i ~ /^#/) {
              comment = $i
              for (j = i + 1; j <= NF; j++) {
                comment = comment " " $j
              }
              break
            }

            if ($i != domain) {
              kept_count++
              kept_hosts[kept_count] = $i
            }
          }

          if (kept_count > 0) {
            line = $1
            for (k = 1; k <= kept_count; k++) {
              line = line " " kept_hosts[k]
            }
            if (comment != "") {
              line = line " " comment
            }
            print line
          }

          delete kept_hosts
        }
      ' "$hosts_file" > "$tmp_file"

      if cmp -s "$hosts_file" "$tmp_file"; then
        rm -f "$tmp_file"
        echo "Domain '$selected' was not changed in $hosts_file"
        return 1
      fi

      backup_file="${hosts_file}.bak.$(date +%Y%m%d%H%M%S)"
      if ! sudo cp "$hosts_file" "$backup_file"; then
        rm -f "$tmp_file"
        echo "Failed to create backup at $backup_file"
        return 1
      fi

      if ! sudo cp "$tmp_file" "$hosts_file"; then
        rm -f "$tmp_file"
        echo "Failed to update $hosts_file"
        return 1
      fi

      rm -f "$tmp_file"
      echo "Deleted domain '$selected' from $hosts_file"
      echo "Backup created at $backup_file"

      backups=$(ls -1 $backup_glob 2>/dev/null | wc -l | tr -d ' ')
      if (( backups > keep_count )); then
        old_backups=$(ls -1t $backup_glob 2>/dev/null | tail -n +"$((keep_count + 1))")
        if [[ -n "$old_backups" ]]; then
          echo "$old_backups" | while IFS= read -r backup_path; do
            [[ -n "$backup_path" ]] && sudo rm -f "$backup_path"
          done
          echo "Auto-cleaned old backups (kept newest $keep_count)."
        fi
      fi
      ;;
    *)
      echo "Usage: hosts [list|add|delete|backups|cleanup]"
      return 1
      ;;
  esac
}

hosts_main "$@"
