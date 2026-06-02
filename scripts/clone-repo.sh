#!/usr/bin/env bash
# clone-repo.sh — Create a private copy of a single public repo
#
# Takes the name of a repo in the source GitHub org and creates an independent
# private copy in the target org.  This is the single-repo equivalent of
# mirror-github-org.sh — intended to be called by a local AI coding agent or
# a facilitator setting up individual repos on demand.
#
# Usage:
#   ./scripts/clone-repo.sh <REPO_NAME> [OPTIONS]
#
# Positional:
#   REPO_NAME              Name of the repo to copy (just the repo name, not org/repo)
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
#   # Clone a single use-case repo
#   ./scripts/clone-repo.sh uc-bdd-test-generation-rest-api
#
#   # Clone to a different target org on GHES
#   ./scripts/clone-repo.sh otterworks --target-org=MyPrivateOrg --target-host=ghes.example.com
#
#   # Preview
#   ./scripts/clone-repo.sh otterworks --dry-run
set -euo pipefail

REPO_NAME="${1:?Usage: $0 <REPO_NAME> [OPTIONS]}"
shift

SOURCE_ORG="Cognition-Partner-Workshops"
TARGET_ORG="Cognition-Partner-Workshops-mirror"
SOURCE_HOST="github.com"
TARGET_HOST="github.com"
VISIBILITY="private"
STRIP_WORKFLOWS=true
SKIP_EXISTING=true
DRY_RUN=false

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
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

# Refuse to copy repos that should not be mirrored directly
BLOCKED_REPOS="workshop-metadata"
for blocked in $BLOCKED_REPOS; do
  if [[ "$REPO_NAME" == "$blocked" ]]; then
    echo "ERROR: '${REPO_NAME}' should not be cloned directly." >&2
    echo "  Its hyperlinks reference source org URLs that would be broken in a mirror." >&2
    echo "  Instead, use a local AI coding agent with the prompt in" >&2
    echo "  templates/agent-prompt-setup-event.md to selectively copy relevant content." >&2
    exit 1
  fi
done

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

log "=== Clone Repo ==="
log "Source: ${SOURCE_ORG}/${REPO_NAME} (${SOURCE_HOST})"
log "Target: ${TARGET_ORG}/${REPO_NAME} (${TARGET_HOST})"
log "Visibility: ${VISIBILITY} | Strip workflows: ${STRIP_WORKFLOWS} | Dry run: ${DRY_RUN}"

# ---------------------------------------------------------------------------
# Check if target already exists
# ---------------------------------------------------------------------------
if [[ "$SKIP_EXISTING" == "true" ]]; then
  if target_api "repos/${TARGET_ORG}/${REPO_NAME}" --silent >/dev/null 2>&1; then
    log "SKIP: ${REPO_NAME} already exists in ${TARGET_ORG}"
    exit 0
  fi
fi

# ---------------------------------------------------------------------------
# Fetch source metadata
# ---------------------------------------------------------------------------
default_branch=$(source_api "repos/${SOURCE_ORG}/${REPO_NAME}" --jq '.default_branch' 2>/dev/null || echo "main")
description=$(source_api "repos/${SOURCE_ORG}/${REPO_NAME}" --jq '.description // ""' 2>/dev/null || echo "")

if [[ "$DRY_RUN" == "true" ]]; then
  log "DRY RUN: Would clone ${REPO_NAME} (branch: ${default_branch})"
  exit 0
fi

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT

# ---------------------------------------------------------------------------
# Clone, optionally strip workflows, create target, push
# ---------------------------------------------------------------------------
log "Cloning ${REPO_NAME} from ${SOURCE_ORG}..."
clone_dir="${WORK_DIR}/${REPO_NAME}.git"
git clone --bare "$(source_git_url "$REPO_NAME")" "$clone_dir" 2>&1

if [[ "$STRIP_WORKFLOWS" == "true" ]]; then
  local_dir="${WORK_DIR}/${REPO_NAME}-work"
  git clone "$clone_dir" "$local_dir" 2>&1
  cd "$local_dir"

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
  cd - >/dev/null

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
  exit 1
fi

log "Pushing all branches and tags..."
cd "$clone_dir"
if ! git push --mirror "$(target_git_url "$REPO_NAME")" 2>&1; then
  log "FAIL: Could not push to ${TARGET_ORG}/${REPO_NAME}"
  exit 1
fi
cd - >/dev/null

log "OK: ${TARGET_ORG}/${REPO_NAME} created successfully"
