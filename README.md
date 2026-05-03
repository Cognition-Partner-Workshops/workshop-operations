# Workshop Operator Guide

Automate the provisioning and teardown of Devin Enterprise workshops using the Devin v3 API. This repo contains scripts and documentation for workshop hosts who need to stand up isolated participant environments backed by a mirror GitHub org.

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
**Mirror org** (`Cognition-Partner-Workshops-mirror`) — GitHub org with forked/mirrored repos that the Devin Enterprise GitHub App is installed on. Repos here are cloned from the source org before each event.
**Workshop org** — a Devin org created per workshop event via API. Participants use this org. It gets git permissions scoped to the mirror GitHub org repos, ACU limits, and environment configs set up by Devin sessions.

## Prerequisites

| Requirement | Description |
|---|---|
| **Enterprise Service User API Key** | A `cog_`-prefixed key with enterprise admin permissions (`ManageOrganizations`, `ManageGitIntegrations`, `ManageOrgSessions`, `ImpersonateOrgSessions`) |
| **GitHub App** | The Devin GitHub App installed on `Cognition-Partner-Workshops-mirror` with access to the repos needed for the workshop |
| **Mirror GitHub Org** | Repos from `Cognition-Partner-Workshops` mirrored/forked into `Cognition-Partner-Workshops-mirror` |
| **Workshop metadata** | An event README in `workshop-metadata/events/<event-dir>/` listing the repos required |
| **jq** | JSON processor (used by all scripts) |
| **curl** | HTTP client |

## Quick Start

```bash
# 1. Set your API key
export DEVIN_API_KEY="cog_your_enterprise_service_user_key"

# 2. Verify authentication
./scripts/verify-auth.sh

# 3. Provision a workshop (creates org, sets permissions, invokes setup sessions)
./scripts/provision-workshop.sh \
  --event-name "DC April 2026" \
  --config configs/dc-april-2026.json

# 4. After the workshop, tear down
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
│   ├── provision-workshop.sh          # End-to-end: create org → permissions → sessions
│   ├── teardown-workshop.sh           # Remove org and clean up permissions
│   ├── lib/
│   │   ├── common.sh                  # Shared functions (API calls, logging, error handling)
│   │   ├── manage-org.sh             # Create/update/delete/list organizations
│   │   ├── manage-repos.sh           # Git permission management (add/replace/clear)
│   │   └── invoke-setup.sh           # Create Devin sessions to configure env YAML
│   └── examples/
│       └── mirror-repos.sh           # Helper to mirror repos from source to mirror org
└── docs/
    └── api-reference-cheatsheet.md    # Quick reference for all v3 API endpoints used
```

## Workflow

### Phase 1: Pre-Workshop Setup (1-2 days before)

#### 1.1 Mirror Repos to the Mirror GitHub Org

Repos from `Cognition-Partner-Workshops` must exist in `Cognition-Partner-Workshops-mirror`. This is a GitHub operation (not a Devin API operation). Use `scripts/examples/mirror-repos.sh` or manually fork/mirror the repos listed in the event's workshop-metadata README.

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
    "Cognition-Partner-Workshops-mirror/uc-framework-upgrade-monolith-to-microservices",
    "Cognition-Partner-Workshops-mirror/uc-legacy-modernization-cobol-to-java",
    "Cognition-Partner-Workshops-mirror/uc-data-source-migration-legacy-to-modern",
    "Cognition-Partner-Workshops-mirror/uc-bdd-test-generation-rest-api",
    "Cognition-Partner-Workshops-mirror/app_petclinic-angular",
    "Cognition-Partner-Workshops-mirror/app_timesheet"
  ],
  "setup_as_user_id": "google-oauth2|116326913226854769397",
  "setup_prompt_template": "Set up the {repo} repository from scratch: install dependencies, get the build and tests working. Then capture the working setup steps in the .yaml environment configuration.\n\nShould we get the app running: yes"
}
```

#### 1.3 Provision the Workshop

```bash
./scripts/provision-workshop.sh --config configs/dc-april-2026.json
```

This script:
1. **Creates a new Devin org** with the configured name and ACU limits
2. **Adds git permissions** for each repo in the config, scoped to the new org
3. **Invokes Devin sessions** (one per repo) to set up the environment config YAML
4. **Outputs** the org ID, session URLs, and a summary

#### 1.4 Verify Setup Sessions

The provisioning script prints session URLs. Monitor them in the Devin webapp or poll via API:

```bash
# Poll a session status
curl -s -H "Authorization: Bearer $DEVIN_API_KEY" \
  "https://api.devin.ai/v3/organizations/$ORG_ID/sessions/$SESSION_ID" | jq .status
```

Sessions will create environment config YAMLs that persist for all future sessions in the org. Once complete, participants can start sessions against those repos with working build/test environments.

### Phase 2: Workshop Day

Participants log into the Devin Enterprise webapp for the workshop org and start sessions using prompts from the event README. The environment configs created in Phase 1 ensure their sessions start with working build environments.

### Phase 3: Post-Workshop Teardown

```bash
./scripts/teardown-workshop.sh --org-id org-xxxxx
```

This:
1. **Clears all git permissions** from the org
2. **Optionally deletes the org** (with `--delete-org` flag)

## API Reference Cheatsheet

See [docs/api-reference-cheatsheet.md](docs/api-reference-cheatsheet.md) for a complete reference of all Devin v3 API endpoints used by these scripts.

## Key Findings from API Experimentation

These notes capture important behaviors discovered during testing:

1. **ACU limits must be set on org creation.** If `max_cycle_acu_limit` is 0 or null, sessions will be suspended immediately with `status_detail: "org_usage_limit_exceeded"`. Always set both `max_session_acu_limit` and `max_cycle_acu_limit` when creating or updating an org.

2. **Git permissions are scoped per-org.** Each org needs its own git permissions, even if the git connection (GitHub App) is shared at the enterprise level. The git connection ID is enterprise-wide, but permissions are granted org-by-org.

3. **`create_as_user_id` requires the user to be an org member.** When creating sessions on behalf of a user, that user must already be a member of the target org with `UseDevinSessions` permission.

4. **Session creation is async.** The POST returns immediately with `status: "new"`. The session transitions through `claimed` → `running` → `suspended`/`exit`. Poll the GET endpoint to track progress.

5. **Enterprise service users inherit org permissions.** An enterprise admin service user can call both `/v3/enterprise/*` and `/v3/organizations/{org_id}/*` endpoints across all orgs without additional role assignments.

6. **Replace (PUT) is idempotent for permissions.** Use `PUT /v3/enterprise/organizations/{org_id}/git-providers/permissions` to set the exact list of repo permissions, replacing any previous state. This is safer than incremental POST for reproducible provisioning.

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
| Create session | POST | `/v3/organizations/{org_id}/sessions` | With `create_as_user_id` |
| Get session | GET | `/v3/organizations/{org_id}/sessions/{session_id}` | Poll status |
| List members | GET | `/v3/enterprise/members/users` | Enterprise-wide |
| List org members | GET | `/v3/enterprise/organizations/{org_id}/members/users` | Per-org |
| List service users | GET | `/v3/enterprise/members/service-users` | Enterprise SUs |
