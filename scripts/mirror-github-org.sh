#!/usr/bin/env bash
# mirror-github-org.sh — Mirror all repos from one GitHub org to another.
#
# Usage:
#   ./scripts/mirror-github-org.sh <SOURCE_ORG> <TARGET_ORG> [OPTIONS]
#
# Options:
#   --dry-run           Preview what would be mirrored without creating repos
#   --include=<pattern> Only mirror repos matching this glob pattern (e.g. "uc-*")
#   --exclude=<pattern> Skip repos matching this glob pattern (e.g. "*.github.io")
#   --skip-existing     Skip repos that already exist in the target org (default: true)
#   --visibility=<v>    Set target repo visibility: public, private, internal (default: private)
#   --strip-workflows   Remove .github/workflows/ from mirrored repos (default: true)
#
# Prerequisites:
#   - gh CLI authenticated with admin:org, repo scopes for both orgs
#   - jq installed
#   - git installed
#
# This script does NOT set up git mirrors (which would overwrite lab-specific changes).
# Each target repo gets an independent copy. Add an upstream remote manually if needed:
#   git remote add upstream <source_url> && git fetch upstream

set -euo pipefail

SOURCE_ORG="${1:?Usage: $0 <SOURCE_ORG> <TARGET_ORG> [OPTIONS]}"
TARGET_ORG="${2:?Usage: $0 <SOURCE_ORG> <TARGET_ORG> [OPTIONS]}"
shift 2

DRY_RUN=false
INCLUDE_PATTERN=""
EXCLUDE_PATTERN=""
SKIP_EXISTING=true
VISIBILITY="private"
STRIP_WORKFLOWS=true

for arg in "$@"; do
  case "$arg" in
    --dry-run)           DRY_RUN=true ;;
    --include=*)         INCLUDE_PATTERN="${arg#*=}" ;;
    --exclude=*)         EXCLUDE_PATTERN="${arg#*=}" ;;
    --skip-existing)     SKIP_EXISTING=true ;;
    --no-skip-existing)  SKIP_EXISTING=false ;;
    --visibility=*)      VISIBILITY="${arg#*=}" ;;
    --strip-workflows)   STRIP_WORKFLOWS=true ;;
    --no-strip-workflows) STRIP_WORKFLOWS=false ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

LOGDIR="./mirror-logs"
mkdir -p "$LOGDIR"
LOGFILE="$LOGDIR/mirror-$(date +%Y%m%d-%H%M%S).log"
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

log() { echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOGFILE"; }

log "=== GitHub Org Mirror ==="
log "Source: $SOURCE_ORG -> Target: $TARGET_ORG"
log "Visibility: $VISIBILITY | Strip workflows: $STRIP_WORKFLOWS | Dry run: $DRY_RUN"
[ -n "$INCLUDE_PATTERN" ] && log "Include: $INCLUDE_PATTERN"
[ -n "$EXCLUDE_PATTERN" ] && log "Exclude: $EXCLUDE_PATTERN"
log ""

# Collect all source repos (paginated)
log "Fetching repos from $SOURCE_ORG..."
SOURCE_REPOS=()
page=1
while true; do
  repos=$(gh api "orgs/$SOURCE_ORG/repos?per_page=100&page=$page&type=all" \
    --jq '.[].name' 2>/dev/null) || break
  [ -z "$repos" ] && break
  while IFS= read -r repo; do
    SOURCE_REPOS+=("$repo")
  done <<< "$repos"
  page=$((page + 1))
done
log "Found ${#SOURCE_REPOS[@]} repos in $SOURCE_ORG"

# Collect existing target repos for skip logic
if [ "$SKIP_EXISTING" = true ]; then
  log "Fetching existing repos in $TARGET_ORG..."
  TARGET_EXISTING=()
  page=1
  while true; do
    repos=$(gh api "orgs/$TARGET_ORG/repos?per_page=100&page=$page&type=all" \
      --jq '.[].name' 2>/dev/null) || break
    [ -z "$repos" ] && break
    while IFS= read -r repo; do
      TARGET_EXISTING+=("$repo")
    done <<< "$repos"
    page=$((page + 1))
  done
  log "Found ${#TARGET_EXISTING[@]} existing repos in $TARGET_ORG"
fi

is_excluded() {
  local name="$1"
  if [ -n "$INCLUDE_PATTERN" ]; then
    # shellcheck disable=SC2254
    case "$name" in $INCLUDE_PATTERN) ;; *) return 0 ;; esac
  fi
  if [ -n "$EXCLUDE_PATTERN" ]; then
    # shellcheck disable=SC2254
    case "$name" in $EXCLUDE_PATTERN) return 0 ;; esac
  fi
  return 1
}

target_exists() {
  local name="$1"
  if [ "$SKIP_EXISTING" = true ]; then
    for existing in "${TARGET_EXISTING[@]}"; do
      [ "$existing" = "$name" ] && return 0
    done
  fi
  return 1
}

mirrored=0
skipped=0
failed=0

for repo_name in "${SOURCE_REPOS[@]}"; do
  if is_excluded "$repo_name"; then
    log "SKIP (filter): $repo_name"
    skipped=$((skipped + 1))
    continue
  fi

  if target_exists "$repo_name"; then
    log "SKIP (exists): $repo_name"
    skipped=$((skipped + 1))
    continue
  fi

  # Get source repo metadata
  description=$(gh api "repos/$SOURCE_ORG/$repo_name" --jq '.description // ""' 2>/dev/null || echo "")
  default_branch=$(gh api "repos/$SOURCE_ORG/$repo_name" --jq '.default_branch' 2>/dev/null || echo "main")

  if [ "$DRY_RUN" = true ]; then
    log "DRY RUN: Would mirror $repo_name (branch: $default_branch)"
    mirrored=$((mirrored + 1))
    continue
  fi

  log "Mirroring: $repo_name..."

  # Clone bare from source
  clone_dir="$TMPDIR/$repo_name"
  if ! git clone --bare "https://github.com/$SOURCE_ORG/$repo_name.git" "$clone_dir" 2>>"$LOGFILE"; then
    log "FAIL (clone): $repo_name"
    failed=$((failed + 1))
    continue
  fi

  # Strip workflows if configured
  if [ "$STRIP_WORKFLOWS" = true ]; then
    work_dir="$TMPDIR/${repo_name}-work"
    git clone "$clone_dir" "$work_dir" 2>>"$LOGFILE"
    if [ -d "$work_dir/.github/workflows" ]; then
      rm -rf "$work_dir/.github/workflows"
      cd "$work_dir"
      # Create local branches for all remote branches to preserve them
      for remote_branch in $(git branch -r | grep -v HEAD | sed 's|origin/||'); do
        git branch --track "$remote_branch" "origin/$remote_branch" 2>/dev/null || true
      done
      git add -A && git commit -m "Remove CI workflows for workshop mirror" --allow-empty 2>>"$LOGFILE" || true
      cd - >/dev/null
      # Rebuild the bare clone with all branches preserved
      rm -rf "$clone_dir"
      git clone --bare "$work_dir" "$clone_dir" 2>>"$LOGFILE"
    fi
    rm -rf "$work_dir"
  fi

  # Create target repo
  if ! gh api "orgs/$TARGET_ORG/repos" \
    -X POST \
    -f name="$repo_name" \
    -f description="$description" \
    -f visibility="$VISIBILITY" \
    -F auto_init=false \
    --silent 2>>"$LOGFILE"; then
    log "FAIL (create): $repo_name"
    failed=$((failed + 1))
    rm -rf "$clone_dir"
    continue
  fi

  # Push all branches and tags
  cd "$clone_dir"
  if ! git push --mirror "https://github.com/$TARGET_ORG/$repo_name.git" 2>>"$LOGFILE"; then
    log "FAIL (push): $repo_name"
    failed=$((failed + 1))
    cd - >/dev/null
    rm -rf "$clone_dir"
    continue
  fi
  cd - >/dev/null

  rm -rf "$clone_dir"
  log "OK: $repo_name"
  mirrored=$((mirrored + 1))

  sleep 0.5
done

log ""
log "=== Mirror Summary ==="
log "Mirrored: $mirrored | Skipped: $skipped | Failed: $failed"
log "Log: $LOGFILE"
