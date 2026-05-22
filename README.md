# Workshop Operator Guide

Everything a **workshop facilitator or host** needs to plan, provision, run, and tear down a Devin Enterprise workshop. This repo contains:

- **Provisioning scripts** — create mirror orgs, workshop orgs, participant invites, and environment configs via the Devin v3 API
- **Facilitator guides** — day-of logistics, pacing tips, common issues, format variations
- **Workshop design docs** — how to create modules, workshops, and events; quality checklist; repo naming conventions
- **General themes** — positioning narratives, architecture strengths, platform capabilities, value framing
- **Module facilitator notes** — per-module setup, MCP configuration, and presales positioning

> **Looking for the hands-on lab content?** Attendee-facing modules, workshops, and prompts live in the [workshop-metadata](https://github.com/Cognition-Partner-Workshops/workshop-metadata) repo. This repo is for the people running the event, not the people attending it.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Devin Enterprise                          │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │  Source Org   │   │  Mirror Org  │   │  Workshop Org│   │
│  │  (Demo)       │   │  (template)  │   │  (per-event) │   │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   │
│         │                  │                   │            │
│         ▼                  ▼                   ▼            │
│  Cognition-Partner-  Cognition-Partner-   Created per      │
│  Workshops (GH org)  Workshops-mirror     workshop via API │
│                      (GH org)                              │
└─────────────────────────────────────────────────────────────┘
```

**Source org** (`Cognition-Partner-Workshops`) — canonical repos with workshop content.
**Mirror org** (`Cognition-Partner-Workshops-mirror`) — GitHub org with mirrored repos that the Devin Enterprise GitHub App is installed on. Repos here are copied from the source org before each event.
**Workshop org** — a Devin org created per workshop event via API. Participants use this org. It gets git permissions scoped to the mirror GitHub org repos, ACU limits, and environment configs set up by Devin sessions.

## Prerequisites

| Requirement | Description |
|---|---|
| **Enterprise Service User API Key** | A `cog_`-prefixed key with enterprise admin permissions (`ManageOrganizations`, `ManageGitIntegrations`, `ManageOrgSessions`, `ImpersonateOrgSessions`, `ManageAccountMembership`) |
| **GitHub App** | The Devin GitHub App installed on `Cognition-Partner-Workshops-mirror` with access to the repos needed for the workshop |
| **Mirror GitHub Org** | Repos from `Cognition-Partner-Workshops` mirrored into `Cognition-Partner-Workshops-mirror` |
| **Workshop metadata** | An event README in `workshop-metadata/events/<event-dir>/` listing the repos required |
| **jq** | JSON processor (used by all scripts) |
| **curl** | HTTP client |
| **gh CLI** | GitHub CLI (used by mirror and cleanup scripts; requires `repo`, `admin:org`, `pull-request` scopes) |

## Quick Start

```bash
# 1. Set your API key
export DEVIN_API_KEY="cog_your_enterprise_service_user_key"

# 2. Verify authentication
./scripts/verify-auth.sh

# 3. Provision a workshop (creates org, sets permissions, invokes setup sessions)
./scripts/provision-workshop.sh --config configs/dc-april-2026.json

# 4. After the workshop, clean up the GitHub org
./scripts/cleanup-all.sh Cognition-Partner-Workshops-mirror

# 5. Tear down the Devin org
./scripts/teardown-workshop.sh --org-id org-xxxxx
```

## Directory Structure

```
operator/
├── README.md                          # This guide
├── configs/
│   ├── _template.json                 # Template for workshop event configs
│   └── dc-april-2026.json            # Example: DC April 2026 workshop
├── scripts/
│   ├── verify-auth.sh                 # Verify API key and list enterprise state
│   ├── provision-workshop.sh          # End-to-end: create org → permissions → invites → sessions
│   ├── teardown-workshop.sh           # Remove org and clean up permissions
│   ├── invite-participants.sh         # Invite users by email to an org
│   ├── mirror-github-org.sh           # Mirror repos between GitHub orgs
│   ├── cleanup-all.sh                 # Run all post-workshop cleanup tasks
│   ├── sanitize-pr-pii.sh            # Remove "Requested by" PII from PRs
│   ├── close-old-prs.sh              # Close open PRs older than N weeks
│   ├── delete-stale-branches.sh       # Delete branches with no recent commits
│   ├── deploy-pr-pii-check.sh        # Deploy PII check CI workflow to all repos
│   └── lib/
│       ├── common.sh                  # Shared functions (API calls, logging, config)
│       ├── manage-org.sh             # Create/update/delete/list organizations
│       ├── manage-repos.sh           # Git permission management (add/replace/clear)
│       ├── manage-members.sh         # Invite users, assign to orgs
│       └── invoke-setup.sh           # Create Devin sessions to configure env YAML
├── .github/workflows/
│   └── pr-pii-check.yml             # CI workflow to block PRs with PII
├── templates/
│   └── event-readme.md               # Template for new event READMEs
└── docs/
    ├── api-reference-cheatsheet.md    # Quick reference for all v3 API endpoints used
    ├── facilitator-guide.md           # Day-of logistics, pacing, common issues
    ├── workshop-design-guide.md       # How to create modules, workshops, events
    ├── quality-checklist.md           # Quality standards for workshop content
    ├── repo-naming-convention.md      # Repo naming rules for the GH org
    ├── runtime-resources.md           # Provisioning hosted apps for events
    ├── general-themes/                # Positioning narratives for facilitators
    │   ├── README.md
    │   ├── when-to-use-devin.md
    │   ├── architecture-strengths.md
    │   ├── design-patterns-for-devin.md
    │   ├── platform-capabilities.md
    │   ├── collaboration-model.md
    │   └── value-narratives.md
    └── module-facilitator-notes/      # Per-module facilitator companions
        ├── data-engineering/          # 9 facilitator notes
        └── security/                  # 2 facilitator notes
```

## Workflow

### Phase 1: Pre-Workshop Setup (1-2 days before)

#### 1.1 Mirror Repos to the Mirror GitHub Org

Repos from `Cognition-Partner-Workshops` must exist in `Cognition-Partner-Workshops-mirror`. Use `scripts/mirror-github-org.sh`:

```bash
# Mirror all repos (skips existing by default, strips CI workflows)
./scripts/mirror-github-org.sh Cognition-Partner-Workshops Cognition-Partner-Workshops-mirror

# Mirror only use-case repos
./scripts/mirror-github-org.sh Cognition-Partner-Workshops Cognition-Partner-Workshops-mirror \
  --include="uc-*"

# Mirror from a workshop config file
./scripts/mirror-github-org.sh Cognition-Partner-Workshops Cognition-Partner-Workshops-mirror \
  --config=configs/dc-april-2026.json

# Preview without creating anything
./scripts/mirror-github-org.sh Cognition-Partner-Workshops Cognition-Partner-Workshops-mirror \
  --dry-run
```

Options: `--include=<glob>`, `--exclude=<glob>`, `--visibility=private`, `--strip-workflows` (default), `--no-skip-existing`, `--config=<file>`.

#### 1.2 Create a Workshop Config

Copy `configs/_template.json` and fill in the event details:

```json
{
  "event_name": "DC April 2026",
  "org_name": "DC-April-2026",
  "git_connection_id": "git-connection-f76021b797ec4a80a62f8ae9dfc1c45c",
  "max_session_acu_limit": 250,
  "max_cycle_acu_limit": 250,
  "repos": [
    "Cognition-Partner-Workshops-mirror/ts-angular-realworld-example-app",
    "Cognition-Partner-Workshops-mirror/uc-framework-upgrade-monolith-to-microservices"
  ],
  "setup_as_user_id": "google-oauth2|...",
  "setup_prompt_template": "Set up the {repo} repository from scratch: ...",
  "emails_file": "participants/dc-april-2026.txt",
  "enterprise_role_id": "",
  "org_role_id": ""
}
```

| Field | Required | Description |
|---|---|---|
| `event_name` | Yes | Display name for the event |
| `org_name` | Yes | Short name used as the Devin org name |
| `git_connection_id` | Yes | ID of the Devin GitHub App connection (enterprise-wide) |
| `max_session_acu_limit` | Yes | ACU limit per session (must be > 0) |
| `max_cycle_acu_limit` | Yes | ACU limit per billing cycle (must be > 0) |
| `repos` | Yes | Array of `org/repo` paths to grant access to |
| `setup_as_user_id` | No | User ID to impersonate when creating setup sessions |
| `setup_prompt_template` | Yes | Prompt template for setup sessions (`{repo}` is replaced) |
| `emails_file` | No | Path to a file with participant emails (one per line) |
| `enterprise_role_id` | No | Enterprise role to assign when inviting participants |
| `org_role_id` | No | Org role to assign when adding participants to the org |

#### 1.3 Provision the Workshop

```bash
# Full provisioning (creates org, sets permissions, invites participants, runs setup sessions)
./scripts/provision-workshop.sh --config configs/dc-april-2026.json

# Use an existing org (updates ACU limits, re-sets permissions)
./scripts/provision-workshop.sh --config configs/dc-april-2026.json --org-id org-existing-id

# Skip sessions if env configs are already set up
./scripts/provision-workshop.sh --config configs/dc-april-2026.json --skip-sessions

# Skip invitations (do them separately later)
./scripts/provision-workshop.sh --config configs/dc-april-2026.json --skip-invites

# Override emails file from CLI
./scripts/provision-workshop.sh --config configs/dc-april-2026.json --emails-file participants/late-adds.txt
```

This script:
1. **Creates a new Devin org** with the configured name and ACU limits
2. **Adds git permissions** for each repo in the config, scoped to the new org
3. **Invites participants** from the emails file (enterprise invite + org assignment)
4. **Invokes Devin sessions** (one per repo) to set up the environment config YAML
5. **Outputs** the org ID, session URLs, and a summary

#### 1.4 Invite Participants Separately

If you skipped invitations during provisioning or need to add participants later:

```bash
./scripts/invite-participants.sh \
  --org-id org-xxxxx \
  --emails-file participants/dc-april-2026.txt \
  --enterprise-role-id role-xxxxx \
  --org-role-id role-yyyyy
```

The emails file format is one email per line; blank lines and `#` comments are ignored.

#### 1.5 Deploy PII Check Workflow

To prevent participant PII from leaking into PR descriptions across workshop repos:

```bash
# Deploy to all repos in the mirror org
./scripts/deploy-pr-pii-check.sh Cognition-Partner-Workshops-mirror

# Deploy to specific repos only
./scripts/deploy-pr-pii-check.sh Cognition-Partner-Workshops-mirror --include="uc-*"

# Preview
./scripts/deploy-pr-pii-check.sh Cognition-Partner-Workshops-mirror --dry-run
```

This creates a PR in each repo adding a GitHub Actions workflow that fails if PR descriptions or review comments contain `Requested by:` PII patterns.

### Phase 2: Workshop Day

Participants log into the Devin Enterprise webapp for the workshop org and start sessions using prompts from the event README. The environment configs created in Phase 1 ensure their sessions start with working build environments.

### Phase 3: Post-Workshop Cleanup

#### 3.1 Clean Up the GitHub Org

```bash
# Run all cleanup tasks (PII sanitization + close old PRs + delete stale branches)
./scripts/cleanup-all.sh Cognition-Partner-Workshops-mirror

# Dry run first
./scripts/cleanup-all.sh Cognition-Partner-Workshops-mirror --dry-run

# Custom stale threshold (default: 3 weeks)
./scripts/cleanup-all.sh Cognition-Partner-Workshops-mirror --stale-weeks=1
```

Individual cleanup scripts:

```bash
# Remove "Requested by" PII from all PR descriptions and comments
./scripts/sanitize-pr-pii.sh Cognition-Partner-Workshops-mirror

# Close open PRs older than 3 weeks
./scripts/close-old-prs.sh Cognition-Partner-Workshops-mirror --older-than-weeks=3

# Delete branches with no commits in 3 weeks (preserves default branch)
./scripts/delete-stale-branches.sh Cognition-Partner-Workshops-mirror --stale-weeks=3
```

All cleanup scripts support `--dry-run` and write logs to `./cleanup-logs/`.

#### 3.2 Tear Down the Devin Org

```bash
./scripts/teardown-workshop.sh --org-id org-xxxxx

# Also delete the org entirely
./scripts/teardown-workshop.sh --org-id org-xxxxx --delete-org
```

This:
1. **Clears all git permissions** from the org
2. **Optionally deletes the org** (with `--delete-org` flag and a 5-second confirmation delay)

## Facilitator Documentation

| Document | Description |
|----------|-------------|
| [Facilitator Guide](docs/facilitator-guide.md) | Pre-event checklist, day-of logistics, pacing, common issues, format variations |
| [Workshop Design Guide](docs/workshop-design-guide.md) | How to create modules, workshops, and events; audience recommendations; time budgets |
| [Quality Checklist](docs/quality-checklist.md) | Quality standards for authoring or reviewing workshop content |
| [Repo Naming Convention](docs/repo-naming-convention.md) | Naming rules for repos in the Cognition-Partner-Workshops org |
| [Runtime Resources](docs/runtime-resources.md) | Provisioning hosted applications for workshop events |
| [General Themes](docs/general-themes/) | Positioning narratives: when to use Devin, architecture strengths, value framing |
| [Module Facilitator Notes](docs/module-facilitator-notes/) | Per-module setup, MCP configuration, and presales positioning |
| [Event README Template](templates/event-readme.md) | Starting template for new event READMEs in workshop-metadata |

## API Reference Cheatsheet

See [docs/api-reference-cheatsheet.md](docs/api-reference-cheatsheet.md) for a complete reference of all Devin v3 API endpoints used by these scripts.

## Key Findings from API Experimentation

These notes capture important behaviors discovered during live testing:

1. **ACU limits must be set on org creation.** If `max_cycle_acu_limit` is 0 or null, sessions will be suspended immediately with `status_detail: "org_usage_limit_exceeded"`. Always set both `max_session_acu_limit` and `max_cycle_acu_limit` when creating or updating an org.

2. **Git permissions are scoped per-org.** Each org needs its own git permissions, even if the git connection (GitHub App) is shared at the enterprise level. The git connection ID is enterprise-wide, but permissions are granted org-by-org.

3. **`create_as_user_id` requires the user to be an org member.** When creating sessions on behalf of a user, that user must already be a member of the target org with `UseDevinSessions` permission.

4. **Session creation is async.** The POST returns immediately with `status: "new"`. The session transitions through `claimed` → `running` → `suspended`/`exit`. Poll the GET endpoint to track progress.

5. **Enterprise service users inherit org permissions.** An enterprise admin service user can call both `/v3/enterprise/*` and `/v3/organizations/{org_id}/*` endpoints across all orgs without additional role assignments.

6. **Replace (PUT) is idempotent for permissions.** Use `PUT /v3/enterprise/organizations/{org_id}/git-providers/permissions` to set the exact list of repo permissions, replacing any previous state. This is safer than incremental POST for reproducible provisioning.

7. **Participant invitation is two-step.** First invite to the enterprise via `POST /v3/enterprise/members/users` (returns user IDs), then assign to the specific org via `POST /v3/enterprise/organizations/{org_id}/members/users`.

## Tested API Calls (Verified Working)

| Operation | Method | Endpoint | Notes |
|---|---|---|---|
| Verify auth | GET | `/v3/self` | Returns service user identity |
| List orgs | GET | `/v3/enterprise/organizations` | All orgs in enterprise |
| Create org | POST | `/v3/enterprise/organizations` | Set name + ACU limits |
| Update org | PATCH | `/v3/enterprise/organizations/{org_id}` | Update limits/name |
| List git connections | GET | `/v3/enterprise/git-providers/connections` | Find connection IDs |
| List git permissions | GET | `/v3/enterprise/organizations/{org_id}/git-providers/permissions` | Per-org permissions |
| Create git permissions | POST | `/v3/enterprise/organizations/{org_id}/git-providers/permissions` | Bulk add repos |
| Replace git permissions | PUT | `/v3/enterprise/organizations/{org_id}/git-providers/permissions` | Idempotent set |
| Delete git permission | DELETE | `/v3/enterprise/organizations/{org_id}/git-providers/permissions/{id}` | Remove one |
| Clear git permissions | DELETE | `/v3/enterprise/organizations/{org_id}/git-providers/permissions` | Remove all |
| Invite to enterprise | POST | `/v3/enterprise/members/users` | Batch email invites |
| Assign to org | POST | `/v3/enterprise/organizations/{org_id}/members/users` | With optional role |
| Create session | POST | `/v3/organizations/{org_id}/sessions` | With `create_as_user_id` |
| Get session | GET | `/v3/organizations/{org_id}/sessions/{session_id}` | Poll status |
| List members | GET | `/v3/enterprise/members/users` | Enterprise-wide |
| List org members | GET | `/v3/enterprise/organizations/{org_id}/members/users` | Per-org |
| List service users | GET | `/v3/enterprise/members/service-users` | Enterprise SUs |
