# Partner Workshop Setup Guide

Run a Devin workshop in your own environment using your own GitHub org.

## Prerequisites

- **Devin Enterprise Service User API Key** (`cog_` prefix) — create at Enterprise Settings → Service Users with permissions: `ManageOrganizations`, `ManageGitIntegrations`, `ManageOrgSessions`, `ImpersonateOrgSessions`, `ManageAccountMembership`
- **GitHub PAT** — with scopes: `repo`, `admin:org`, `delete_repo`
- **A GitHub org** — where mirrored repos will live ([create one](https://github.com/organizations/new) if needed)
- **Devin GitHub App** installed on your GitHub org (Enterprise Settings → Git Providers)
- **Tools**: `git`, `gh` CLI, `jq`, `curl`

---

## Step 1: Clone the operator repo

```bash
git clone https://github.com/Cognition-Partner-Workshops/operator.git
cd operator
```

## Step 2: Authenticate the GitHub CLI

```bash
gh auth login
# Choose GitHub.com → HTTPS → paste your PAT
gh auth status
```

## Step 3: Mirror repos into your GitHub org

```bash
# Preview first
./scripts/mirror-github-org.sh Cognition-Partner-Workshops YOUR-GITHUB-ORG \
  --dry-run

# Run it (repos are private by default, CI workflows stripped)
./scripts/mirror-github-org.sh Cognition-Partner-Workshops YOUR-GITHUB-ORG \
  --visibility=private
```

To mirror only specific repos:

```bash
./scripts/mirror-github-org.sh Cognition-Partner-Workshops YOUR-GITHUB-ORG \
  --include="otterworks" --include="uc-*"
```

## Step 4: Create your workshop config

```bash
cp configs/june-2026.json configs/my-workshop.json
```

Edit `configs/my-workshop.json`:

```json
{
  "event_name": "My Partner Workshop",
  "org_name": "My-Partner-Workshop",
  "git_connection_id": "git-connection-XXXXX",
  "max_session_acu_limit": 250,
  "max_cycle_acu_limit": 250,
  "repos": [
    "YOUR-GITHUB-ORG/otterworks",
    "YOUR-GITHUB-ORG/app_timesheet",
    "YOUR-GITHUB-ORG/uc-cve-remediation-regulatory-compliance"
  ],
  "setup_as_user_id": "",
  "setup_prompt_template": "Set up the {repo} repository ...",
  "emails_file": "participants.txt",
  "enterprise_role_id": "",
  "org_role_id": ""
}
```

**Important**: Change `git_connection_id` to yours (find it in step 5) and change the repo org prefix to your GitHub org name.

## Step 5: Set your API key and verify

```bash
export DEVIN_API_KEY="cog_your_service_user_key"
./scripts/verify-auth.sh
```

This prints your identity, orgs, and git connections. Use the `git_connection_id` from here in your config.

## Step 6: Create a participant list

Create `participants.txt` with one email per line:

```
user1@partner.com
user2@partner.com
```

## Step 7: Provision the workshop

```bash
./scripts/provision-workshop.sh --config configs/my-workshop.json
```

This creates a Devin org, grants git permissions, invites participants, and kicks off setup sessions for each repo.

## Step 8: Clean up after the workshop

```bash
# Clean stale branches and PRs
./scripts/cleanup-all.sh YOUR-GITHUB-ORG

# Tear down the Devin org (org-id printed during provisioning)
./scripts/teardown-workshop.sh --org-id org-xxxxx
```

---

## Common gotchas

- **ACU limits must be > 0** or sessions immediately suspend with `org_usage_limit_exceeded`
- **Git permissions are per-org** — each workshop org needs its own permissions, even though the git connection is enterprise-wide
- The `git_connection_id` in `june-2026.json` is ours — you must replace it with yours
- If `gh` can't create repos, check that the PAT has `admin:org` scope and the user is an org owner
