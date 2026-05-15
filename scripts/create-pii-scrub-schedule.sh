#!/usr/bin/env bash
# create-pii-scrub-schedule.sh — Create a scheduled Devin session for weekly PII scrubbing
#
# Sets up a recurring Devin session that runs sanitize-pr-pii.sh against a
# target GitHub org on a weekly schedule.
#
# Usage:
#   ./scripts/create-pii-scrub-schedule.sh <GITHUB_ORG> [OPTIONS]
#
# Options:
#   --org-id=<id>       Devin org ID to create the schedule in (required)
#   --cron=<expr>       Cron expression (default: "0 9 * * 1" = Monday 9am UTC)
#   --dry-run           Print the API payload without creating the schedule
#   --name=<name>       Custom schedule name (default: "Weekly PII Scrub - <GITHUB_ORG>")
#
# Prerequisites:
#   - DEVIN_API_KEY set to a cog_ enterprise service user key
#   - The operator repo must be accessible to the target Devin org
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/common.sh"

GITHUB_ORG="${1:?Usage: $0 <GITHUB_ORG> --org-id=<devin_org_id> [OPTIONS]}"
shift

DEVIN_ORG_ID=""
CRON_EXPR="0 9 * * 1"
DRY_RUN=false
SCHEDULE_NAME=""

for arg in "$@"; do
  case "$arg" in
    --org-id=*)   DEVIN_ORG_ID="${arg#*=}" ;;
    --cron=*)     CRON_EXPR="${arg#*=}" ;;
    --dry-run)    DRY_RUN=true ;;
    --name=*)     SCHEDULE_NAME="${arg#*=}" ;;
    -h|--help)
      sed -n '2,/^[^#]/{ /^#/s/^# \?//p }' "$0"
      exit 0
      ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

[[ -z "$DEVIN_ORG_ID" ]] && die "--org-id is required"

if [[ -z "$SCHEDULE_NAME" ]]; then
  SCHEDULE_NAME="Weekly PII Scrub - ${GITHUB_ORG}"
fi

PROMPT="Run the PII sanitization script against the ${GITHUB_ORG} GitHub organization.

Steps:
1. Clone the operator repo: git clone https://github.com/Cognition-Partner-Workshops/operator.git
2. Run: ./scripts/sanitize-pr-pii.sh ${GITHUB_ORG}
3. Report the results (repos scanned, edits made)

This removes 'Requested by' PII from all PR descriptions and comments across the org.
The gh CLI must be authenticated with repo + pull-request scopes."

PAYLOAD=$(jq -n \
  --arg name "$SCHEDULE_NAME" \
  --arg prompt "$PROMPT" \
  --arg frequency "$CRON_EXPR" \
  '{
    name: $name,
    prompt: $prompt,
    frequency: $frequency,
    schedule_type: "recurring",
    notify_on: "failure"
  }')

info "Schedule config:"
info "  Name:      ${SCHEDULE_NAME}"
info "  Org:       ${DEVIN_ORG_ID}"
info "  Cron:      ${CRON_EXPR}"
info "  GitHub Org: ${GITHUB_ORG}"

if [[ "$DRY_RUN" == true ]]; then
  info "[DRY-RUN] Would create schedule with payload:"
  echo "$PAYLOAD" | jq .
  exit 0
fi

info "Creating scheduled session..."
RESPONSE=$(api_post "/v3/organizations/${DEVIN_ORG_ID}/schedules" "$PAYLOAD")

SCHEDULE_ID=$(echo "$RESPONSE" | jq -r '.schedule_id // .id // "unknown"')
info "Schedule created: ${SCHEDULE_ID}"
info "The session will run at cron: ${CRON_EXPR}"
echo
echo "$RESPONSE" | jq .
