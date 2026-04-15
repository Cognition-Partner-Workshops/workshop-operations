#!/usr/bin/env bash
# clone-all.sh — Mirror every Cognition-Partner-Workshops repo into a target GitHub org.
#
# Reads the canonical repo list from workshop-metadata/catalog/upstream-map.yaml
# (fetched from GitHub at runtime) and creates mirror copies in the specified
# target organization.
#
# Prerequisites
# -------------
#   - gh   CLI, authenticated with repo-create + push permissions in the target org
#   - git
#   - python3 with PyYAML  (pip install pyyaml)
#
# Usage
# -----
#   ./clone-all.sh --target-org <org> [options]
#
# Examples
# --------
#   # Dry run — see what would happen
#   ./clone-all.sh --target-org my-company --dry-run
#
#   # Clone everything as private repos, skip any that already exist
#   ./clone-all.sh --target-org my-company --skip-existing
#
#   # Clone as public repos
#   ./clone-all.sh --target-org my-company --visibility public
#
#   # Also clone the bootstrap repo itself
#   ./clone-all.sh --target-org my-company --include-bootstrap

set -euo pipefail

# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------
SOURCE_ORG="Cognition-Partner-Workshops"
METADATA_REPO="workshop-metadata"
METADATA_REF="main"
UPSTREAM_MAP_PATH="catalog/upstream-map.yaml"

TARGET_ORG=""
VISIBILITY="private"
DRY_RUN=false
SKIP_EXISTING=false
INCLUDE_BOOTSTRAP=false
WORKDIR=""

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
usage() {
  cat <<EOF
Usage: $(basename "$0") --target-org <org> [options]

Mirror all Cognition-Partner-Workshops repos into a target GitHub organization.

Required:
  --target-org <org>        Target GitHub organization

Options:
  --source-org <org>        Source GitHub organization   (default: $SOURCE_ORG)
  --visibility <v>          private | public | internal  (default: $VISIBILITY)
  --metadata-ref <ref>      Git ref for upstream-map.yaml (default: $METADATA_REF)
  --include-bootstrap       Also clone the bootstrap repo
  --skip-existing           Skip repos that already exist in the target org
  --dry-run                 Show what would be done without doing it
  -h, --help                Show this message
EOF
  exit 0
}

die()  { echo "ERROR: $*" >&2; exit 1; }
info() { echo "==> $*"; }
warn() { echo "WARNING: $*" >&2; }

cleanup() {
  if [[ -n "${WORKDIR}" && -d "${WORKDIR}" ]]; then
    rm -rf "${WORKDIR}"
  fi
}
trap cleanup EXIT

# ---------------------------------------------------------------------------
# Dependency checks
# ---------------------------------------------------------------------------
check_deps() {
  local missing=()
  command -v git     >/dev/null 2>&1 || missing+=("git")
  command -v gh      >/dev/null 2>&1 || missing+=("gh (GitHub CLI)")
  command -v python3 >/dev/null 2>&1 || missing+=("python3")

  if (( ${#missing[@]} )); then
    die "Missing required tools: ${missing[*]}"
  fi

  python3 -c "import yaml" 2>/dev/null \
    || die "Python package 'PyYAML' is required. Install with: pip install pyyaml"

  # Verify gh is authenticated
  gh auth status >/dev/null 2>&1 \
    || die "gh CLI is not authenticated. Run: gh auth login"
}

# ---------------------------------------------------------------------------
# Fetch the canonical repo list from upstream-map.yaml
# ---------------------------------------------------------------------------
fetch_repo_names() {
  info "Fetching repo list from ${SOURCE_ORG}/${METADATA_REPO}@${METADATA_REF}" >&2

  local yaml_content
  yaml_content=$(gh api "repos/${SOURCE_ORG}/${METADATA_REPO}/contents/${UPSTREAM_MAP_PATH}?ref=${METADATA_REF}" \
    --jq '.content' | base64 --decode) \
    || die "Failed to fetch upstream-map.yaml — check that ${SOURCE_ORG}/${METADATA_REPO} is accessible"

  python3 -c "
import yaml, sys, json

data = yaml.safe_load(sys.stdin)
repos = sorted(data.get('repos', {}).keys())
for r in repos:
    print(r)
" <<< "${yaml_content}"
}

# ---------------------------------------------------------------------------
# Check whether a repo already exists in the target org
# ---------------------------------------------------------------------------
repo_exists() {
  local org="$1" repo="$2"
  gh repo view "${org}/${repo}" --json name >/dev/null 2>&1
}

# ---------------------------------------------------------------------------
# Mirror a single repo: create in target org, mirror-clone, push
# ---------------------------------------------------------------------------
mirror_repo() {
  local repo="$1"
  local src="${SOURCE_ORG}/${repo}"
  local dst="${TARGET_ORG}/${repo}"

  if ${DRY_RUN}; then
    info "[dry-run] Would mirror ${src} -> ${dst} (${VISIBILITY})"
    return 2
  fi

  if ${SKIP_EXISTING} && repo_exists "${TARGET_ORG}" "${repo}"; then
    warn "Skipping ${dst} (already exists)"
    return 3
  fi

  info "Mirroring ${src} -> ${dst}"

  # 1. Create the target repo (empty, no initial commit)
  if ! repo_exists "${TARGET_ORG}" "${repo}"; then
    gh repo create "${dst}" \
      --"${VISIBILITY}" \
      --description "Mirror of ${src}" \
      --disable-wiki \
      --disable-issues \
      || { warn "Failed to create ${dst} — skipping"; return 1; }
  fi

  # 2. Mirror-clone from source (bare clone with all refs)
  local mirror_dir="${WORKDIR}/${repo}.git"
  git clone --mirror "https://github.com/${src}.git" "${mirror_dir}" 2>&1 \
    || { warn "Failed to clone ${src} — skipping"; return 1; }

  # 3. Push all refs to target
  git -C "${mirror_dir}" push --mirror "https://github.com/${dst}.git" 2>&1 \
    || { warn "Failed to push to ${dst} — skipping"; return 1; }

  # 4. Clean up this repo's mirror to save disk
  rm -rf "${mirror_dir}"

  info "Done: ${dst}"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --target-org)        TARGET_ORG="$2";      shift 2 ;;
      --source-org)        SOURCE_ORG="$2";      shift 2 ;;
      --visibility)        VISIBILITY="$2";      shift 2 ;;
      --metadata-ref)      METADATA_REF="$2";    shift 2 ;;
      --include-bootstrap) INCLUDE_BOOTSTRAP=true; shift ;;
      --skip-existing)     SKIP_EXISTING=true;   shift ;;
      --dry-run)           DRY_RUN=true;         shift ;;
      -h|--help)           usage ;;
      *) die "Unknown option: $1" ;;
    esac
  done

  [[ -n "${TARGET_ORG}" ]] || die "Required: --target-org <org>"

  check_deps

  WORKDIR=$(mktemp -d "${TMPDIR:-/tmp}/clone-all.XXXXXX")
  info "Work directory: ${WORKDIR}"

  # Fetch the list of repos from upstream-map.yaml
  local repos
  mapfile -t repos < <(fetch_repo_names)
  info "Found ${#repos[@]} repos in upstream-map.yaml"

  # Optionally add bootstrap
  if ${INCLUDE_BOOTSTRAP}; then
    repos+=("bootstrap")
    info "Including bootstrap repo (total: ${#repos[@]})"
  fi

  # Mirror each repo
  local failed=0
  local succeeded=0
  local skipped=0

  for repo in "${repos[@]}"; do
    local rc=0
    mirror_repo "${repo}" || rc=$?
    case ${rc} in
      0) (( succeeded++ )) || true ;;   # mirrored
      2) (( skipped++ ))   || true ;;   # dry-run
      3) (( skipped++ ))   || true ;;   # already exists
      *) (( failed++ ))    || true ;;   # error
    esac
  done

  echo ""
  if ${DRY_RUN}; then
    info "Dry run complete: ${#repos[@]} repos would be mirrored"
  else
    info "Summary: ${succeeded} mirrored, ${skipped} skipped, ${failed} failed (${#repos[@]} total)"
  fi
}

main "$@"
