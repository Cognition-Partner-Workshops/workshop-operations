# Event Setup Guide

Step-by-step guide for setting up a Devin Enterprise workshop event from scratch. Covers everything from mirroring repos through to inviting participants and tearing down after the event.

> **Who is this for?** Workshop facilitators and hosts who need to provision a new event. For attendee-facing content, see [workshop-metadata](https://github.com/Cognition-Partner-Workshops/workshop-metadata).

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Phase 1: Pre-Event Setup (1-2 days before)](#phase-1-pre-event-setup-1-2-days-before)
  - [Step 1: Mirror Repos](#step-1-mirror-repos)
  - [Step 2: Create a Workshop Config](#step-2-create-a-workshop-config)
  - [Step 3: Provision the Devin Org](#step-3-provision-the-devin-org)
  - [Step 4: Invite Participants](#step-4-invite-participants)
  - [Step 5: Verify Environment Setup](#step-5-verify-environment-setup)
  - [Step 6: Deploy PII Check Workflow](#step-6-deploy-pii-check-workflow)
  - [Step 7: Provision Runtime Resources (if needed)](#step-7-provision-runtime-resources-if-needed)
- [Phase 2: Day-of Checklist](#phase-2-day-of-checklist)
- [Phase 3: Post-Event Cleanup](#phase-3-post-event-cleanup)
  - [Step 1: Clean Up the GitHub Org](#step-1-clean-up-the-github-org)
  - [Step 2: Tear Down the Devin Org](#step-2-tear-down-the-devin-org)
- [Quick Reference: All Scripts](#quick-reference-all-scripts)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have the following ready:

| Requirement | How to get it |
|---|---|
| **Enterprise Service User API Key** | A `cog_`-prefixed key with permissions: `ManageOrganizations`, `ManageGitIntegrations`, `ManageOrgSessions`, `ImpersonateOrgSessions`, `ManageAccountMembership`. Contact your Devin Enterprise admin if you don't have one. |
| **GitHub App** | The Devin GitHub App must be installed on the mirror GitHub org (e.g. `Cognition-Partner-Workshops-mirror`) with access to the repos needed for the workshop. |
| **`gh` CLI** | Authenticated with `repo`, `admin:org`, and `pull-request` scopes. Run `gh auth status` to verify. |
| **GitHub PAT** (for mirroring) | A fine-grained PAT with **Contents** (R/W), **Administration** (R/W), and **Metadata** (read) permissions on the target org. See [Creating a PAT](#creating-a-github-pat) below. |
| **`jq`** | JSON processor. Install via `apt install jq`, `brew install jq`, etc. |
| **`curl`** | HTTP client (usually pre-installed). |
| **This repo cloned locally** | `git clone https://github.com/Cognition-Partner-Workshops/workshop-operations.git` |

Set your API key in the environment before running any scripts:

```bash
export DEVIN_API_KEY="cog_your_enterprise_service_user_key"
```

### Creating a GitHub PAT

The mirroring scripts need a fine-grained PAT stored in `GITHUB_MIRROR_PAT`:

1. Go to **https://github.com/settings/personal-access-tokens/new**
2. **Token name:** `devin-workshop-mirror`
3. **Expiration:** 7 days (or as long as the event requires)
4. **Resource owner:** Select the **target organization** (e.g. `Cognition-Partner-Workshops-mirror`)
5. **Repository access:** "All repositories"
6. **Permissions:**

   | Permission | Level | Why |
   |---|---|---|
   | Contents | Read and write | Clone source repos, push to target |
   | Administration | Read and write | Create new repos via API |
   | Metadata | Read-only | Auto-granted; needed for API calls |

7. Click **Generate token** and copy it.

> **Org approval:** If the target org requires admin approval for fine-grained PATs, an org admin must approve the pending token at `https://github.com/organizations/<TARGET_ORG>/settings/personal-access-tokens/active`.

```bash
export GITHUB_MIRROR_PAT="github_pat_..."
```

### Verify Authentication

Run the auth verification script to confirm your API key works and see the current enterprise state (orgs, git connections, members):

```bash
./scripts/verify-auth.sh
```

This shows your service user identity, existing orgs, git connections, enterprise members, service users, and roles. Note the `git_connection_id` from the output -- you'll need it for the workshop config.

---

## Phase 1: Pre-Event Setup (1-2 days before)

### Step 1: Mirror Repos

Workshop repos live in `Cognition-Partner-Workshops` (the source org). They must be mirrored as private copies into a target org (typically `Cognition-Partner-Workshops-mirror`) before each event.

> **Important:** Do NOT mirror `workshop-metadata` or `workshop-instructions` -- their internal hyperlinks would break. The scripts block these automatically.

#### Option A: Mirror from a workshop config (recommended)

If you already have a config file (see [Step 2](#step-2-create-a-workshop-config)), mirror only the repos listed in it:

```bash
./scripts/mirror-github-org.sh Cognition-Partner-Workshops Cognition-Partner-Workshops-mirror \
  --config=configs/your-event.json
```

#### Option B: Mirror specific repos by name

```bash
./scripts/clone-repo.sh otterworks uc-bdd-test-generation-rest-api ts-angular-realworld-example-app \
  --target-org=Cognition-Partner-Workshops-mirror
```

#### Option C: Bulk mirror all repos

```bash
./scripts/mirror-github-org.sh Cognition-Partner-Workshops Cognition-Partner-Workshops-mirror
```

#### Option D: Let Devin do it

If this repo is connected to a Devin org, ask Devin:

> *"I need to get the code in my git remote to host the application-development-maintenance workshop"*

Devin uses the built-in `mirror-workshop-repos` skill to extract repos from the workshop README and run `clone-repo.sh`.

#### Useful flags

| Flag | Description |
|---|---|
| `--dry-run` | Preview what would be mirrored without creating anything |
| `--include="uc-*"` | Mirror only repos matching a glob pattern |
| `--exclude="ts-*"` | Skip repos matching a glob pattern |
| `--all-branches` | Copy all branches (default: default branch only) |
| `--branches=main,java` | Copy only specific branches |
| `--no-skip-existing` | Overwrite repos that already exist in the target |
| `--visibility=private` | Set mirror visibility (default: private) |

#### Copy the operator repo (internal use only)

The operator repo should go to a **facilitator-internal** Devin org, not the attendee org:

```bash
./scripts/clone-repo.sh operator --target-org=<INTERNAL_OPS_ORG>
```

Then add git permissions for it in the internal ops Devin org.

---

### Step 2: Create a Workshop Config

The config file is a JSON file that defines everything about your event: name, repos, ACU limits, and participant info.

1. Copy the template:

```bash
cp configs/_template.json configs/<your-event-slug>.json
```

2. Edit the config with your event details:

```json
{
  "event_name": "Enterprise Modernization Workshop -- New York (June 2026)",
  "org_name": "June-2026-NYC-Workshop",
  "git_connection_id": "git-connection-f76021b797ec4a80a62f8ae9dfc1c45c",
  "max_session_acu_limit": 250,
  "max_cycle_acu_limit": 250,
  "repos": [
    "Cognition-Partner-Workshops-mirror/otterworks",
    "Cognition-Partner-Workshops-mirror/uc-cve-remediation-regulatory-compliance",
    "Cognition-Partner-Workshops-mirror/ts-angular-realworld-example-app"
  ],
  "setup_as_user_id": "",
  "setup_prompt_template": "Set up the {repo} repository from scratch: install dependencies, get the build and tests working. Then capture the working setup steps in the .yaml environment configuration.\n\nShould we get the app running: yes",
  "emails_file": "participants/june-2026.txt",
  "enterprise_role_id": "",
  "org_role_id": ""
}
```

#### Config fields reference

| Field | Required | Description |
|---|---|---|
| `event_name` | Yes | Human-readable name for the event |
| `org_name` | Yes | Short name used as the Devin org name (no spaces) |
| `git_connection_id` | Yes | ID of the Devin GitHub App connection (get from `verify-auth.sh` output) |
| `max_session_acu_limit` | Yes | ACU limit per session (must be > 0; 250 is typical) |
| `max_cycle_acu_limit` | Yes | ACU limit per billing cycle (must be > 0; 250 is typical) |
| `repos` | Yes | Array of `org/repo` paths pointing to the **mirror** org |
| `setup_as_user_id` | No | User ID to impersonate for setup sessions (so they appear in that user's session list) |
| `setup_prompt_template` | Yes | Prompt template for environment setup sessions; `{repo}` is replaced with each repo name |
| `emails_file` | No | Path to a text file with participant emails (one per line) |
| `enterprise_role_id` | No | Enterprise role to assign when inviting participants |
| `org_role_id` | No | Org role to assign when adding participants to the workshop org |

> **Tip:** Find the `git_connection_id` by running `./scripts/verify-auth.sh` and looking under "Git connections."

> **Tip:** ACU limits of 0 or null cause sessions to be suspended immediately with `org_usage_limit_exceeded`. Always set both to a positive value.

---

### Step 3: Provision the Devin Org

Run the provisioning script to create the attendee Devin org, set git permissions, invite participants, and kick off environment setup sessions:

```bash
./scripts/provision-workshop.sh --config configs/<your-event-slug>.json
```

This does four things in sequence:

1. **Creates a new Devin org** with the name and ACU limits from your config
2. **Sets git permissions** for each repo, scoped to the new org
3. **Invites participants** from the emails file (if provided)
4. **Starts Devin setup sessions** (one per repo) to configure environment YAML

The output includes the **org ID** and **session URLs** -- save these.

#### Provisioning options

| Flag | Description |
|---|---|
| `--org-id org-xxxxx` | Use an existing org instead of creating a new one |
| `--skip-sessions` | Skip environment setup sessions (useful if configs are already set up) |
| `--skip-invites` | Skip participant invitations (do them later with `invite-participants.sh`) |
| `--emails-file participants/late-adds.txt` | Override the emails file from the config |

#### Example: Reuse an existing org

```bash
./scripts/provision-workshop.sh --config configs/june-2026.json --org-id org-existing-id
```

This updates ACU limits and re-sets git permissions without creating a new org.

---

### Step 4: Invite Participants

If you skipped invitations during provisioning, or need to add participants later:

```bash
./scripts/invite-participants.sh \
  --org-id org-xxxxx \
  --emails-file participants/june-2026.txt \
  --enterprise-role-id role-xxxxx \
  --org-role-id role-yyyyy
```

The emails file format is one email per line. Blank lines and `#` comments are ignored.

> **How invitation works:** Participants are first invited to the enterprise (`POST /v3/enterprise/members/users`), then assigned to the specific workshop org (`POST /v3/enterprise/organizations/{org_id}/members/users`). This is a two-step process handled automatically by the script.

Preview invitations without actually sending them:

```bash
./scripts/invite-participants.sh \
  --org-id org-xxxxx \
  --emails-file participants/june-2026.txt \
  --dry-run
```

---

### Step 5: Verify Environment Setup

After provisioning, monitor the Devin setup sessions to make sure each repo's environment is configured correctly:

1. **Check session status** in the Devin webapp using the session URLs from the provisioning output
2. **Poll via API** if you prefer:

```bash
curl -s -H "Authorization: Bearer ${DEVIN_API_KEY}" \
  "https://api.devin.ai/v3/organizations/<org-id>/sessions/<session-id>" \
  | jq '{status, status_detail}'
```

Sessions transition through: `new` -> `claimed` -> `running` -> `suspended`/`exit`.

3. **Verify the environment YAML** is saved by checking the Devin org's environment configuration in the webapp (Settings > Environment)

> **Tip:** If a setup session fails, you can re-run provisioning with `--skip-invites` to create new setup sessions without re-inviting participants.

---

### Step 6: Deploy PII Check Workflow

Prevent participant PII from leaking into PR descriptions by deploying the PII check CI workflow:

```bash
# Deploy to all repos in the mirror org
./scripts/deploy-pr-pii-check.sh Cognition-Partner-Workshops-mirror

# Deploy to specific repos only
./scripts/deploy-pr-pii-check.sh Cognition-Partner-Workshops-mirror --include="uc-*"

# Preview first
./scripts/deploy-pr-pii-check.sh Cognition-Partner-Workshops-mirror --dry-run
```

This creates a PR in each repo adding a GitHub Actions workflow that fails if PR descriptions or review comments contain `Requested by:` PII patterns.

---

### Step 7: Provision Runtime Resources (if needed)

Some workshop challenges require hosted applications (e.g. a running timesheet app or Cal.com instance). Check if your selected modules need runtime resources:

| Challenge | Application Needed | Can Run Locally? |
|---|---|---|
| A3 -- E2E Testing | calcom or timesheet-app | Yes |
| D3 -- Fix Runtime Bug | calcom | Yes |
| D4 -- Fix UI Bug | timesheet-app | Yes |
| D5 -- Fix Data Bug | timesheet-app | Yes |

If hosted instances are needed, provision them 24 hours before the event. See [runtime-resources.md](runtime-resources.md) for full details, including local run fallback instructions.

---

## Phase 2: Day-of Checklist

### 30 Minutes Before

- [ ] Verify hosted apps are running (hit health check endpoints)
- [ ] Open all relevant repos in browser tabs
- [ ] Prepare a Devin session pre-loaded and ready to show
- [ ] Test WiFi/network connectivity
- [ ] Set up screen for live Devin walkthrough

### Opening (15 min)

1. Welcome and introductions
2. Brief Devin overview (what it is, what it can do)
3. Show the event site with challenge instructions
4. Explain repo naming conventions and where to find code
5. Point out the Devin Features checklist (Appendix)
6. Set expectations: "These are creative challenges, not exams"

### During the Workshop

- **Float and assist** -- walk around, check in on participants
- **Watch for** authentication, repo access, or environment issues
- **Encourage** experimenting with different Devin features
- **Remind** participants to check the Devin Features checklist

### Common Issues

| Issue | Solution |
|---|---|
| "Devin can't find the repo" | Verify repo is set up in Devin admin. Check repo name matches exactly. |
| "Devin is taking too long" | Normal for complex tasks. Show Session Insights. |
| "Devin made an error" | Teaching moment -- show how to provide feedback to steer Devin. |
| "The hosted app is down" | Fall back to local run instructions in runtime-resources.md. |

### Closing (15 min)

1. Ask participants to share their most interesting session
2. Review the Devin Features checklist
3. Collect feedback
4. Share next steps for daily Devin use
5. Remind participants to revoke any PATs created during the workshop

---

## Phase 3: Post-Event Cleanup

### Step 1: Clean Up the GitHub Org

Run all cleanup tasks (PII sanitization, close old PRs, delete stale branches):

```bash
# Dry run first
./scripts/cleanup-all.sh Cognition-Partner-Workshops-mirror --dry-run

# Execute cleanup
./scripts/cleanup-all.sh Cognition-Partner-Workshops-mirror
```

Or run individual tasks:

```bash
# Remove "Requested by" PII from all PR descriptions and comments
./scripts/sanitize-pr-pii.sh Cognition-Partner-Workshops-mirror

# Close open PRs older than 3 weeks
./scripts/close-old-prs.sh Cognition-Partner-Workshops-mirror --older-than-weeks=3

# Delete branches with no commits in 3 weeks (preserves default branch)
./scripts/delete-stale-branches.sh Cognition-Partner-Workshops-mirror --stale-weeks=3
```

All cleanup scripts support `--dry-run` and write logs to `./cleanup-logs/`.

### Step 2: Tear Down the Devin Org

```bash
# Clear git permissions (preserves the org)
./scripts/teardown-workshop.sh --org-id org-xxxxx

# Clear permissions AND delete the org
./scripts/teardown-workshop.sh --org-id org-xxxxx --delete-org
```

> **Warning:** `--delete-org` is irreversible. The script pauses for 5 seconds before deleting -- press Ctrl+C to abort.

### Post-Event Follow-Up

- [ ] Collect and review participant feedback
- [ ] Document any issues discovered during the workshop
- [ ] Update challenge modules if problems were found
- [ ] Archive event-specific resources (move event dir from `active/` to `archive/`)
- [ ] Send follow-up email with Devin docs, session links, and contact info

---

## Quick Reference: All Scripts

| Script | Purpose | Key Flags |
|---|---|---|
| `verify-auth.sh` | Verify API key and list enterprise state | -- |
| `mirror-github-org.sh` | Bulk mirror repos between GitHub orgs | `--config`, `--include`, `--exclude`, `--dry-run` |
| `clone-repo.sh` | Mirror one or more repos by name | `--target-org`, `--all-branches`, `--dry-run` |
| `provision-workshop.sh` | End-to-end: create org, set permissions, invite, start sessions | `--config`, `--org-id`, `--skip-sessions`, `--skip-invites` |
| `invite-participants.sh` | Invite users by email to an org | `--org-id`, `--emails-file`, `--dry-run` |
| `deploy-pr-pii-check.sh` | Deploy PII check CI workflow to repos | `--include`, `--dry-run` |
| `cleanup-all.sh` | Run all post-workshop cleanup tasks | `--stale-weeks`, `--dry-run` |
| `sanitize-pr-pii.sh` | Remove "Requested by" PII from PRs | `--dry-run` |
| `close-old-prs.sh` | Close open PRs older than N weeks | `--older-than-weeks`, `--dry-run` |
| `delete-stale-branches.sh` | Delete branches with no recent commits | `--stale-weeks`, `--dry-run` |
| `teardown-workshop.sh` | Clear permissions and optionally delete org | `--org-id`, `--delete-org` |

---

## Troubleshooting

### Sessions suspended immediately with `org_usage_limit_exceeded`

ACU limits were set to 0 or null. Update the org:

```bash
curl -X PATCH "https://api.devin.ai/v3/enterprise/organizations/<org-id>" \
  -H "Authorization: Bearer ${DEVIN_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"max_session_acu_limit": 250, "max_cycle_acu_limit": 250}'
```

### `create_as_user_id` failing

The impersonated user must already be a member of the target org with `UseDevinSessions` permission. Invite them first via `invite-participants.sh`.

### Git permissions not working for the new org

Git permissions are scoped per-org, even if the git connection (GitHub App) is shared at the enterprise level. Ensure you ran `provision-workshop.sh` (or manually called the permissions API) for the specific org.

### Mirror script can't create repos

Check that your `GITHUB_MIRROR_PAT` has **Contents** (R/W) and **Administration** (R/W) permissions on the target org. If the org requires PAT approval, an admin must approve it at `https://github.com/organizations/<ORG>/settings/personal-access-tokens/active`.

### `workshop-metadata` or `workshop-instructions` blocked from mirroring

This is intentional. These repos contain hyperlinks to the source org that would break in a mirror. Instead, use a local AI agent with `templates/agent-prompt-setup-event.md` to selectively copy relevant content.

### Cross-host mirroring (GHES) auth issues

When mirroring between different GitHub instances, the `gh` CLI must be authenticated to both hosts:

```bash
gh auth login --hostname github.com
gh auth login --hostname ghes.example.com
```

The script verifies auth to both hosts before starting.
