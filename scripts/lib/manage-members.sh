#!/usr/bin/env bash
# manage-members.sh — Member invitation and management functions
# Source common.sh before using these functions.

# ---------------------------------------------------------------------------
# Invite users to the enterprise by email (batch).
# Usage: invite_enterprise_members <emails_json_array> [enterprise_role_id]
#
# emails_json_array: a jq-formatted JSON array of emails, e.g. '["a@b.com"]'
# Returns the API response (array of user objects with user_id).
# ---------------------------------------------------------------------------
invite_enterprise_members() {
  local emails_json="$1"
  local role_id="${2:-}"

  local payload
  payload=$(jq -n --argjson emails "$emails_json" '{emails: $emails}')
  if [[ -n "$role_id" ]]; then
    payload=$(echo "$payload" | jq --arg r "$role_id" '. + {enterprise_role_id: $r}')
  fi

  api_post "/v3/enterprise/members/users" "$payload"
}

# ---------------------------------------------------------------------------
# Assign a user to an organization.
# Usage: assign_user_to_org <org_id> <user_id> [org_role_id]
# ---------------------------------------------------------------------------
assign_user_to_org() {
  local org_id="$1"
  local user_id="$2"
  local role_id="${3:-}"

  local payload
  payload=$(jq -n --arg uid "$user_id" '{user_id: $uid}')
  if [[ -n "$role_id" ]]; then
    payload=$(echo "$payload" | jq --arg r "$role_id" '. + {org_role_id: $r}')
  fi

  api_post "/v3/enterprise/organizations/${org_id}/members/users" "$payload"
}

# ---------------------------------------------------------------------------
# Invite a batch of emails and assign them to an org.
# Usage: invite_and_assign <org_id> <email1> [email2] ... [--enterprise-role=<id>] [--org-role=<id>]
#
# Handles batching (max 50 per API call) internally.
# Prints summary counts to stdout.
# ---------------------------------------------------------------------------
invite_and_assign() {
  local org_id="$1"
  shift

  local enterprise_role=""
  local org_role=""
  local emails=()

  for arg in "$@"; do
    case "$arg" in
      --enterprise-role=*) enterprise_role="${arg#*=}" ;;
      --org-role=*)        org_role="${arg#*=}" ;;
      *)                   emails+=("$arg") ;;
    esac
  done

  local invited=0 assigned=0 failed=0
  local batch_size=50

  for ((i = 0; i < ${#emails[@]}; i += batch_size)); do
    local batch=("${emails[@]:i:batch_size}")

    # Build JSON array
    local emails_json
    emails_json=$(printf '%s\n' "${batch[@]}" | jq -R . | jq -s .)

    info "Inviting ${#batch[@]} user(s) to enterprise..."
    local result
    result=$(invite_enterprise_members "$emails_json" "$enterprise_role") || {
      warn "Batch invite failed"
      failed=$((failed + ${#batch[@]}))
      continue
    }

    # Extract user_ids and assign to org
    local user_ids
    user_ids=$(echo "$result" | jq -r '.[].user_id // empty' 2>/dev/null)

    if [[ -z "$user_ids" ]]; then
      warn "No user IDs returned from invite. Response: $(echo "$result" | jq -c .)"
      failed=$((failed + ${#batch[@]}))
      continue
    fi

    invited=$((invited + $(echo "$user_ids" | wc -l)))

    while IFS= read -r user_id; do
      [[ -z "$user_id" ]] && continue

      local assign_result
      assign_result=$(assign_user_to_org "$org_id" "$user_id" "$org_role") || {
        warn "Failed to assign ${user_id} to org ${org_id}"
        failed=$((failed + 1))
        continue
      }

      if echo "$assign_result" | jq -e '.user_id' >/dev/null 2>&1; then
        assigned=$((assigned + 1))
      else
        warn "Unexpected response assigning ${user_id}: $(echo "$assign_result" | jq -c .)"
        failed=$((failed + 1))
      fi
    done <<< "$user_ids"

    sleep 0.5
  done

  echo "Invited: ${invited} | Assigned to org: ${assigned} | Failed: ${failed}"
}

# ---------------------------------------------------------------------------
# Read emails from a file (one per line, # comments, blank lines ignored).
# Usage: read_emails_file <file_path>
# Prints emails to stdout, one per line.
# ---------------------------------------------------------------------------
read_emails_file() {
  local file="$1"
  [[ ! -f "$file" ]] && { err "Emails file not found: ${file}"; return 1; }
  while IFS= read -r line || [[ -n "$line" ]]; do
    line=$(echo "$line" | xargs)
    [[ -n "$line" ]] && [[ ! "$line" =~ ^# ]] && echo "$line"
  done < "$file"
}
