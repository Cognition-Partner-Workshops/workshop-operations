#!/usr/bin/env bash
# clone-repo.sh — Create private copies of one or more public repos
#
# Takes one or more repo names from the source GitHub org and creates
# independent private copies in the target org.  This is the single-/multi-repo
# equivalent of mirror-github-org.sh — intended to be called by a local AI
# coding agent or a facilitator setting up repos on demand.
#
# Usage:
#   ./scripts/clone-repo.sh <REPO_NAME>... [OPTIONS]
#
# Positional:
#   REPO_NAME...           One or more repo names (just repo name, not org/repo)
#
# Options:
#   --source-org=<org>     Source GitHub org (default: Cognition-Partner-Workshops)
#   --target-org=<org>     Target GitHub org (default: Cognition-Partner-Workshops-mirror)
#   --source-host=<host>   GitHub hostname for the source (default: github.com)
#   --target-host=<host>   GitHub hostname for the target (default: github.com)
#   --visibility=<v>       Target repo visibility: public, private (default: private)
#   --strip-workflows      Remove .github/workflows/ from all branches (default)
#   --no-strip-workflows   Keep workflows as-is
#   --skip-existing        Skip if the repo already exists in target (default)
#   --no-skip-existing     Overwrite if it already exists
#   --dry-run              Preview without creating anything
#
# Prerequisites:
#   - gh CLI authenticated with admin:org, repo scopes
#   - git, jq
#
# Examples:
#   # Clone a single repo
#   ./scripts/clone-repo.sh uc-bdd-test-generation-rest-api
#
#   # Clone multiple repos in one command
#   ./scripts/clone-repo.sh otterworks uc-bdd-test-generation-rest-api ts-angular-realworld-example-app
#
#   # Clone to a different target org on GHES
#   ./scripts/clone-repo.sh otterworks --target-org=MyPrivateOrg --target-host=ghes.example.com
#
#   # Preview without creating anything
#   ./scripts/clone-repo.sh otterworks ts-angular-realworld-example-app --dry-run
set -euo pipefail

SOURCE_ORG="Cognition-Partner-Workshops"
TARGET_ORG="Cognition-Partner-Workshops-mirror"
SOURCE_HOST="github.com"
TARGET_HOST="github.com"
VISIBILITY="private"
STRIP_WORKFLOWS=true
SKIP_EXISTING=true
DRY_RUN=false

REPO_NAMES=()

for arg in "$@"; do
  case "$arg" in
    --source-org=*)       SOURCE_ORG="${arg#*=}" ;;
    --target-org=*)       TARGET_ORG="${arg#*=}" ;;
    --source-host=*)      SOURCE_HOST="${arg#*=}" ;;
    --target-host=*)      TARGET_HOST="${arg#*=}" ;;
    --visibility=*)       VISIBILITY="${arg#*=}" ;;
    --strip-workflows)    STRIP_WORKFLOWS=true ;;
    --no-strip-workflows) STRIP_WORKFLOWS=false ;;
    --skip-existing)      SKIP_EXISTING=true ;;
    --no-skip-existing)   SKIP_EXISTING=false ;;
    --dry-run)            DRY_RUN=true ;;
    -h|--help)
      sed -n '2,/^[^#]/{ /^#/s/^# \?//p }' "$0"
      exit 0
      ;;
    -*)
      echo "Unknown option: $arg" >&2; exit 1 ;;
    *)
      REPO_NAMES+=("$arg") ;;
  esac
done

if [[ ${#REPO_NAMES[@]} -eq 0 ]]; then
  echo "Usage: $0 <REPO_NAME>... [OPTIONS]" >&2
  echo "  Pass one or more repo names. Run with --help for details." >&2
  exit 1
fi

# Repos that should not be mirrored directly
BLOCKED_REPOS="workshop-metadata"

log() { echo "[$(date -u +%H:%M:%S)] $*"; }

source_api() { gh api --hostname "$SOURCE_HOST" "$@"; }
target_api() { gh api --hostname "$TARGET_HOST" "$@"; }

source_git_url() { echo "https://${SOURCE_HOST}/${SOURCE_ORG}/${1}.git"; }
target_git_url() { echo "https://${TARGET_HOST}/${TARGET_ORG}/${1}.git"; }

# ---------------------------------------------------------------------------
# Pre-flight
# ---------------------------------------------------------------------------
for host in "$SOURCE_HOST" "$TARGET_HOST"; do
  if ! gh auth status --hostname "$host" >/dev/null 2>&1; then
    log "ERROR: gh CLI is not authenticated to ${host}"
    log "  Run: gh auth login --hostname ${host}"
    exit 1
  fi
done

log "=== Clone Repos ==="
log "Repos:  ${REPO_NAMES[*]}"
log "Source: ${SOURCE_ORG} (${SOURCE_HOST})"
log "Target: ${TARGET_ORG} (${TARGET_HOST})"
log "Visibility: ${VISIBILITY} | Strip workflows: ${STRIP_WORKFLOWS} | Dry run: ${DRY_RUN}"
log ""

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT

OK_COUNT=0
SKIP_COUNT=0
FAIL_COUNT=0
BLOCKED_COUNT=0

# ---------------------------------------------------------------------------
# Process each repo
# ---------------------------------------------------------------------------
for REPO_NAME in "${REPO_NAMES[@]}"; do
  log "--- ${REPO_NAME} ---"

  # Check blocked list
  is_blocked=false
  for blocked in $BLOCKED_REPOS; do
    if [[ "$REPO_NAME" == "$blocked" ]]; then
      is_blocked=true
      break
    fi
  done
  if [[ "$is_blocked" == "true" ]]; then
    log "BLOCKED: '${REPO_NAME}' should not be cloned directly."
    log "  Its hyperlinks reference source org URLs that would be broken in a mirror."
    log "  Instead, use a local AI coding agent with the prompt in"
    log "  templates/agent-prompt-setup-event.md to selectively copy relevant content."
    BLOCKED_COUNT=$((BLOCKED_COUNT + 1))
    continue
  fi

  # Check if target already exists
  if [[ "$SKIP_EXISTING" == "true" ]]; then
    if target_api "repos/${TARGET_ORG}/${REPO_NAME}" --silent >/dev/null 2>&1; then
      log "SKIP: ${REPO_NAME} already exists in ${TARGET_ORG}"
      SKIP_COUNT=$((SKIP_COUNT + 1))
      continue
    fi
  fi

  # Fetch source metadata
  default_branch=$(source_api "repos/${SOURCE_ORG}/${REPO_NAME}" --jq '.default_branch' 2>/dev/null || echo "main")
  description=$(source_api "repos/${SOURCE_ORG}/${REPO_NAME}" --jq '.description // ""' 2>/dev/null || echo "")

  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY RUN: Would clone ${REPO_NAME} (branch: ${default_branch})"
    OK_COUNT=$((OK_COUNT + 1))
    continue
  fi

  # Clone, optionally strip workflows, create target, push
  log "Cloning ${REPO_NAME} from ${SOURCE_ORG}..."
  clone_dir="${WORK_DIR}/${REPO_NAME}.git"
  if ! git clone --bare "$(source_git_url "$REPO_NAME")" "$clone_dir" 2>&1; then
    log "FAIL: Could not clone ${SOURCE_ORG}/${REPO_NAME}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    continue
  fi

  if [[ "$STRIP_WORKFLOWS" == "true" ]]; then
    local_dir="${WORK_DIR}/${REPO_NAME}-work"
    git clone "$clone_dir" "$local_dir" 2>&1
    pushd "$local_dir" >/dev/null

    for remote_branch in $(git branch -r | grep -v HEAD | sed 's|origin/||' | xargs); do
      git branch --track "$remote_branch" "origin/$remote_branch" 2>/dev/null || true
    done

    for branch in $(git branch | sed 's/^[* ]*//' | xargs); do
      git checkout "$branch" 2>&1 || continue
      if [[ -d ".github/workflows" ]]; then
        rm -rf ".github/workflows"
        git add -A && git commit -m "Remove CI workflows for workshop mirror" 2>&1 || true
      fi
    done

    git checkout "$default_branch" 2>&1
    popd >/dev/null

    rm -rf "$clone_dir"
    git clone --bare "$local_dir" "$clone_dir" 2>&1
    rm -rf "$local_dir"
  fi

  log "Creating ${TARGET_ORG}/${REPO_NAME} (${VISIBILITY})..."
  if ! target_api "orgs/${TARGET_ORG}/repos" \
    -X POST \
    -f name="$REPO_NAME" \
    -f description="$description" \
    -f visibility="$VISIBILITY" \
    -F auto_init=false \
    --silent 2>&1; then
    log "FAIL: Could not create ${TARGET_ORG}/${REPO_NAME}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    rm -rf "$clone_dir"
    continue
  fi

  log "Pushing all branches and tags..."
  pushd "$clone_dir" >/dev/null
  if ! git push --mirror "$(target_git_url "$REPO_NAME")" 2>&1; then
    log "FAIL: Could not push to ${TARGET_ORG}/${REPO_NAME}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    popd >/dev/null
    rm -rf "$clone_dir"
    continue
  fi
  popd >/dev/null

  rm -rf "$clone_dir"
  log "OK: ${TARGET_ORG}/${REPO_NAME}"
  OK_COUNT=$((OK_COUNT + 1))
done

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
log ""
log "=== Summary ==="
log "  OK:      ${OK_COUNT}"
log "  Skipped: ${SKIP_COUNT}"
log "  Blocked: ${BLOCKED_COUNT}"
log "  Failed:  ${FAIL_COUNT}"
log "  Total:   ${#REPO_NAMES[@]}"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  exit 1
fi
