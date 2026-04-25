#!/usr/bin/env bash
# manage-event-lifecycle.sh — Manage the full lifecycle of a workshop event org.
#
# Creates a Devin org for an event with start/end dates, sets up repos,
# invites participants, and tears down when the event ends.
#
# Usage:
#   ./scripts/manage-event-lifecycle.sh <ACTION> [OPTIONS]
#
# Actions:
#   create   Create a new event org with full setup
#   status   Check the status of an event org
#   teardown Delete the event org (after event ends)
#
# Create options:
#   --event-name=<name>       Event name (e.g. "2026-05-15-tokyo") [required]
#   --start-date=<date>       Event start date (YYYY-MM-DD) [required]
#   --end-date=<date>         Event end date (YYYY-MM-DD) [required]
#   --github-org=<org>        GitHub org with workshop repos [required]
#   --git-connection-id=<id>  Devin git connection ID [required]
#   --emails-file=<file>      File with participant emails (one per line)
#   --enterprise-role-id=<id> Enterprise role ID for participants
#   --max-session-acu=<n>     Max ACUs per session
#   --max-cycle-acu=<n>       Max ACUs per billing cycle
#   --api-url=<url>           Devin API base URL (default: https://api.devin.ai)
#   --dry-run                 Preview actions without executing
#
# Status/Teardown options:
#   --org-id=<id>             Devin org ID to check/teardown [required]
#   --api-url=<url>           Devin API base URL
#
# Environment:
#   DEVIN_API_KEY    Required. Service user API key (prefix: cog_)

set -euo pipefail

ACTION="${1:?Usage: $0 <create|status|teardown> [OPTIONS]}"
shift

API_URL="https://api.devin.ai"
EVENT_NAME=""
START_DATE=""
END_DATE=""
GITHUB_ORG=""
GIT_CONNECTION_ID=""
EMAILS_FILE=""
ENTERPRISE_ROLE_ID=""
MAX_SESSION_ACU=""
MAX_CYCLE_ACU=""
ORG_ID=""
DRY_RUN=false

for arg in "$@"; do
  case "$arg" in
    --event-name=*)        EVENT_NAME="${arg#*=}" ;;
    --start-date=*)        START_DATE="${arg#*=}" ;;
    --end-date=*)          END_DATE="${arg#*=}" ;;
    --github-org=*)        GITHUB_ORG="${arg#*=}" ;;
    --git-connection-id=*) GIT_CONNECTION_ID="${arg#*=}" ;;
    --emails-file=*)       EMAILS_FILE="${arg#*=}" ;;
    --enterprise-role-id=*) ENTERPRISE_ROLE_ID="${arg#*=}" ;;
    --max-session-acu=*)   MAX_SESSION_ACU="${arg#*=}" ;;
    --max-cycle-acu=*)     MAX_CYCLE_ACU="${arg#*=}" ;;
    --org-id=*)            ORG_ID="${arg#*=}" ;;
    --api-url=*)           API_URL="${arg#*=}" ;;
    --dry-run)             DRY_RUN=true ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

: "${DEVIN_API_KEY:?Set DEVIN_API_KEY to your service user API key (prefix: cog_)}"

api() {
  local method="$1" path="$2"
  shift 2
  curl -s -X "$method" \
    "${API_URL}/v3${path}" \
    -H "Authorization: Bearer $DEVIN_API_KEY" \
    -H "Content-Type: application/json" \
    "$@"
}

LOGDIR="./event-logs"
mkdir -p "$LOGDIR"

# ─── CREATE ──────────────────────────────────────────────────────────────────
do_create() {
  : "${EVENT_NAME:?--event-name is required}"
  : "${START_DATE:?--start-date is required (YYYY-MM-DD)}"
  : "${END_DATE:?--end-date is required (YYYY-MM-DD)}"
  : "${GITHUB_ORG:?--github-org is required}"
  : "${GIT_CONNECTION_ID:?--git-connection-id is required}"

  local org_display_name="Workshop: $EVENT_NAME ($START_DATE to $END_DATE)"
  local logfile="$LOGDIR/create-${EVENT_NAME}-$(date +%Y%m%d-%H%M%S).log"

  echo "=== Create Event Org ===" | tee "$logfile"
  echo "Event:     $EVENT_NAME" | tee -a "$logfile"
  echo "Dates:     $START_DATE to $END_DATE" | tee -a "$logfile"
  echo "GitHub:    $GITHUB_ORG" | tee -a "$logfile"
  echo "Dry run:   $DRY_RUN" | tee -a "$logfile"
  echo "" | tee -a "$logfile"

  if [ "$DRY_RUN" = true ]; then
    echo "DRY RUN: Would create org '$org_display_name'" | tee -a "$logfile"
    echo "DRY RUN: Would grant git access to $GITHUB_ORG" | tee -a "$logfile"
    [ -n "$EMAILS_FILE" ] && echo "DRY RUN: Would invite $(wc -l < "$EMAILS_FILE") participants" | tee -a "$logfile"
    return 0
  fi

  # Step 1: Create the Devin org
  echo "Step 1: Creating Devin org..." | tee -a "$logfile"
  local create_args="--git-connection-id=$GIT_CONNECTION_ID --github-org=$GITHUB_ORG"
  [ -n "$MAX_SESSION_ACU" ] && create_args="$create_args --max-session-acu=$MAX_SESSION_ACU"
  [ -n "$MAX_CYCLE_ACU" ] && create_args="$create_args --max-cycle-acu=$MAX_CYCLE_ACU"

  # shellcheck disable=SC2086
  ./scripts/setup-devin-org.sh "$org_display_name" $create_args 2>&1 | tee -a "$logfile"

  ORG_ID=$(cat .last-created-org-id 2>/dev/null || echo "")
  if [ -z "$ORG_ID" ]; then
    echo "ERROR: Failed to create org. Check log: $logfile" >&2
    return 1
  fi

  # Step 2: Invite participants
  if [ -n "$EMAILS_FILE" ] && [ -f "$EMAILS_FILE" ]; then
    echo "" | tee -a "$logfile"
    echo "Step 2: Inviting participants..." | tee -a "$logfile"
    local invite_args=""
    [ -n "$ENTERPRISE_ROLE_ID" ] && invite_args="--enterprise-role-id=$ENTERPRISE_ROLE_ID"
    # shellcheck disable=SC2086
    ./scripts/invite-participants.sh "$ORG_ID" "$EMAILS_FILE" $invite_args 2>&1 | tee -a "$logfile"
  else
    echo "" | tee -a "$logfile"
    echo "Step 2: Skipped (no --emails-file provided)" | tee -a "$logfile"
  fi

  # Step 3: Write event manifest
  local manifest="$LOGDIR/${EVENT_NAME}-manifest.json"
  jq -n \
    --arg org_id "$ORG_ID" \
    --arg event "$EVENT_NAME" \
    --arg start "$START_DATE" \
    --arg end "$END_DATE" \
    --arg github "$GITHUB_ORG" \
    --arg created "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    '{org_id: $org_id, event_name: $event, start_date: $start, end_date: $end, github_org: $github, created_at: $created, status: "active"}' \
    > "$manifest"

  echo "" | tee -a "$logfile"
  echo "=== Event Created ===" | tee -a "$logfile"
  echo "Org ID:    $ORG_ID" | tee -a "$logfile"
  echo "Manifest:  $manifest" | tee -a "$logfile"
  echo "Teardown:  ./scripts/manage-event-lifecycle.sh teardown --org-id=$ORG_ID" | tee -a "$logfile"
  echo "" | tee -a "$logfile"
  echo "Remaining manual steps:" | tee -a "$logfile"
  echo "  1. Set up repos on Devin: ./scripts/setup-repos-on-devin.sh $ORG_ID $GITHUB_ORG" | tee -a "$logfile"
  echo "  2. Create knowledge notes for workshop conventions" | tee -a "$logfile"
  echo "  3. Create playbooks for common tasks" | tee -a "$logfile"
}

# ─── STATUS ──────────────────────────────────────────────────────────────────
do_status() {
  : "${ORG_ID:?--org-id is required}"

  echo "=== Event Org Status ==="
  RESULT=$(api GET "/enterprise/organizations/$ORG_ID")

  if echo "$RESULT" | jq -e '.org_id' >/dev/null 2>&1; then
    echo "Org ID:    $(echo "$RESULT" | jq -r '.org_id')"
    echo "Name:      $(echo "$RESULT" | jq -r '.name')"
    echo "Created:   $(echo "$RESULT" | jq -r '.created_at')"
    echo "ACU Limit: $(echo "$RESULT" | jq -r '.max_cycle_acu_limit // "none"')"
    echo ""

    # Check for matching manifest
    for manifest in "$LOGDIR"/*-manifest.json; do
      if [ -f "$manifest" ]; then
        local m_org_id
        m_org_id=$(jq -r '.org_id' "$manifest")
        if [ "$m_org_id" = "$ORG_ID" ]; then
          echo "Event manifest: $manifest"
          echo "Event:     $(jq -r '.event_name' "$manifest")"
          echo "Dates:     $(jq -r '.start_date' "$manifest") to $(jq -r '.end_date' "$manifest")"
          echo "Status:    $(jq -r '.status' "$manifest")"

          local end_date
          end_date=$(jq -r '.end_date' "$manifest")
          local today
          today=$(date +%Y-%m-%d)
          if [[ "$today" > "$end_date" ]]; then
            echo ""
            echo "EVENT HAS ENDED. Consider running teardown:"
            echo "  ./scripts/manage-event-lifecycle.sh teardown --org-id=$ORG_ID"
          fi
          break
        fi
      fi
    done
  else
    echo "ERROR: Could not retrieve org. Response:"
    echo "$RESULT" | jq .
  fi
}

# ─── TEARDOWN ────────────────────────────────────────────────────────────────
do_teardown() {
  : "${ORG_ID:?--org-id is required}"

  local logfile="$LOGDIR/teardown-$(date +%Y%m%d-%H%M%S).log"

  echo "=== Teardown Event Org ===" | tee "$logfile"
  echo "Org ID: $ORG_ID" | tee -a "$logfile"
  echo "" | tee -a "$logfile"

  if [ "$DRY_RUN" = true ]; then
    echo "DRY RUN: Would delete org $ORG_ID" | tee -a "$logfile"
    return 0
  fi

  # Confirm
  echo "WARNING: This will permanently delete the Devin org and all its sessions."
  echo "         Participants will lose access immediately."
  read -r -p "Type the org ID to confirm: " confirm
  if [ "$confirm" != "$ORG_ID" ]; then
    echo "Aborted." | tee -a "$logfile"
    return 1
  fi

  echo "Deleting org $ORG_ID..." | tee -a "$logfile"
  RESULT=$(api DELETE "/enterprise/organizations/$ORG_ID")

  if echo "$RESULT" | jq -e '.org_id' >/dev/null 2>&1; then
    echo "Org deleted successfully." | tee -a "$logfile"

    # Update manifest if it exists
    for manifest in "$LOGDIR"/*-manifest.json; do
      if [ -f "$manifest" ]; then
        local m_org_id
        m_org_id=$(jq -r '.org_id' "$manifest")
        if [ "$m_org_id" = "$ORG_ID" ]; then
          jq '.status = "torn_down" | .torn_down_at = now' "$manifest" > "${manifest}.tmp" && mv "${manifest}.tmp" "$manifest"
          echo "Updated manifest: $manifest" | tee -a "$logfile"
          break
        fi
      fi
    done
  else
    echo "ERROR: Teardown failed. Response:" | tee -a "$logfile"
    echo "$RESULT" | jq . | tee -a "$logfile"
  fi
}

case "$ACTION" in
  create)   do_create ;;
  status)   do_status ;;
  teardown) do_teardown ;;
  *) echo "Unknown action: $ACTION. Use: create, status, teardown" >&2; exit 1 ;;
esac
