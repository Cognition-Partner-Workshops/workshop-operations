#!/usr/bin/env bash
# invite-participants.sh — Invite users to a Devin Enterprise org.
#
# Usage:
#   ./scripts/invite-participants.sh <ORG_ID> <EMAILS_FILE> [OPTIONS]
#
# Arguments:
#   ORG_ID        Devin org ID (prefix: org-)
#   EMAILS_FILE   File with participant emails (one per line, # for comments)
#
# Options:
#   --enterprise-role-id=<id>  Role to assign at enterprise level
#   --org-role-id=<id>         Role to assign at org level
#   --api-url=<url>            Devin API base URL (default: https://api.devin.ai)
#   --batch-size=<n>           Emails per API call (default: 50, max: 100)
#   --dry-run                  Preview invitations without sending
#
# Environment:
#   DEVIN_API_KEY    Required. Service user API key (prefix: cog_)
#
# Prerequisites:
#   - Service user with ManageAccountMembership permission

set -euo pipefail

ORG_ID="${1:?Usage: $0 <ORG_ID> <EMAILS_FILE> [OPTIONS]}"
EMAILS_FILE="${2:?Usage: $0 <ORG_ID> <EMAILS_FILE> [OPTIONS]}"
shift 2

API_URL="https://api.devin.ai"
ENTERPRISE_ROLE_ID=""
ORG_ROLE_ID=""
BATCH_SIZE=50
DRY_RUN=false

for arg in "$@"; do
  case "$arg" in
    --enterprise-role-id=*) ENTERPRISE_ROLE_ID="${arg#*=}" ;;
    --org-role-id=*)        ORG_ROLE_ID="${arg#*=}" ;;
    --api-url=*)            API_URL="${arg#*=}" ;;
    --batch-size=*)         BATCH_SIZE="${arg#*=}" ;;
    --dry-run)              DRY_RUN=true ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

: "${DEVIN_API_KEY:?Set DEVIN_API_KEY to your service user API key (prefix: cog_)}"

if [ ! -f "$EMAILS_FILE" ]; then
  echo "ERROR: Emails file not found: $EMAILS_FILE" >&2
  exit 1
fi

# Read emails, skip comments and blank lines
EMAILS=()
while IFS= read -r line; do
  line=$(echo "$line" | xargs)
  [ -n "$line" ] && [[ ! "$line" =~ ^# ]] && EMAILS+=("$line")
done < "$EMAILS_FILE"

if [ ${#EMAILS[@]} -eq 0 ]; then
  echo "No emails found in $EMAILS_FILE"
  exit 0
fi

echo "=== Invite Participants ==="
echo "Org ID:    $ORG_ID"
echo "Emails:    ${#EMAILS[@]}"
echo "Batch:     $BATCH_SIZE"
echo "Dry run:   $DRY_RUN"
echo ""

invited=0
failed=0

# Process in batches
for ((i = 0; i < ${#EMAILS[@]}; i += BATCH_SIZE)); do
  batch=("${EMAILS[@]:i:BATCH_SIZE}")

  # Build JSON array of emails
  emails_json=$(printf '%s\n' "${batch[@]}" | jq -R . | jq -s .)

  if [ "$DRY_RUN" = true ]; then
    echo "DRY RUN: Would invite ${#batch[@]} users:"
    printf '  %s\n' "${batch[@]}"
    invited=$((invited + ${#batch[@]}))
    continue
  fi

  # Step 1: Invite to enterprise
  invite_payload=$(jq -n --argjson emails "$emails_json" '{emails: $emails}')
  if [ -n "$ENTERPRISE_ROLE_ID" ]; then
    invite_payload=$(echo "$invite_payload" | jq --arg rid "$ENTERPRISE_ROLE_ID" '. + {enterprise_role_id: $rid}')
  fi

  result=$(curl -s -X POST \
    "${API_URL}/v3/enterprise/members/users" \
    -H "Authorization: Bearer $DEVIN_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$invite_payload")

  # Extract user IDs for org assignment
  user_ids=$(echo "$result" | jq -r '.[].user_id // empty' 2>/dev/null)

  if [ -z "$user_ids" ]; then
    echo "WARNING: Batch invite may have failed. Response:"
    echo "$result" | jq . 2>/dev/null || echo "$result"
    failed=$((failed + ${#batch[@]}))
    continue
  fi

  # Step 2: Assign each user to the org
  while IFS= read -r user_id; do
    [ -z "$user_id" ] && continue

    assign_payload=$(jq -n --arg uid "$user_id" '{user_id: $uid}')
    if [ -n "$ORG_ROLE_ID" ]; then
      assign_payload=$(echo "$assign_payload" | jq --arg rid "$ORG_ROLE_ID" '. + {org_role_id: $rid}')
    fi

    assign_result=$(curl -s -X POST \
      "${API_URL}/v3/enterprise/organizations/${ORG_ID}/members/users" \
      -H "Authorization: Bearer $DEVIN_API_KEY" \
      -H "Content-Type: application/json" \
      -d "$assign_payload")

    if echo "$assign_result" | jq -e '.user_id' >/dev/null 2>&1; then
      invited=$((invited + 1))
    else
      echo "WARNING: Failed to assign $user_id to org. Response:"
      echo "$assign_result" | jq -c . 2>/dev/null || echo "$assign_result"
      failed=$((failed + 1))
    fi
  done <<< "$user_ids"

  sleep 0.5
done

echo ""
echo "=== Invitation Summary ==="
echo "Invited: $invited | Failed: $failed"
