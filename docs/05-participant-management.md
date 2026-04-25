# Participant Management

This guide covers inviting participants, managing access, and handling the participant experience during workshop events.

## Inviting Participants

### Prepare an Email List

Create a text file with one email address per line. Lines starting with `#` are comments:

```
# participants/2026-05-15-tokyo.txt
# Tokyo Workshop - May 15, 2026

alice@example.com
bob@example.com
charlie@example.com
```

### Run the Invitation Script

```bash
export DEVIN_API_KEY="cog_your_api_key_here"

# Preview who would be invited
./scripts/invite-participants.sh org-abc123 participants/tokyo-attendees.txt --dry-run

# Send invitations
./scripts/invite-participants.sh org-abc123 participants/tokyo-attendees.txt
```

The script:
1. Invites each email to your Devin Enterprise (creates the user if new)
2. Assigns each user to the event org so they can access workshop repos

### Specifying Roles

```bash
# With specific enterprise and org roles
./scripts/invite-participants.sh org-abc123 participants/tokyo-attendees.txt \
  --enterprise-role-id=role-member \
  --org-role-id=role-org-user
```

If you don't specify roles, the default roles for your enterprise are used.

### Batch Processing

The script processes emails in batches of 50 (configurable with `--batch-size`). For large events:

```bash
./scripts/invite-participants.sh org-abc123 participants/large-event.txt --batch-size=100
```

## Workshop Flow for Participants

### Branching Convention

Participants should create working branches from `main`:

```
workshop-<attendee_id>
```

Example: `workshop-alice`, `workshop-team3`

All starting-state content (including intentionally planted bugs for bug-hunt labs) should be on `main`. Workshop instructions should never point to internal branch names like `devin/...`.

### Session Workflow

Each lab follows the 4-step format:

1. **Paste into Devin** — copy the prompt from the module, kick off a session
2. **Research with Ask Devin** — use Ask Devin to refine requirements while the session runs
3. **Read the DeepWiki** *(optional)* — explore the repo's auto-generated docs
4. **Review & Give Feedback** — review Devin's PR, leave comments to iterate

Tips for participants:
- **Start sessions early, review later** — Devin runs autonomously
- **Try parallel sessions** — run multiple Devin sessions at once
- **Build up Devin's knowledge** — accept Knowledge item suggestions from Devin
- **Leave PR comments** — Devin will wake up and address them

## Setting Up Repos on Devin's Machine

Before participants start, repos need to be set up on the org's Devin machine:

```bash
ORG_ID=$(jq -r '.org_id' event-logs/2026-05-15-tokyo-manifest.json)

# Set up all repos
./scripts/setup-repos-on-devin.sh "$ORG_ID" YOUR_ORG

# Or set up specific repos for a focused workshop
./scripts/setup-repos-on-devin.sh "$ORG_ID" YOUR_ORG \
  --repos=uc-legacy-modernization-cobol-to-java,aws-mainframe-modernization-carddemo

# Impersonate a facilitator so sessions appear in their list
./scripts/setup-repos-on-devin.sh "$ORG_ID" YOUR_ORG \
  --create-as-user=google-oauth2|1234567890
```

Each setup session:
1. Clones the repo
2. Installs dependencies
3. Runs build and tests
4. Captures the working config as a `.yaml` environment configuration

This means Devin doesn't have to rebuild from scratch when participants start their sessions.

## Privacy and Multi-Tenancy

Workshop environments are multi-tenant — multiple participants share the same Devin org. Important considerations:

### PII Protection

- **PR descriptions:** Devin appends "Requested by" lines with usernames/emails. Run the PII cleanup script after the event (or schedule it):
  ```bash
  ./scripts/sanitize-pr-pii.sh YOUR_ORG
  ```
- **Knowledge notes:** configured to instruct Devin not to include user identifiers in PRs
- **Session isolation:** participants can only see their own sessions, not each other's

### Post-Event Cleanup

After every event, run the full cleanup:

```bash
./scripts/cleanup-all.sh YOUR_ORG --stale-weeks=0
```

This:
1. Sanitizes PII from all PRs
2. Deletes all non-default branches (workshop branches)
3. Closes all open PRs

## Monitoring During Events

### ACU Usage

Monitor consumption during the event to ensure participants aren't hitting limits:

```bash
curl -s "https://api.devin.ai/v3/organizations/$ORG_ID/consumption" \
  -H "Authorization: Bearer $DEVIN_API_KEY" | jq .
```

### Active Sessions

List all active sessions:

```bash
curl -s "https://api.devin.ai/v3/organizations/$ORG_ID/sessions?status=running" \
  -H "Authorization: Bearer $DEVIN_API_KEY" | jq '.[] | {title, status, user_id}'
```

### Common Issues

| Issue | Solution |
|-------|---------|
| "Devin can't find the repo" | Verify repo is set up in the org. Check the repo name matches exactly. |
| "Devin is taking too long" | Normal for complex tasks. Show Session Insights to understand progress. |
| Participant can't log in | Verify they were invited and assigned to the event org. |
| ACU limit reached | Increase the org's `max_cycle_acu_limit` via the API. |
| Participant hitting session limit | Increase `max_session_acu_limit`. |

## Removing Access After Events

When you tear down the event org, participant access is revoked automatically:

```bash
./scripts/manage-event-lifecycle.sh teardown --org-id=org-abc123
```

If you want to keep the org but remove specific participants:

```bash
curl -X DELETE \
  "https://api.devin.ai/v3/enterprise/organizations/$ORG_ID/members/users/$USER_ID" \
  -H "Authorization: Bearer $DEVIN_API_KEY"
```
