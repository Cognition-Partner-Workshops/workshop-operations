# Devin Enterprise Setup

This guide covers setting up a Devin Enterprise environment to run workshops, including creating organizations, connecting Git repos, and configuring the platform.

## Architecture: One Org per Event

Each workshop event gets its own Devin organization. This provides:

- **Isolation:** Participants in one event can't see another event's sessions or repos
- **Resource control:** ACU limits scoped per event
- **Clean teardown:** Delete the org after the event ends — no leftover state
- **Billing clarity:** Usage tracked per event

```
Your Devin Enterprise
├── Workshop: 2026-05-15-tokyo (org-abc123)
│   ├── Members: 30 participants + 2 facilitators
│   ├── Repos: YOUR_ORG/* (all mirrored workshop repos)
│   └── Knowledge/Playbooks: workshop-specific
├── Workshop: 2026-06-01-london (org-def456)
│   ├── Members: 20 participants + 1 facilitator
│   └── ...
└── Internal Dev Org (org-xyz789)
    └── Your team's regular Devin usage
```

## Prerequisites

- **Devin Enterprise account** with admin access
- **Service user API key** (prefix: `cog_`) with these permissions:
  - `ManageOrganizations` — create/delete orgs
  - `ManageAccountMembership` — invite users
  - `ManageGitIntegrations` — grant repo access
  - `ManageOrgSecrets` — create org secrets
  - `ManageOrgSessions` / `ImpersonateOrgSessions` — create sessions on behalf of users
- **Git connection** already configured in your enterprise (GitHub App or PAT)

### Creating a Service User

1. Go to **Enterprise Settings > Service Users**
2. Click **Add Service User**
3. Assign a role with the permissions listed above
4. Generate an API key — this is your `DEVIN_API_KEY`

See [Devin Enterprise docs](https://docs.devin.ai/enterprise/getting-started/get-started) for details.

### Finding Your Git Connection ID

```bash
curl -s "https://api.devin.ai/v3/enterprise/git-providers/connections" \
  -H "Authorization: Bearer $DEVIN_API_KEY" | jq '.[]'
```

Note the `git_connection_id` — you'll need it when creating event orgs.

## Quick Start: Create an Event Org

```bash
export DEVIN_API_KEY="cog_your_api_key_here"

# Create an org for a workshop event
./scripts/setup-devin-org.sh "Workshop: 2026-05-15-tokyo" \
  --git-connection-id=gc-abc123 \
  --github-org=YOUR_ORG \
  --max-session-acu=50 \
  --max-cycle-acu=5000
```

This:
1. Creates a new Devin org named "Workshop: 2026-05-15-tokyo"
2. Grants the org access to all repos in `YOUR_ORG` via the git connection
3. Sets ACU limits to prevent runaway usage
4. Outputs the `org_id` for use in subsequent steps

## API Reference

All scripts use the [Devin /v3 API](https://docs.devin.ai/api-reference/overview). Key endpoints:

| Action | Endpoint | Permission |
|--------|----------|------------|
| Create org | `POST /v3/enterprise/organizations` | `ManageOrganizations` |
| Delete org | `DELETE /v3/enterprise/organizations/{org_id}` | `ManageOrganizations` |
| Update org | `PATCH /v3/enterprise/organizations/{org_id}` | `ManageOrganizations` |
| Grant repo access | `POST /v3/enterprise/organizations/{org_id}/git-providers/permissions` | `ManageGitIntegrations` |
| Invite users | `POST /v3/enterprise/members/users` | `ManageAccountMembership` |
| Assign to org | `POST /v3/enterprise/organizations/{org_id}/members/users` | `ManageAccountMembership` |
| Create secret | `POST /v3/organizations/{org_id}/secrets` | `ManageOrgSecrets` |
| Create playbook | `POST /v3/organizations/{org_id}/playbooks` | `ManageAccountPlaybooks` |
| Create session | `POST /v3/organizations/{org_id}/sessions` | `ManageOrgSessions` |
| Create schedule | `POST /v3/organizations/{org_id}/schedules` | `ManageOrgSessions` |

For Devin Enterprise deployments with a custom domain, replace `api.devin.ai` with your API domain (e.g., `api.your-company.devinenterprise.com`). Pass `--api-url=https://api.your-company.devinenterprise.com` to any script.

## Configuring the Org

After creating the org, configure it for workshops:

### 1. Knowledge Notes

Create knowledge notes to guide Devin during workshop sessions:

```bash
curl -X POST "https://api.devin.ai/v3/organizations/$ORG_ID/knowledge" \
  -H "Authorization: Bearer $DEVIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "PR Conventions",
    "trigger": "when creating or opening pull requests",
    "body": "Do not identify the original user requester when opening Pull Requests. Do not list the email of the user. This is a multi-tenant environment where users should not be able to identify each others output. Use US English spelling consistently."
  }'
```

### 2. Secrets

If workshop repos need API keys, database credentials, or other secrets:

```bash
curl -X POST "https://api.devin.ai/v3/organizations/$ORG_ID/secrets" \
  -H "Authorization: Bearer $DEVIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "WORKSHOP_API_KEY",
    "type": "key-value",
    "value": "your-api-key-here",
    "is_sensitive": true,
    "note": "API key for workshop hosted services"
  }'
```

### 3. Playbooks

Create playbooks for common workshop tasks:

```bash
curl -X POST "https://api.devin.ai/v3/organizations/$ORG_ID/playbooks" \
  -H "Authorization: Bearer $DEVIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Workshop Cleanup",
    "body": "Run the cleanup scripts to sanitize PII, delete stale branches, and close old PRs across all repos in the org.",
    "macro": "!cleanup"
  }'
```

### 4. Scheduled Sessions

Set up recurring cleanup or maintenance:

```bash
curl -X POST "https://api.devin.ai/v3/organizations/$ORG_ID/schedules" \
  -H "Authorization: Bearer $DEVIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weekly PII Cleanup",
    "prompt": "Run the PII sanitization script across all repos in the org. Report any findings.",
    "schedule_type": "recurring",
    "frequency": "weekly",
    "interval_count": 1
  }'
```

## Environment Configuration

Each org has its own Devin machine configuration. Set up the environment so repos are pre-installed:

1. Go to the org's **Settings > Environment** in the Devin dashboard
2. Add setup commands that install common dependencies
3. Or use `./scripts/setup-repos-on-devin.sh` to trigger Devin sessions that set up each repo and capture the config automatically

See [03-event-lifecycle.md](03-event-lifecycle.md) for the full event workflow.
