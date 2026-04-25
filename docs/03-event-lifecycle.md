# Event Lifecycle

Each workshop event has a defined lifecycle: **create** the org and infrastructure before the event, **run** the event, and **tear down** afterward. This guide covers the full lifecycle, including the timing and order of operations.

## Lifecycle Overview

```
          ┌──────────────────────────────────────────────┐
          │               EVENT LIFECYCLE                 │
          │                                                │
  T-7d    │  CREATE                                        │
          │  ├─ Create Devin org (per event)               │
          │  ├─ Grant git repo access                      │
          │  ├─ Invite participants                        │
          │  ├─ Set up repos on Devin machine              │
          │  ├─ Create knowledge notes & playbooks         │
          │  └─ Provision runtime resources (if needed)    │
          │                                                │
  T-1d    │  VERIFY                                        │
          │  ├─ Run facilitator pre-event checklist        │
          │  ├─ Test participant access                    │
          │  └─ Verify hosted apps are healthy             │
          │                                                │
  T+0     │  EVENT START                                   │
          │  ├─ Participants use Devin                     │
          │  ├─ Monitor sessions and ACU usage             │
          │  └─ Facilitate and assist                      │
          │                                                │
  T+end   │  EVENT END                                     │
          │  ├─ Collect feedback                           │
          │  ├─ Export session data (if needed)            │
          │  └─ Run PII cleanup                            │
          │                                                │
  T+2d    │  TEARDOWN                                      │
          │  ├─ Delete Devin org                           │
          │  ├─ Shut down hosted apps                      │
          │  └─ Archive event artifacts                    │
          └──────────────────────────────────────────────┘
```

## Create (T-7 days)

Use the all-in-one lifecycle script:

```bash
export DEVIN_API_KEY="cog_your_api_key_here"

./scripts/manage-event-lifecycle.sh create \
  --event-name="2026-05-15-tokyo" \
  --start-date=2026-05-15 \
  --end-date=2026-05-15 \
  --github-org=YOUR_ORG \
  --git-connection-id=gc-abc123 \
  --emails-file=participants/tokyo-attendees.txt \
  --max-session-acu=50 \
  --max-cycle-acu=5000
```

This runs the following steps in sequence:

### Step 1: Create the Devin Org

Creates a new org via the `/v3/enterprise/organizations` API with the event name, dates, and ACU limits. The org name encodes the event details: `Workshop: 2026-05-15-tokyo (2026-05-15 to 2026-05-15)`.

### Step 2: Grant Git Access

Grants the new org access to all repos in your GitHub org via the git connection. Participants can then use Devin to work on any mirrored repo.

### Step 3: Invite Participants

Reads the emails file and:
1. Invites each user to your Devin Enterprise (if not already a member)
2. Assigns them to the event org

### Step 4: Set Up Repos on Devin

After the org is created, trigger Devin sessions to set up each repo:

```bash
# Read the org ID from the manifest
ORG_ID=$(jq -r '.org_id' event-logs/2026-05-15-tokyo-manifest.json)

# Set up all repos (or a specific list)
./scripts/setup-repos-on-devin.sh "$ORG_ID" YOUR_ORG

# Or set up specific repos for a focused workshop
./scripts/setup-repos-on-devin.sh "$ORG_ID" YOUR_ORG \
  --repos=uc-legacy-modernization-cobol-to-java,aws-mainframe-modernization-carddemo
```

Each session clones, builds, and tests one repo, then captures the working setup in a `.yaml` environment config so Devin doesn't have to rebuild from scratch during the event.

### Step 5: Configure Knowledge and Playbooks

Create knowledge notes and playbooks via the API (see [02-devin-enterprise-setup.md](02-devin-enterprise-setup.md#configuring-the-org)) or through the Devin dashboard.

Recommended knowledge notes for workshop orgs:
- **PR conventions** — no PII in PR descriptions
- **Workshop branching** — participants create `workshop-<attendee_id>` branches from `main`
- **Customer name policy** — no customer/partner names in any content

## Verify (T-1 day)

Run through the [facilitator checklist](https://github.com/Cognition-Partner-Workshops/workshop-metadata/blob/main/shared/facilitator-guide.md):

1. **Repos:** Verify all required repos are set up in the org (check Devin dashboard)
2. **Access:** Have a test participant log in and start a Devin session
3. **Hosted apps:** If your event uses runtime resources, verify they're running
4. **Network:** Ensure the venue has adequate WiFi/network for concurrent Devin sessions

## Event Start (T+0)

During the event:
- Participants follow the workshop instructions (from the `workshop-metadata` repo)
- Each participant creates sessions in Devin, working through challenge modules
- Monitor ACU consumption via the Devin dashboard or API:

```bash
curl -s "https://api.devin.ai/v3/organizations/$ORG_ID/consumption" \
  -H "Authorization: Bearer $DEVIN_API_KEY" | jq .
```

## Event End (T+end)

After the event:

1. **Collect feedback** from participants
2. **Run PII cleanup** to sanitize any "Requested by" fields:
   ```bash
   ./scripts/sanitize-pr-pii.sh YOUR_ORG
   ```
3. **Export session data** if you need records:
   ```bash
   curl -s "https://api.devin.ai/v3/organizations/$ORG_ID/sessions?limit=100" \
     -H "Authorization: Bearer $DEVIN_API_KEY" | jq . > event-logs/sessions-export.json
   ```

## Teardown (T+2 days)

Delete the event org when no longer needed:

```bash
./scripts/manage-event-lifecycle.sh teardown --org-id=org-abc123
```

This permanently deletes the org, all its sessions, and removes participant access. The script requires confirmation (type the org ID) to prevent accidental deletion.

### Check Status Before Teardown

```bash
./scripts/manage-event-lifecycle.sh status --org-id=org-abc123
```

The status command shows the org details and, if an event manifest exists, whether the event end date has passed.

## Event Manifest

Each created event writes a JSON manifest to `event-logs/`:

```json
{
  "org_id": "org-abc123",
  "event_name": "2026-05-15-tokyo",
  "start_date": "2026-05-15",
  "end_date": "2026-05-15",
  "github_org": "YOUR_ORG",
  "created_at": "2026-05-08T10:00:00Z",
  "status": "active"
}
```

After teardown, the status changes to `"torn_down"`. These manifests serve as an audit trail of all events you've run.

## Multi-Day Events

For events spanning multiple days, set `--start-date` and `--end-date` accordingly. The org remains active for the full duration. Consider:

- Setting higher ACU limits for multi-day events
- Running cleanup scripts daily during the event to keep repos tidy
- Monitoring session volume and adjusting limits if participants are hitting caps
