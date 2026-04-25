#!/usr/bin/env bash
# setup-repos-on-devin.sh — Trigger Devin sessions to set up repos in an org.
#
# Creates a Devin session per repo that installs dependencies, runs build/tests,
# and captures the working environment config as a reusable .yaml.
#
# Usage:
#   ./scripts/setup-repos-on-devin.sh <ORG_ID> <GITHUB_ORG> [OPTIONS]
#
# Options:
#   --repos=<list>          Comma-separated repo names (default: all repos in the GH org)
#   --repos-file=<file>     File with repo names (one per line)
#   --create-as-user=<id>   User ID to impersonate (sessions appear in their list)
#   --max-parallel=<n>      Max concurrent setup sessions (default: 5)
#   --api-url=<url>         Devin API base URL (default: https://api.devin.ai)
#   --dry-run               Preview what sessions would be created
#
# Environment:
#   DEVIN_API_KEY    Required. Service user API key (prefix: cog_)

set -euo pipefail

ORG_ID="${1:?Usage: $0 <ORG_ID> <GITHUB_ORG> [OPTIONS]}"
GITHUB_ORG="${2:?Usage: $0 <ORG_ID> <GITHUB_ORG> [OPTIONS]}"
shift 2

API_URL="https://api.devin.ai"
REPOS_LIST=""
REPOS_FILE=""
CREATE_AS_USER=""
MAX_PARALLEL=5
DRY_RUN=false

for arg in "$@"; do
  case "$arg" in
    --repos=*)           REPOS_LIST="${arg#*=}" ;;
    --repos-file=*)      REPOS_FILE="${arg#*=}" ;;
    --create-as-user=*)  CREATE_AS_USER="${arg#*=}" ;;
    --max-parallel=*)    MAX_PARALLEL="${arg#*=}" ;;
    --api-url=*)         API_URL="${arg#*=}" ;;
    --dry-run)           DRY_RUN=true ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

: "${DEVIN_API_KEY:?Set DEVIN_API_KEY to your service user API key (prefix: cog_)}"

LOGDIR="./setup-logs"
mkdir -p "$LOGDIR"
LOGFILE="$LOGDIR/setup-$(date +%Y%m%d-%H%M%S).log"

log() { echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOGFILE"; }

# Collect repos to set up
REPOS=()
if [ -n "$REPOS_LIST" ]; then
  IFS=',' read -ra REPOS <<< "$REPOS_LIST"
elif [ -n "$REPOS_FILE" ] && [ -f "$REPOS_FILE" ]; then
  while IFS= read -r line; do
    line=$(echo "$line" | xargs)
    [ -n "$line" ] && [[ ! "$line" =~ ^# ]] && REPOS+=("$line")
  done < "$REPOS_FILE"
else
  # Fetch all repos from the GitHub org
  log "Fetching all repos from $GITHUB_ORG..."
  page=1
  while true; do
    repos=$(gh api "orgs/$GITHUB_ORG/repos?per_page=100&page=$page&type=all" \
      --jq '.[].name' 2>/dev/null) || break
    [ -z "$repos" ] && break
    while IFS= read -r repo; do
      REPOS+=("$repo")
    done <<< "$repos"
    page=$((page + 1))
  done
fi

log "=== Devin Repo Setup ==="
log "Org ID:     $ORG_ID"
log "GitHub Org: $GITHUB_ORG"
log "Repos:      ${#REPOS[@]}"
log "Parallel:   $MAX_PARALLEL"
log "Dry run:    $DRY_RUN"
log ""

SETUP_PROMPT_TEMPLATE='Set up the %s/%s repository from scratch: install dependencies, get the build and tests working. Then capture the working setup steps in the .yaml environment configuration.

Should we get the app running: yes'

created=0
failed=0
active_sessions=()

create_session() {
  local repo_name="$1"
  local prompt
  prompt=$(printf "$SETUP_PROMPT_TEMPLATE" "$GITHUB_ORG" "$repo_name")

  local payload
  payload=$(jq -n \
    --arg prompt "$prompt" \
    --arg title "Setup: $GITHUB_ORG/$repo_name" \
    '{prompt: $prompt, title: $title, tags: ["workshop-setup", "repo-setup"]}')

  if [ -n "$CREATE_AS_USER" ]; then
    payload=$(echo "$payload" | jq --arg uid "$CREATE_AS_USER" '. + {create_as_user_id: $uid}')
  fi

  local result
  result=$(curl -s -X POST \
    "${API_URL}/v3/organizations/${ORG_ID}/sessions" \
    -H "Authorization: Bearer $DEVIN_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload")

  local session_id
  session_id=$(echo "$result" | jq -r '.session_id // empty')
  local session_url
  session_url=$(echo "$result" | jq -r '.url // empty')

  if [ -n "$session_id" ]; then
    log "OK: $repo_name -> $session_url"
    active_sessions+=("$session_id")
    created=$((created + 1))
  else
    log "FAIL: $repo_name"
    log "  Response: $(echo "$result" | jq -c .)"
    failed=$((failed + 1))
  fi
}

for repo_name in "${REPOS[@]}"; do
  if [ "$DRY_RUN" = true ]; then
    log "DRY RUN: Would create setup session for $GITHUB_ORG/$repo_name"
    created=$((created + 1))
    continue
  fi

  create_session "$repo_name"

  # Throttle to max parallel
  if [ ${#active_sessions[@]} -ge "$MAX_PARALLEL" ]; then
    log "Throttling: waiting 10s before next batch..."
    sleep 10
    active_sessions=()
  fi

  sleep 1
done

log ""
log "=== Setup Summary ==="
log "Created: $created | Failed: $failed"
log "Log: $LOGFILE"
log ""
log "Monitor sessions in the Devin dashboard or via API:"
log "  curl -s '${API_URL}/v3/organizations/${ORG_ID}/sessions' \\"
log "    -H 'Authorization: Bearer \$DEVIN_API_KEY' | jq '.[] | {title, status}'"
