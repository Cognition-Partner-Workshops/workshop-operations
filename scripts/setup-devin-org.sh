#!/usr/bin/env bash
# setup-devin-org.sh — Create and configure a Devin Enterprise org for a workshop event.
#
# Usage:
#   ./scripts/setup-devin-org.sh <ORG_NAME> [OPTIONS]
#
# Options:
#   --api-url=<url>           Devin API base URL (default: https://api.devin.ai)
#   --max-session-acu=<n>     Max ACUs per session (default: none)
#   --max-cycle-acu=<n>       Max ACUs per billing cycle (default: none)
#   --git-connection-id=<id>  Git connection ID to grant repo access
#   --github-org=<org>        GitHub org to grant access to (creates prefix_path permission)
#   --dry-run                 Preview what would be created
#
# Environment:
#   DEVIN_API_KEY    Required. Service user API key (prefix: cog_)
#
# Prerequisites:
#   - Service user with ManageOrganizations + ManageGitIntegrations permissions
#   - jq installed
#   - curl installed

set -euo pipefail

ORG_NAME="${1:?Usage: $0 <ORG_NAME> [OPTIONS]}"
shift

API_URL="https://api.devin.ai"
MAX_SESSION_ACU=""
MAX_CYCLE_ACU=""
GIT_CONNECTION_ID=""
GITHUB_ORG=""
DRY_RUN=false

for arg in "$@"; do
  case "$arg" in
    --api-url=*)           API_URL="${arg#*=}" ;;
    --max-session-acu=*)   MAX_SESSION_ACU="${arg#*=}" ;;
    --max-cycle-acu=*)     MAX_CYCLE_ACU="${arg#*=}" ;;
    --git-connection-id=*) GIT_CONNECTION_ID="${arg#*=}" ;;
    --github-org=*)        GITHUB_ORG="${arg#*=}" ;;
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

echo "=== Devin Enterprise Org Setup ==="
echo "Org name: $ORG_NAME"
echo "API URL:  $API_URL"
echo "Dry run:  $DRY_RUN"
echo ""

# Build org creation payload
ORG_PAYLOAD=$(jq -n \
  --arg name "$ORG_NAME" \
  '{name: $name}')

if [ -n "$MAX_CYCLE_ACU" ]; then
  ORG_PAYLOAD=$(echo "$ORG_PAYLOAD" | jq --argjson v "$MAX_CYCLE_ACU" '. + {max_cycle_acu_limit: $v}')
fi
if [ -n "$MAX_SESSION_ACU" ]; then
  ORG_PAYLOAD=$(echo "$ORG_PAYLOAD" | jq --argjson v "$MAX_SESSION_ACU" '. + {max_session_acu_limit: $v}')
fi

if [ "$DRY_RUN" = true ]; then
  echo "DRY RUN: Would create org with payload:"
  echo "$ORG_PAYLOAD" | jq .
  echo ""
  if [ -n "$GIT_CONNECTION_ID" ] && [ -n "$GITHUB_ORG" ]; then
    echo "DRY RUN: Would grant git permissions for $GITHUB_ORG"
  fi
  exit 0
fi

# Create the org
echo "Creating org: $ORG_NAME..."
RESULT=$(api POST "/enterprise/organizations" -d "$ORG_PAYLOAD")
ORG_ID=$(echo "$RESULT" | jq -r '.org_id // empty')

if [ -z "$ORG_ID" ]; then
  echo "ERROR: Failed to create org. Response:"
  echo "$RESULT" | jq .
  exit 1
fi

echo "Created org: $ORG_ID"
echo "$RESULT" | jq .
echo ""

# Grant git permissions if specified
if [ -n "$GIT_CONNECTION_ID" ] && [ -n "$GITHUB_ORG" ]; then
  echo "Granting git permissions for $GITHUB_ORG..."
  PERM_PAYLOAD=$(jq -n \
    --arg conn_id "$GIT_CONNECTION_ID" \
    --arg prefix "$GITHUB_ORG" \
    '{permissions: [{git_connection_id: $conn_id, prefix_path: $prefix}]}')

  PERM_RESULT=$(api POST "/enterprise/organizations/$ORG_ID/git-providers/permissions" -d "$PERM_PAYLOAD")
  echo "Git permissions result:"
  echo "$PERM_RESULT" | jq .
  echo ""
fi

echo "=== Org setup complete ==="
echo "Org ID:   $ORG_ID"
echo "Org Name: $ORG_NAME"
echo ""
echo "Next steps:"
echo "  1. Invite participants:  ./scripts/invite-participants.sh $ORG_ID participant-emails.txt"
echo "  2. Set up repos on Devin: ./scripts/setup-repos-on-devin.sh $ORG_ID <GITHUB_ORG>"
echo "  3. Create playbooks/knowledge as needed"

# Write org info for downstream scripts
echo "$ORG_ID" > ".last-created-org-id"
