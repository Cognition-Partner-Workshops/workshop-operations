#!/usr/bin/env bash
# mirror-github-org.sh — Mirror repos from one GitHub org to another.
#
# Creates independent copies (not forks) of each repo. Optionally strips
# .github/workflows/ from all branches so mirrored repos don't trigger
# unrelated CI in the target org.
#
# Usage:
#   ./scripts/mirror-github-org.sh <SOURCE_ORG> <TARGET_ORG> [OPTIONS]
#
# Options:
#   --dry-run              Preview without creating repos
#   --include=<glob>       Only mirror repos matching this pattern (e.g. "uc-*")
#   --exclude=<glob>       Skip repos matching this pattern (repeatable)
#   --skip-existing        Skip repos that already exist in target (default)
#   --no-skip-existing     Overwrite existing repos
#   --visibility=<v>       Target repo visibility: public, private (default: private)
#   --strip-workflows      Remove .github/workflows/ from all branches (default)
#   --no-strip-workflows   Keep workflows as-is
#   --config=<file>        Read repo list from a workshop config JSON instead of listing the source org
#
# Prerequisites:
#   - gh CLI authenticated with admin:org, repo scopes for both orgs
#   - git, jq
#
# Note: This creates independent copies, not git mirrors. Lab-specific changes
# in the target org won't be overwritten by future runs (with --skip-existing).
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
CONFIG_FILE=""

for arg in "$@"; do
  case "$arg" in
    --dry-run)             DRY_RUN=true ;;
    --include=*)           INCLUDE_PATTERN="${INCLUDE_PATTERN:+$INCLUDE_PATTERN|}${arg#*=}" ;;
    --exclude=*)           EXCLUDE_PATTERN="${EXCLUDE_PATTERN:+$EXCLUDE_PATTERN|}${arg#*=}" ;;
    --skip-existing)       SKIP_EXISTING=true ;;
    --no-skip-existing)    SKIP_EXISTING=false ;;
    --visibility=*)        VISIBILITY="${arg#*=}" ;;
    --strip-workflows)     STRIP_WORKFLOWS=true ;;
    --no-strip-workflows)  STRIP_WORKFLOWS=false ;;
    --config=*)            CONFIG_FILE="${arg#*=}" ;;
    -h|--help)
      sed -n '2,/^[^#]/{ /^#/s/^# \?//p }' "$0"
      exit 0
      ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

LOGDIR="./mirror-logs"
mkdir -p "$LOGDIR"
LOGFILE="$(cd "$(dirname "$LOGDIR")" && pwd)/$(basename "$LOGDIR")/mirror-$(date +%Y%m%d-%H%M%S).log"
WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT

log() { echo "[$(date -u +%H:%M:%S)] $*" | tee -a "$LOGFILE"; }

log "=== GitHub Org Mirror ==="
log "Source: ${SOURCE_ORG} -> Target: ${TARGET_ORG}"
log "Visibility: ${VISIBILITY} | Strip workflows: ${STRIP_WORKFLOWS} | Dry run: ${DRY_RUN}"

# ---------------------------------------------------------------------------
# Collect repo names
# ---------------------------------------------------------------------------
REPO_NAMES=()

if [[ -n "$CONFIG_FILE" ]]; then
  log "Reading repos from config: ${CONFIG_FILE}"
  mapfile -t REPO_NAMES < <(jq -r '.repos[] | split("/") | .[1]' "$CONFIG_FILE")
else
  log "Fetching repos from ${SOURCE_ORG}..."
  page=1
  while true; do
    repos=$(gh api "orgs/${SOURCE_ORG}/repos?per_page=100&page=${page}&type=all" \
      --jq '.[].name' 2>/dev/null) || break
    [[ -z "$repos" ]] && break
    while IFS= read -r r; do REPO_NAMES+=("$r"); done <<< "$repos"
    page=$((page + 1))
  done
fi
log "Repos to process: ${#REPO_NAMES[@]}"

# ---------------------------------------------------------------------------
# Collect existing target repos (for skip logic)
# ---------------------------------------------------------------------------
declare -A TARGET_SET
if [[ "$SKIP_EXISTING" == "true" ]]; then
  log "Fetching existing repos in ${TARGET_ORG}..."
  page=1
  while true; do
    repos=$(gh api "orgs/${TARGET_ORG}/repos?per_page=100&page=${page}&type=all" \
      --jq '.[].name' 2>/dev/null) || break
    [[ -z "$repos" ]] && break
    while IFS= read -r r; do TARGET_SET["$r"]=1; done <<< "$repos"
    page=$((page + 1))
  done
  log "Existing repos in target: ${#TARGET_SET[@]}"
fi

# ---------------------------------------------------------------------------
# Filter helpers
# ---------------------------------------------------------------------------
is_filtered_out() {
  local name="$1"
  if [[ -n "$INCLUDE_PATTERN" ]]; then
    # shellcheck disable=SC2254
    case "$name" in $INCLUDE_PATTERN) ;; *) return 0 ;; esac
  fi
  if [[ -n "$EXCLUDE_PATTERN" ]]; then
    # shellcheck disable=SC2254
    case "$name" in $EXCLUDE_PATTERN) return 0 ;; esac
  fi
  return 1
}

# ---------------------------------------------------------------------------
# Mirror loop
# ---------------------------------------------------------------------------
mirrored=0 skipped=0 failed=0

for repo_name in "${REPO_NAMES[@]}"; do
  if is_filtered_out "$repo_name"; then
    log "SKIP (filter): ${repo_name}"
    skipped=$((skipped + 1))
    continue
  fi

  if [[ "$SKIP_EXISTING" == "true" && -n "${TARGET_SET[$repo_name]+x}" ]]; then
    log "SKIP (exists): ${repo_name}"
    skipped=$((skipped + 1))
    continue
  fi

  default_branch=$(gh api "repos/${SOURCE_ORG}/${repo_name}" --jq '.default_branch' 2>/dev/null || echo "main")
  description=$(gh api "repos/${SOURCE_ORG}/${repo_name}" --jq '.description // ""' 2>/dev/null || echo "")

  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY RUN: Would mirror ${repo_name} (branch: ${default_branch})"
    mirrored=$((mirrored + 1))
    continue
  fi

  log "Mirroring: ${repo_name}..."

  clone_dir="${WORK_DIR}/${repo_name}.git"

  # Clone bare from source
  if ! git clone --bare "https://github.com/${SOURCE_ORG}/${repo_name}.git" "$clone_dir" 2>>"$LOGFILE"; then
    log "FAIL (clone): ${repo_name}"
    failed=$((failed + 1))
    continue
  fi

  # Strip workflows from all branches if requested
  if [[ "$STRIP_WORKFLOWS" == "true" ]]; then
    local_dir="${WORK_DIR}/${repo_name}-work"
    git clone "$clone_dir" "$local_dir" 2>>"$LOGFILE"
    cd "$local_dir"

    for remote_branch in $(git branch -r | grep -v HEAD | sed 's|origin/||' | xargs); do
      git branch --track "$remote_branch" "origin/$remote_branch" 2>/dev/null || true
    done

    for branch in $(git branch | sed 's/^[* ]*//' | xargs); do
      git checkout "$branch" 2>>"$LOGFILE" || continue
      if [[ -d ".github/workflows" ]]; then
        rm -rf ".github/workflows"
        git add -A && git commit -m "Remove CI workflows for workshop mirror" 2>>"$LOGFILE" || true
      fi
    done

    git checkout "$default_branch" 2>>"$LOGFILE"
    cd - >/dev/null

    rm -rf "$clone_dir"
    git clone --bare "$local_dir" "$clone_dir" 2>>"$LOGFILE"
    rm -rf "$local_dir"
  fi

  # Create target repo
  if ! gh api "orgs/${TARGET_ORG}/repos" \
    -X POST \
    -f name="$repo_name" \
    -f description="$description" \
    -f visibility="$VISIBILITY" \
    -F auto_init=false \
    --silent 2>>"$LOGFILE"; then
    log "FAIL (create): ${repo_name}"
    failed=$((failed + 1))
    rm -rf "$clone_dir"
    continue
  fi

  # Push all branches and tags
  cd "$clone_dir"
  if ! git push --mirror "https://github.com/${TARGET_ORG}/${repo_name}.git" 2>>"$LOGFILE"; then
    log "FAIL (push): ${repo_name}"
    failed=$((failed + 1))
    cd - >/dev/null
    rm -rf "$clone_dir"
    continue
  fi
  cd - >/dev/null

  rm -rf "$clone_dir"
  log "OK: ${repo_name}"
  mirrored=$((mirrored + 1))

  sleep 0.5
done

log ""
log "=== Mirror Summary ==="
log "Mirrored: ${mirrored} | Skipped: ${skipped} | Failed: ${failed}"
log "Log: ${LOGFILE}"
