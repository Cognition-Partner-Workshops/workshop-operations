# PR PII Enforcement

This guide covers preventing "Requested by" PII from appearing in PRs — both proactively (CI checks that block merge) and reactively (cleanup scripts for existing PRs).

## Overview

Devin appends `Requested by: @username` lines to PR descriptions automatically. In multi-tenant workshop environments where participants share an org, this leaks user identity. The enforcement strategy has two layers:

1. **CI check** — A GitHub Actions workflow that fails if a PR description or comment contains PII patterns
2. **Branch protection** — Require the CI check to pass before merging

Together, these prevent PII from reaching merged code. The existing `sanitize-pr-pii.sh` script handles cleanup of PRs that were created before enforcement was enabled.

## Deploy the CI Check

### Single Repo

Copy the workflow file into any repo:

```bash
mkdir -p .github/workflows
cp operator/.github/workflows/pr-pii-check.yml .github/workflows/
git add .github/workflows/pr-pii-check.yml
git commit -m "Add PR PII check workflow"
git push
```

### All Repos in an Org

Use the deployment script to create a PR in every repo adding the workflow:

```bash
# Preview
./scripts/deploy-pr-pii-check.sh YOUR_ORG --dry-run

# Deploy to all repos
./scripts/deploy-pr-pii-check.sh YOUR_ORG

# Deploy to specific repos
./scripts/deploy-pr-pii-check.sh YOUR_ORG --include="uc-*"
```

This creates a PR in each repo. Merge them to activate the check.

> **Note:** Your GitHub PAT needs the `workflow` scope to push workflow files. If you stripped workflows during mirroring (`--strip-workflows`), you'll need to add this scope to deploy the PII check.

## Enable Branch Protection

After the workflow is merged, configure branch protection to require it:

### Via GitHub UI

1. Go to **Settings > Branches** in the repo
2. Click **Add branch protection rule** (or edit existing)
3. Set **Branch name pattern** to `main` (or your default branch)
4. Enable **Require status checks to pass before merging**
5. Search for and add **"Check for PII in PR"** as a required check
6. Save

### Via GitHub API (all repos at once)

```bash
ORG="YOUR_ORG"
for repo in $(gh repo list "$ORG" --limit 500 --json name --jq '.[].name'); do
  default_branch=$(gh api "repos/$ORG/$repo" --jq '.default_branch')

  gh api "repos/$ORG/$repo/branches/$default_branch/protection" \
    -X PUT \
    -H "Accept: application/vnd.github+json" \
    --input - <<EOF
{
  "required_status_checks": {
    "strict": false,
    "contexts": ["Check for PII in PR"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
EOF

  echo "Protected: $repo ($default_branch)"
  sleep 0.3
done
```

> **Warning:** This overwrites existing branch protection rules. If you already have protection configured, use `gh api repos/$ORG/$repo/branches/$default_branch/protection` (GET) first to read current settings, then merge in the new status check.

### Via GitHub Org Rulesets (recommended for orgs)

GitHub org-level rulesets apply to all repos at once without per-repo configuration:

1. Go to **Organization Settings > Rules > Rulesets**
2. Click **New ruleset > New branch ruleset**
3. Set **Target repositories** to "All repositories" (or select specific ones)
4. Set **Target branches** to "Default branch"
5. Under **Require status checks to pass**, add **"Check for PII in PR"**
6. Save

This is the simplest approach for enforcing the check across the entire org.

## What Gets Checked

The workflow triggers on:

| Event | What's Checked |
|-------|---------------|
| PR opened | PR description (body) |
| PR synchronized (new push) | PR description (body) |
| Review comment created/edited | Comment body |

The pattern matched is `Requested by:` followed by any non-whitespace character (case-insensitive). This catches:
- `Requested by: @username`
- `Requested by: user@email.com`
- `Requested by: John Smith`

### System-Appended Metadata

Devin automatically appends metadata to PR descriptions (session link, requester line, review badge). The workflow strips this footer before checking so that the system-appended `Requested by:` line does not cause false positives. The `sanitize-pr-pii.sh` cleanup script removes these lines from existing PRs.

## Cleanup Existing PRs

For PRs created before enforcement was enabled:

```bash
# Preview what would be cleaned
./scripts/sanitize-pr-pii.sh YOUR_ORG --dry-run

# Clean all PRs
./scripts/sanitize-pr-pii.sh YOUR_ORG
```

See the [participant management guide](05-participant-management.md#pii-protection) for the full post-event cleanup workflow.
