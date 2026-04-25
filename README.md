# Operator

Everything you need to clone the [Cognition-Partner-Workshops](https://github.com/Cognition-Partner-Workshops) GitHub organization, run hands-on Devin workshops in your own environment, and manage the full event lifecycle.

## What This Repo Contains

```
operator/
├── README.md                          ← You are here
├── docs/
│   ├── 01-mirror-github-org.md       ← Mirror repos to your GitHub org
│   ├── 02-devin-enterprise-setup.md  ← Configure Devin Enterprise per event
│   ├── 03-event-lifecycle.md         ← Create, run, and tear down events
│   ├── 04-workshop-content.md        ← Craft workshops from module library
│   └── 05-participant-management.md  ← Invite users, manage access, cleanup
├── scripts/
│   ├── mirror-github-org.sh          ← Mirror all repos between GitHub orgs
│   ├── setup-devin-org.sh            ← Create a Devin org via /v3 API
│   ├── manage-event-lifecycle.sh     ← Full lifecycle: create / status / teardown
│   ├── setup-repos-on-devin.sh       ← Trigger Devin sessions to set up repos
│   ├── invite-participants.sh        ← Invite users to a Devin org
│   ├── cleanup-all.sh               ← Run all cleanup scripts in sequence
│   ├── sanitize-pr-pii.sh           ← Remove "Requested by" PII from PRs
│   ├── delete-stale-branches.sh     ← Delete stale branches (3-week default)
│   └── close-old-prs.sh            ← Close old PRs (3-week default)
└── cleanup-logs/                     ← Timestamped logs from script runs
```

## Quick Start

### 1. Mirror the GitHub Org

Copy all workshop repos from `Cognition-Partner-Workshops` (or any source org) to your own GitHub org:

```bash
# Preview
./scripts/mirror-github-org.sh Cognition-Partner-Workshops YOUR_ORG --dry-run

# Execute
./scripts/mirror-github-org.sh Cognition-Partner-Workshops YOUR_ORG --visibility=private
```

See [docs/01-mirror-github-org.md](docs/01-mirror-github-org.md) for filtering, selective mirroring, and repo naming conventions.

### 2. Create a Devin Org for Your Event

Each workshop event gets a dedicated Devin org with its own members, repos, and ACU limits:

```bash
export DEVIN_API_KEY="cog_your_api_key_here"

./scripts/manage-event-lifecycle.sh create \
  --event-name="2026-05-15-tokyo" \
  --start-date=2026-05-15 \
  --end-date=2026-05-15 \
  --github-org=YOUR_ORG \
  --git-connection-id=gc-abc123 \
  --emails-file=participants/tokyo-attendees.txt \
  --max-session-acu=50
```

This creates the org, grants repo access, and invites participants in one command. See [docs/02-devin-enterprise-setup.md](docs/02-devin-enterprise-setup.md) and [docs/03-event-lifecycle.md](docs/03-event-lifecycle.md).

### 3. Set Up Repos on Devin

Trigger Devin sessions to install dependencies and capture environment configs:

```bash
ORG_ID=$(jq -r '.org_id' event-logs/2026-05-15-tokyo-manifest.json)
./scripts/setup-repos-on-devin.sh "$ORG_ID" YOUR_ORG
```

### 4. Craft Workshop Content

Browse the [workshop-metadata](https://github.com/Cognition-Partner-Workshops/workshop-metadata) repo for 77 challenge modules across 12 disciplines, 9 pre-built workshop templates, and event composition tools. See [docs/04-workshop-content.md](docs/04-workshop-content.md).

### 5. Run the Event

Participants follow the workshop instructions, creating Devin sessions from challenge prompts. Monitor usage, assist participants, and manage access. See [docs/05-participant-management.md](docs/05-participant-management.md).

### 6. Clean Up and Tear Down

```bash
# Post-event cleanup: sanitize PII, close PRs, delete branches
./scripts/cleanup-all.sh YOUR_ORG

# Delete the event org when done
./scripts/manage-event-lifecycle.sh teardown --org-id=org-abc123
```

## Prerequisites

| Tool | Purpose | Required Scopes |
|------|---------|----------------|
| [GitHub CLI (`gh`)](https://cli.github.com/) | Repo mirroring, cleanup scripts | `admin:org`, `repo` for both orgs |
| [`jq`](https://jqlang.github.io/jq/) | JSON processing | — |
| [`curl`](https://curl.se/) | Devin API calls | — |
| `git` | Repo cloning and pushing | — |

| Environment Variable | Purpose |
|---------------------|---------|
| `DEVIN_API_KEY` | Service user API key (prefix: `cog_`) for Devin /v3 API |

### Devin Service User Permissions

Create a service user in **Enterprise Settings > Service Users** with:

| Permission | Used By |
|-----------|---------|
| `ManageOrganizations` | Create/delete event orgs |
| `ManageAccountMembership` | Invite participants |
| `ManageGitIntegrations` | Grant repo access to orgs |
| `ManageOrgSecrets` | Create org-level secrets |
| `ManageOrgSessions` | Create sessions, schedules |
| `ImpersonateOrgSessions` | Create sessions as other users |
| `ManageAccountPlaybooks` | Create org playbooks |

## Scripts Reference

### Org and Event Management

| Script | Usage |
|--------|-------|
| `mirror-github-org.sh` | `./scripts/mirror-github-org.sh <SOURCE_ORG> <TARGET_ORG> [--dry-run] [--visibility=private] [--include=pattern] [--exclude=pattern]` |
| `setup-devin-org.sh` | `./scripts/setup-devin-org.sh <ORG_NAME> --git-connection-id=<id> --github-org=<org> [--max-session-acu=N]` |
| `manage-event-lifecycle.sh` | `./scripts/manage-event-lifecycle.sh <create\|status\|teardown> [OPTIONS]` |
| `setup-repos-on-devin.sh` | `./scripts/setup-repos-on-devin.sh <ORG_ID> <GITHUB_ORG> [--repos=a,b,c] [--create-as-user=<id>]` |
| `invite-participants.sh` | `./scripts/invite-participants.sh <ORG_ID> <EMAILS_FILE> [--enterprise-role-id=<id>]` |

### Cleanup

| Script | Usage |
|--------|-------|
| `cleanup-all.sh` | `./scripts/cleanup-all.sh <ORG> [--stale-weeks=N] [--dry-run]` |
| `sanitize-pr-pii.sh` | `./scripts/sanitize-pr-pii.sh <ORG> [--dry-run]` |
| `delete-stale-branches.sh` | `./scripts/delete-stale-branches.sh <ORG> [--stale-weeks=N]` |
| `close-old-prs.sh` | `./scripts/close-old-prs.sh <ORG> [--older-than-weeks=N]` |

All cleanup scripts support `--dry-run` to preview changes before executing.

## Workshop Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        YOUR ENVIRONMENT                           │
│                                                                    │
│  GitHub Org (YOUR_ORG)          Devin Enterprise                   │
│  ┌─────────────────────┐       ┌──────────────────────────────┐   │
│  │ Mirrored repos       │       │ Event Org: 2026-05-15-tokyo  │   │
│  │ ├─ uc-legacy-*       │◄─────►│ ├─ Members: 30 participants │   │
│  │ ├─ ts-java-*         │       │ ├─ Repos: YOUR_ORG/*        │   │
│  │ ├─ app_petclinic-*   │       │ ├─ Knowledge notes          │   │
│  │ └─ ...               │       │ ├─ Playbooks                │   │
│  └─────────────────────┘       │ └─ Env configs per repo     │   │
│                                 └──────────────────────────────┘   │
│                                                                    │
│  Workshop Metadata (fork)       Operator (this repo)               │
│  ┌─────────────────────┐       ┌──────────────────────────────┐   │
│  │ modules/ (77 labs)   │       │ scripts/ (automation)        │   │
│  │ workshops/ (9 types) │       │ docs/ (guides)               │   │
│  │ events/ (your events)│       │                              │   │
│  │ catalog/ (repo index)│       │                              │   │
│  └─────────────────────┘       └──────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Devin /v3 API

All scripts call the [Devin /v3 API](https://docs.devin.ai/api-reference/overview) at `https://api.devin.ai`. For Devin Enterprise deployments with a custom domain, pass `--api-url=https://api.your-company.devinenterprise.com` to any script.

Key endpoints used:

| Endpoint | Purpose |
|----------|---------|
| `POST /v3/enterprise/organizations` | Create event org |
| `DELETE /v3/enterprise/organizations/{org_id}` | Tear down event org |
| `POST /v3/enterprise/organizations/{org_id}/git-providers/permissions` | Grant repo access |
| `POST /v3/enterprise/members/users` | Invite participants |
| `POST /v3/enterprise/organizations/{org_id}/members/users` | Assign to org |
| `POST /v3/organizations/{org_id}/sessions` | Create setup sessions |
| `POST /v3/organizations/{org_id}/secrets` | Add org secrets |
| `POST /v3/organizations/{org_id}/playbooks` | Add org playbooks |
| `POST /v3/organizations/{org_id}/schedules` | Schedule recurring tasks |

See the full [API reference](https://docs.devin.ai/api-reference/overview) for request/response schemas.

## Documentation

| Guide | Description |
|-------|-------------|
| [01-mirror-github-org.md](docs/01-mirror-github-org.md) | How to mirror repos, filtering, naming conventions, repo clusters |
| [02-devin-enterprise-setup.md](docs/02-devin-enterprise-setup.md) | One-org-per-event architecture, service users, API config |
| [03-event-lifecycle.md](docs/03-event-lifecycle.md) | Full lifecycle: create, verify, run, cleanup, teardown |
| [04-workshop-content.md](docs/04-workshop-content.md) | Using workshop-metadata modules, templates, event composition |
| [05-participant-management.md](docs/05-participant-management.md) | Invitations, branching, privacy, monitoring, teardown |

## Related Repos

| Repo | Purpose |
|------|---------|
| [workshop-metadata](https://github.com/Cognition-Partner-Workshops/workshop-metadata) | Challenge modules, workshop templates, event composition, repo catalog |
| [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) | Shared infrastructure (EKS, networking, monitoring) for hosted demos |
