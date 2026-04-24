#!/usr/bin/env bash
# sanitize-pr-pii.sh — Remove "Requested by" PII from PR descriptions and comments
#
# Usage:
#   ./scripts/sanitize-pr-pii.sh <GITHUB_ORG> [--dry-run]
#
# Scans every PR (open + closed) in every repo of the given GitHub org.
# Removes lines matching "Requested by: @user" or "Requested by: email@..."
# from both PR descriptions (body) and issue/PR comments.
#
# Requires: gh CLI authenticated with repo + pull-request scopes, jq
set -euo pipefail

ORG="${1:?Usage: $0 <GITHUB_ORG> [--dry-run]}"
DRY_RUN=false
[[ "${2:-}" == "--dry-run" ]] && DRY_RUN=true

LOG_DIR="$(pwd)/cleanup-logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/sanitize-pr-pii-$(date +%Y%m%d-%H%M%S).log"

log() { echo "[$(date -u +%H:%M:%S)] $*" | tee -a "$LOG_FILE"; }

REPOS=$(gh repo list "$ORG" --limit 500 --json name --jq '.[].name' | sort)
TOTAL_REPOS=$(echo "$REPOS" | wc -l)
TOTAL_EDITS=0
REPO_NUM=0

sanitize_text() {
  # Remove entire lines that are just "Requested by: ..." (with optional whitespace)
  # Also remove inline occurrences
  local text="$1"
  echo "$text" \
    | sed -E '/^[[:space:]]*[Rr]equested[[:space:]]+[Bb]y[[:space:]]*:[[:space:]]*.*$/d' \
    | sed -E 's/[Rr]equested[[:space:]]+[Bb]y[[:space:]]*:[[:space:]]*@[A-Za-z0-9_.-]+//g' \
    | sed -E 's/[Rr]equested[[:space:]]+[Bb]y[[:space:]]*:[[:space:]]*[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}//g'
}

has_pii() {
  # Match @username or email patterns; standalone full lines are always deleted by sed #1
  echo "$1" | grep -qP '[Rr]equested\s+[Bb]y\s*:\s*(@[A-Za-z0-9_.-]|[A-Za-z0-9._%+-]+@)'
}

for REPO_NAME in $REPOS; do
  REPO_NUM=$((REPO_NUM + 1))
  FULL_REPO="$ORG/$REPO_NAME"
  log "[$REPO_NUM/$TOTAL_REPOS] Processing $FULL_REPO"

  # --- Sanitize PR descriptions ---
  # Fetch PRs page by page using the API to handle large bodies safely
  PAGE=1
  while true; do
    PR_JSON=$(gh api "repos/$FULL_REPO/pulls?state=all&per_page=100&page=$PAGE" 2>/dev/null || echo "[]")
    PR_COUNT=$(echo "$PR_JSON" | jq 'length')
    [[ "$PR_COUNT" -eq 0 ]] && break

    for i in $(seq 0 $((PR_COUNT - 1))); do
      PR_NUM=$(echo "$PR_JSON" | jq -r ".[$i].number")
      PR_BODY=$(echo "$PR_JSON" | jq -r ".[$i].body // empty")

      if [[ -n "$PR_BODY" ]] && has_pii "$PR_BODY"; then
        NEW_BODY=$(sanitize_text "$PR_BODY")

        if [[ "$DRY_RUN" == true ]]; then
          log "  [DRY-RUN] Would sanitize PR #$PR_NUM description"
        else
          # Use jq to safely JSON-encode the body for the API call
          PAYLOAD=$(jq -n --arg body "$NEW_BODY" '{"body": $body}')
          if echo "$PAYLOAD" | gh api "repos/$FULL_REPO/pulls/$PR_NUM" \
            -X PATCH --input - >/dev/null 2>&1; then
            log "  Sanitized PR #$PR_NUM description"
            TOTAL_EDITS=$((TOTAL_EDITS + 1))
          else
            log "  ERROR: Failed to edit PR #$PR_NUM description"
          fi
        fi
      fi
    done

    PAGE=$((PAGE + 1))
  done

  # --- Sanitize PR/issue comments ---
  PAGE=1
  while true; do
    COMMENT_JSON=$(gh api "repos/$FULL_REPO/issues/comments?per_page=100&page=$PAGE" 2>/dev/null || echo "[]")
    COMMENT_COUNT=$(echo "$COMMENT_JSON" | jq 'length')
    [[ "$COMMENT_COUNT" -eq 0 ]] && break

    for i in $(seq 0 $((COMMENT_COUNT - 1))); do
      COMMENT_ID=$(echo "$COMMENT_JSON" | jq -r ".[$i].id")
      COMMENT_BODY=$(echo "$COMMENT_JSON" | jq -r ".[$i].body // empty")
      ISSUE_URL=$(echo "$COMMENT_JSON" | jq -r ".[$i].issue_url // empty")

      if [[ -n "$COMMENT_BODY" ]] && has_pii "$COMMENT_BODY"; then
        NEW_BODY=$(sanitize_text "$COMMENT_BODY")

        if [[ "$DRY_RUN" == true ]]; then
          log "  [DRY-RUN] Would sanitize comment $COMMENT_ID (issue: $ISSUE_URL)"
        else
          PAYLOAD=$(jq -n --arg body "$NEW_BODY" '{"body": $body}')
          if echo "$PAYLOAD" | gh api "repos/$FULL_REPO/issues/comments/$COMMENT_ID" \
            -X PATCH --input - >/dev/null 2>&1; then
            log "  Sanitized comment $COMMENT_ID"
            TOTAL_EDITS=$((TOTAL_EDITS + 1))
          else
            log "  ERROR: Failed to edit comment $COMMENT_ID"
          fi
        fi
      fi
    done

    PAGE=$((PAGE + 1))
  done

  # --- Sanitize PR review comments (inline code review comments) ---
  PAGE=1
  while true; do
    REVIEW_JSON=$(gh api "repos/$FULL_REPO/pulls/comments?per_page=100&page=$PAGE" 2>/dev/null || echo "[]")
    REVIEW_COUNT=$(echo "$REVIEW_JSON" | jq 'length')
    [[ "$REVIEW_COUNT" -eq 0 ]] && break

    for i in $(seq 0 $((REVIEW_COUNT - 1))); do
      REVIEW_ID=$(echo "$REVIEW_JSON" | jq -r ".[$i].id")
      REVIEW_BODY=$(echo "$REVIEW_JSON" | jq -r ".[$i].body // empty")

      if [[ -n "$REVIEW_BODY" ]] && has_pii "$REVIEW_BODY"; then
        NEW_BODY=$(sanitize_text "$REVIEW_BODY")

        if [[ "$DRY_RUN" == true ]]; then
          log "  [DRY-RUN] Would sanitize review comment $REVIEW_ID"
        else
          PAYLOAD=$(jq -n --arg body "$NEW_BODY" '{"body": $body}')
          if echo "$PAYLOAD" | gh api "repos/$FULL_REPO/pulls/comments/$REVIEW_ID" \
            -X PATCH --input - >/dev/null 2>&1; then
            log "  Sanitized review comment $REVIEW_ID"
            TOTAL_EDITS=$((TOTAL_EDITS + 1))
          else
            log "  ERROR: Failed to edit review comment $REVIEW_ID"
          fi
        fi
      fi
    done

    PAGE=$((PAGE + 1))
  done

  # Rate-limit protection
  sleep 0.5
done

log ""
log "=== COMPLETE ==="
log "Repos scanned: $TOTAL_REPOS"
log "Total edits: $TOTAL_EDITS"
log "Log saved to: $LOG_FILE"
