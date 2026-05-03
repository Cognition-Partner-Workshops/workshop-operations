#!/usr/bin/env bash
# mirror-repos.sh — Mirror repos from source GitHub org to mirror GitHub org
#
# This is a GitHub operation (not a Devin API operation). It requires a GitHub
# PAT with repo creation permissions on the target org.
#
# Usage:
#   export GITHUB_TOKEN="ghp_..."
#   ./mirror-repos.sh --source-org Cognition-Partner-Workshops \
#                     --target-org Cognition-Partner-Workshops-mirror \
#                     --repos "repo1,repo2,repo3"
#
# Or with a config file:
#   ./mirror-repos.sh --source-org Cognition-Partner-Workshops \
#                     --target-org Cognition-Partner-Workshops-mirror \
#                     --config ../../configs/dc-april-2026.json
set -euo pipefail

GITHUB_TOKEN="${GITHUB_TOKEN:?GITHUB_TOKEN must be set}"
GITHUB_API="https://api.github.com"

SOURCE_ORG=""
TARGET_ORG=""
REPOS=()
CONFIG_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source-org) SOURCE_ORG="$2"; shift 2 ;;
    --target-org) TARGET_ORG="$2"; shift 2 ;;
    --repos)      IFS=',' read -ra REPOS <<< "$2"; shift 2 ;;
    --config)     CONFIG_FILE="$2"; shift 2 ;;
    -h|--help)
      echo "Usage: $0 --source-org <org> --target-org <org> --repos <repo1,repo2,...>"
      echo "       $0 --source-org <org> --target-org <org> --config <config.json>"
      exit 0
      ;;
    *) echo "Unknown: $1"; exit 1 ;;
  esac
done

[[ -z "$SOURCE_ORG" ]] && { echo "Error: --source-org required"; exit 1; }
[[ -z "$TARGET_ORG" ]] && { echo "Error: --target-org required"; exit 1; }

# If config provided, extract repo names (strip the org prefix)
if [[ -n "$CONFIG_FILE" ]]; then
  mapfile -t REPOS < <(jq -r '.repos[] | split("/") | .[1]' "$CONFIG_FILE")
fi

[[ ${#REPOS[@]} -eq 0 ]] && { echo "Error: no repos specified"; exit 1; }

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

gh_api() {
  curl -sfS -H "Authorization: token ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json" "$@"
}

for repo in "${REPOS[@]}"; do
  echo "=== Mirroring ${SOURCE_ORG}/${repo} → ${TARGET_ORG}/${repo} ==="

  # Check if target repo already exists
  if gh_api "${GITHUB_API}/repos/${TARGET_ORG}/${repo}" >/dev/null 2>&1; then
    echo "  Target repo already exists, updating..."
    cd "${TMPDIR}"
    git clone --mirror "https://x-access-token:${GITHUB_TOKEN}@github.com/${SOURCE_ORG}/${repo}.git" "${repo}.git" 2>/dev/null || {
      echo "  WARNING: Failed to clone source repo"; continue
    }
    cd "${repo}.git"
    git remote set-url --push origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${TARGET_ORG}/${repo}.git"
    git push --mirror 2>/dev/null || echo "  WARNING: Push failed (may need force push)"
    cd "${TMPDIR}"
    rm -rf "${repo}.git"
  else
    echo "  Creating target repo..."
    gh_api -X POST "${GITHUB_API}/orgs/${TARGET_ORG}/repos" \
      -d "{\"name\": \"${repo}\", \"private\": false}" >/dev/null 2>&1 || {
      echo "  WARNING: Failed to create repo"; continue
    }

    cd "${TMPDIR}"
    git clone --mirror "https://x-access-token:${GITHUB_TOKEN}@github.com/${SOURCE_ORG}/${repo}.git" "${repo}.git" 2>/dev/null || {
      echo "  WARNING: Failed to clone source repo"; continue
    }
    cd "${repo}.git"
    git remote set-url --push origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${TARGET_ORG}/${repo}.git"
    git push --mirror 2>/dev/null || echo "  WARNING: Push failed"
    cd "${TMPDIR}"
    rm -rf "${repo}.git"
  fi

  echo "  Done"
  echo
done

echo "Mirror complete. ${#REPOS[@]} repo(s) processed."
