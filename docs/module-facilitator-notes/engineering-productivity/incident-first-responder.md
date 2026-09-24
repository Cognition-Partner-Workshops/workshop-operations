# Incident First Responder — Facilitator Notes

Facilitator-only companion to the presenter thread in
[workshop-metadata `demos/engineering-productivity/05-incident-first-responder.md`](https://github.com/Cognition-Partner-Workshops/workshop-metadata/blob/main/demos/engineering-productivity/05-incident-first-responder.md).
Target repo: [Cognition-Partner-Workshops/otterworks](https://github.com/Cognition-Partner-Workshops/otterworks)
(`main` carries the before-state; the sandbox branch is `demo-incident`).
Source-of-truth files in that repo: `incident/scenarios.yaml`,
`incident/expected.yaml`, `observability/prometheus/incident_alerts.yml`,
`.workshop/playbooks/incident-responder.devin.md`,
`.agents/skills/incident-responder/SKILL.md`, `docs/incident-responder/automation.md`,
and the `incident-*` targets in the `Makefile`. Numbers below are from the
authoring runs against those files; re-measure if any of them change.

## Prerequisites

- Docker with Compose on the presenting laptop; `uv` for the harness
  (`incident/incident.py` runs under `uv`, no install step). Free loopback
  ports: 8083, 9090, 3001, 16686, 9093, 9095, 4318, 5432, 6379 (and 8080, 3000
  with `UI=1`).
- Host size. The gates soak at the pinned profile (24 rps, 24 concurrent) on
  purpose and ignore `INCIDENT_LOAD_SCALE`; the full stack was verified green
  on 8 vCPU / 32 GB. On a 2–4 vCPU laptop the before gate passes but the after
  gate can fail its `offered load reached the service` check
  (`request_rate >= 12 rps`) or report `no samples in the 2m window` — both are
  host-sizing diagnostics, not verdicts on the fix. Do not lower the profile;
  present beats 6–8 from the pre-run session on a small laptop.
- Access to the **Demo** Devin org (the org sessions must appear in) with the
  `!incident_responder` Playbook and the Automation registered there — see
  [Facilitator setup](#facilitator-setup). Playbooks and Automations must be
  registered in the Demo org via the v3 API (`POST /v3/organizations/{org_id}/playbooks`,
  `POST /v3/organizations/{org_id}/automations`) or its Settings pages, **not**
  in the internal org.
- Write access to `otterworks` to push `demo-incident` and merge the PR.
- A Slack channel the Devin app is in, if you want the thread reply live
  (`#otterworks-alerts` is the name baked into
  `observability/alertmanager/alertmanager.yml.tmpl`). Without it the RCA goes
  in the PR body and the session's final message — the flow still completes.
- The screen recording of the authoring run at hand (it is a session
  attachment, not a committed file). Its first ≈ 13 s are the golden tenant
  `t-main.otterworks.app` read-only (reachability + HTTP 401 on unauthenticated
  API calls) and do **not** show slowness; the rest is the isolated local
  reproduction: flat traffic and rising p95 on the Grafana dashboard,
  `X-DB-Queries: 104` on a single request, the Jaeger trace fanning into the
  per-document SELECTs, and both `DocumentListLatencyHigh` and
  `DocumentListQueryFanout` firing. Describe it exactly that way. The three
  on-screen moments that carry the thread: the flat-traffic / rising-latency
  chart, the trace waterfall fanning into ~100 queries, and the before/after
  p95 on one chart after the fix is deployed.
- Ownership of the live session. Automation-triggered sessions are owned by the
  org's automation service user, not by the presenter — the webhook trigger has
  no `create_as_user_id`. The session still appears in the Demo org session
  list; if you need a run under your own name, use the Slack-trigger variant or
  the hand-pasted fallback prompt.

## Runbook (≈ 12 minutes)

Timings are the wall clock the authoring runs measured; the alert fires at
≈ 87 s after arming, and the session's PR was ready well inside the 12 minutes.

| # | Min | Mode | Beat | Say | Fallback if the live call fails |
|---|---|---|---|---|---|
| 1 | 0:00–0:30 | PRE-RUN | Stack already up from preflight (`make incident-up`, Grafana tab on `/d/otterworks-incident-responder`, Jaeger and Alertmanager tabs open, 400-document fixture seeded). | "This is OtterWorks' document service with its normal telemetry: Prometheus, Grafana, Jaeger, Alertmanager. Four production flaws ship on `main`; the catalog is `incident/scenarios.yaml`. We are going to page Devin with one of them." | None needed — local only. |
| 2 | 0:30–1:00 | LIVE | `make arm SCENARIO=n-plus-one` in the terminal. Switch to Grafana. | "Arming seeds a deterministic dataset and starts the catalog's load: a hundred-row document list, 24 concurrent, 24 requests a second offered. Watch three panels: request rate, p95, SQL statements per request." | If `arm` fails, `make disarm && make arm SCENARIO=n-plus-one`; if Compose is unhealthy, play the recording from its local-reproduction segment. |
| 3 | 1:00–2:30 | LIVE | Watch p95 climb toward ≈ 2.4 s while request rate stays flat; statements per request step 4 → 104. `curl -si` one request and point at `X-DB-Queries: 104`. | "Request rate is flat — nobody is hammering us — and p95 is climbing past two seconds. One request is now 104 SQL statements. Offered was 24 a second; we are serving about eleven and a half. Nothing errors, so no user files a bug." | Pre-run terminal scrollback or the recording (`X-DB-Queries: 104`, `X-Request-Duration-Ms ≈ 1938`). |
| 4 | ≈ 1:30 | LIVE | `DocumentListLatencyHigh` fires in Alertmanager (≈ 87 s after arm; promise is 180 s). `DocumentListQueryFanout` alongside. Alertmanager posts to `DEVIN_WEBHOOK_URL`. | "There is the page. `DocumentListLatencyHigh`, labeled `page: devin`. Alertmanager has just posted it to a Devin Automation webhook. Nobody is going to type a prompt." | `make incident-simulate RECEIVER=devin` prints the exact payload — paste it after the fallback prompt from the presenter thread into a new session by hand. |
| 5 | 2:30–3:30 | LIVE → PRE-RUN | Switch to the Demo org session list; the automation-started session appears. Show its first steps: acknowledgement, telemetry read, three facts with numbers. Then switch to the **pre-run session** for the rest. | "The session's first two minutes are in the trace, not the code: p95 two-point-four against a one-second threshold, request rate flat, one request fanning into a hundred identical SELECTs on `document_versions`. That waterfall is the finding." | If the webhook did not reach the Automation (invocation cap, disabled, network), open the pre-run session from the authoring run and narrate from there. Check the cap: 3 invocations per hour. |
| 6 | 3:30–5:00 | PRE-RUN | In the pre-run session: `make incident-verify SCENARIO=n-plus-one EXPECT=before` green. Show the Jaeger trace it captured: ≈ 2.3 s, 111 spans, 104 SQL SELECTs. | "Before it touches code it reproduces on its own machine and runs the before gate: fixture pinned, alert fired within 180 seconds, more than 50 queries a request, p95 above one second. Green means 'I see the same incident the alert saw.'" | Run the gate live on the laptop — it is green on the unfixed stack you just armed (allow ~2 min). |
| 7 | 5:00–6:30 | PRE-RUN | The diff: one window-function query in `services/document-service/app/services/document_service.py`, one Alembic revision adding two indexes (owner listing order on `documents`; `(document_id, version_number)` on `document_versions`), one test under `services/document-service/tests/` pinning the statement count. | "Smallest fix that removes the cause. One batched query, one migration with two indexes, one regression test. No refactor, no touching the alert rule, no touching the catalog." | Show the same diff on the answer-key PR (see [Facilitator setup](#facilitator-setup), item 6). |
| 8 | 6:30–8:30 | PRE-RUN | The after gate output — **red first**: `PASS p95_seconds=0.125 <= 0.5`, `FAIL queries_per_request=5.000 <= 4`. Then the trace for the new build (5 statements: count, page, versions load, comments load, batched recent-versions), the catalog correction `4 → 5`, the audited reason in `incident/expected.yaml`, and the green re-run. | "The gate rejected the correct fix. p95 was down to 125 milliseconds and the alert had cleared, but the catalog said four statements and the build did five. Devin did not shave a query and did not raise the threshold. It read the trace: count, page, two relationship loads the page always made, and one batched query — five is right, the catalog was wrong. The fix went to the contract at its root, with the reason committed. That is what verification is for." | This beat is authoring-run evidence: the audited reason is in `git log -p -- incident/expected.yaml` on `main`. The unattended validation run hit a *different* real red (p95 0.98 s with the batched query alone, version bodies still loaded) and iterated the fix; its PR carries that output. Pick one story and quote that run's numbers. |
| 9 | 8:30–9:30 | LIVE (or PRE-RUN) | Slack: the acknowledgement and the single RCA reply in the alert's thread. GitHub: the PR against `demo-incident` with the before/after table (authoring runs: p95 2.43 s → 0.13 s, 104 → 5; validation run: 3.85 s → 0.10 s, 74/104 → 5 — quote the run on screen), the two gate summary lines, the report file names, the two screenshots. | "One acknowledgement, one RCA, in the thread the on-call is already reading. And the PR: what users saw, what telemetry showed, root cause as file, function and line, before and after, measured." | If Slack is not wired (no real `SLACK_WEBHOOK_URL`), show the RCA in the PR body and the session's final message instead — `docs/incident-responder/automation.md` routes it there when the payload has no Slack thread. If the live PR is not there, use the pre-opened PR. |
| 10 | 9:30–11:00 | LIVE | Merge the PR into `demo-incident`. `cd-tenant.yml` rebuilds document-service and rolls the `otterworks-incident` tenant; the migration runs on container start. Show the tenant's statements/request stepping 104 → 5 on the shared Grafana (filter `namespace=otterworks-incident`) and `https://t-incident.demo.otterworks.app` opening "My documents" without the spinner. | "Merging deploys. The tenant picks up the new image, the migration applies on start, and the same list that cost a hundred and four statements a request is served at five. The alert clears on its own once the fixed build has served a full window." | Measured on the validation run: rollout ≈ 4 min after merge, 104 → 5 on the next scrape. The tenant's p95 is **not** the clean chart — it runs the load at `INCIDENT_LOAD_SCALE=0.25` and has little CPU headroom, so p95 stayed noisy (2–5 s at 1–4 rps) and the alert re-fired once before clearing. Show the p95 recovery on the laptop instead: check out the merged branch, rebuild (`docker compose -f docker-compose.yml -f docker-compose.infra.yml -f docker-compose.incident.yml up -d --build document-service`) and run `make incident-verify SCENARIO=n-plus-one EXPECT=after` — green, p95 ≈ 0.13–0.21 s, alert clears locally under the full 24 rps. Have this pre-run if CD is slow. |
| 11 | 11:00–12:00 | LIVE | `make disarm`. Close on the two numbers. | Talk track closing (below). | None needed. |

Total ≈ 12 minutes with beats 6–8 pre-run. If everything live succeeds, beats
5–9 can be shown from the live session instead, but budget the extra wall
clock: the live session's PR is typically ready inside the 12 minutes, the
merge-to-recovery segment is not, so keep beat 10's local fallback ready.

## Preflight checklist (T-30 min)

- [ ] `git checkout main && git pull` in `otterworks`; confirm `git log -1 -- incident/expected.yaml` shows the recorded before-state (`incident/expected.yaml` `recorded.git_sha`).
- [ ] `make incident-up` — document-service on 8083, Prometheus 9090, Grafana 3001, Jaeger 16686, Alertmanager 9093, sink 9095 all answering. Add `UI=1` if you want the browser view of the slowness (gateway 8080, web-app 3000).
- [ ] `make incident-fingerprint` — fixture and source fingerprints match `incident/expected.yaml` (no drift; if it reports drift, something other than the fix changed — do not `incident-record` your way past it on the day).
- [ ] Dry run: `make arm SCENARIO=n-plus-one`, wait for `make incident-status` to show `DocumentListLatencyHigh` firing (≈ 90 s), then `make disarm`. This warms images and proves the alert path.
- [ ] Automation in the Demo org: enabled, `DEVIN_WEBHOOK_URL` pointing at its incoming-webhook URL, and **under its invocation cap** (3 per 3600 s — the dry run above does not count if the webhook was at the sink, but a real dry run through the Automation does; one demo run plus one fallback fits). Concurrency is 1 running / queue depth 0.
- [ ] Slack: channel + `SLACK_WEBHOOK_URL` set on Alertmanager, Devin app in the channel — or accept the sink fallback and the RCA-in-PR path.
- [ ] Tenant `otterworks-incident` awake: `demo-incident` branch on the before-state SHA (same as `main`'s document-service), `https://api-t-incident.demo.otterworks.app` answering, and the shared Grafana / Alertmanager (`grafana.otterworks.app`, `alertmanager.otterworks.app`; they sit behind a login) open in a tab filtered to `namespace=otterworks-incident` if you intend to show the tenant there.
- [ ] Browser tabs: Grafana `/d/otterworks-incident-responder`, Jaeger search (`document-service`, `minDuration=1s`), Alertmanager, the `otterworks` PR list, the Slack channel, the Demo org session list, the pre-run session.
- [ ] Recording file at hand; the answer-key PR (item 6 below) bookmarked as the fallback.
- [ ] Terminal font large; `make incident-simulate RECEIVER=devin` tested once so you know it prints.

## Reset between runs

1. `make disarm` (alias of `make incident-disarm`) — stops load, clears chaos flags, purges the request log, removes the second replica, restarts document-service. It does not touch the fixture or the PR.
2. Close (or leave open as the next run's fallback) the PR Devin opened.
3. Force-push `demo-incident` back to the before-state commit:
   `git push --force-with-lease origin <before-state-sha>:demo-incident`. CD
   redeploys the tenant from that SHA (alternatively
   `scripts/deploy-tenant.sh <tenant> --image-tag <golden>` per the Skill).
4. Locally, if you built the answer key: `git checkout main -- services/document-service && make incident-up` rebuilds the before-state image (`make incident-fingerprint` must then report both fingerprints matching).
5. `make incident-verify SCENARIO=n-plus-one EXPECT=before` must go green again after any reset; fixture drift here means something other than the fix changed.
6. Re-arm when ready: `make arm SCENARIO=n-plus-one`.

## Facilitator setup

1. **Playbook.** Copy the full contents of
   `.workshop/playbooks/incident-responder.devin.md` into the Demo org as a
   Playbook with macro `!incident_responder` (Settings → Playbooks, or
   `POST /v3/organizations/{org_id}/playbooks` with a `cog_`-prefixed key for
   the Demo org). Register the Playbook **before** the Automation so the macro
   in the prompt resolves. Do not register it in the internal org.
2. **Automation (webhook variant).** Create it from the validated JSON in
   `docs/incident-responder/automation.md`: trigger `webhook:incoming`; action
   `start_session` with the prompt from that file (begins `!incident_responder`;
   Alertmanager's JSON is appended verbatim); `run_as` organization; Normal agent
   mode; `max_acu_limit` 15; invocations 3 per 3600 s; concurrency 1 running,
   queue depth 0; `bypass_approval: false`; network allowlist exactly as listed
   there (GitHub / `git-manager.devin.ai`, Docker Hub / ghcr / quay, PyPI /
   astral, Debian / Ubuntu mirrors, `*.otterworks.app`); no MCP servers. Take the
   Automation's incoming-webhook URL.
3. **Automation (Slack-trigger variant, higher fidelity).** Same action;
   trigger `slack:message` on the alert channel's real channel ID, condition
   "message posted by the Alertmanager Slack app". The session is then bound to
   the alert's thread (`attach_thread`), so the RCA lands where the on-call is
   reading. Keep the webhook variant as the fallback.
4. **Alertmanager wiring.** `DEVIN_WEBHOOK_URL` = the Automation's
   incoming-webhook URL (the local Compose template
   `observability/alertmanager/alertmanager.yml.tmpl` defaults to the sink
   `http://alert-sink:9095/devin`; the shared cluster's Alertmanager uses the
   same receiver name). `SLACK_WEBHOOK_URL` = the Slack incoming webhook for the
   alert channel (defaults to `http://alert-sink:9095/slack`). Only `page: devin`
   alerts with `status: firing` reach the Devin receiver (`send_resolved: false`).
5. **Sandbox tenant.** `demo-incident` exists on the remote; keep it at the
   before-state SHA (recreate from `main` if it drifts). The
   `demo-**` rule in `.github/workflows/cd-tenant.yml` deploys tenant
   `otterworks-incident` at `t-incident.demo.otterworks.app` /
   `api-t-incident.demo.otterworks.app` (the tenant is deployed with
   `--host-suffix demo.otterworks.app --branch demo-incident`; the `--branch`
   flag is what stamps the `branch` label the responder reads off the alert).
   Never seed, inject or load `t-main`.
6. **Answer key.** The single answer key is the validation run's PR,
   [otterworks #1681](https://github.com/Cognition-Partner-Workshops/otterworks/pull/1681)
   (base `demo-incident`). It was merged into `demo-incident` once to exercise
   merge → CD → tenant rollout and then reverted, so `demo-incident` is back at
   the before-state; its branch remains on the remote as the facilitator
   fallback for beats 7–10. **Never merge it, or any answer key, into `main`**,
   and never name it in attendee-facing text. Earlier authoring answer keys are
   superseded; do not use them.
7. **No observability MCP connector is required** — the local
   Prometheus/Grafana/Jaeger fallback is the default. A Grafana, Datadog or
   Sentry MCP connector in the Demo org is the upgrade path for a real tenant
   and needs no prompt change.

## Talk track (≈ 500 words, spoken)

What you just watched is an alert that no human answered. The document list on OtterWorks slowed to a crawl, the p95 climbed past two seconds while the request rate stayed flat, and Alertmanager paged — not a person, but a Devin Automation. A session started with the alert payload as its entire brief. Nobody typed a prompt.

The first thing Devin did was not open the code. It opened the dashboard and the traces and wrote down three facts with numbers: the symptom, p95 around two point four seconds against a one-second threshold; what was not changing, request rate flat and no deploy; and where the time was going, one request fanning into more than a hundred identical SELECTs on the versions table. Flat traffic with rising latency is a per-request cost growing with the data, not a capacity problem. That distinction is the diagnosis, and it came from the trace.

Then it reproduced the incident on its own machine before touching a line: armed the same load the catalog describes, ran the before gate until it went green — meaning, I see the same incident the alert saw — and only then followed the SQL spans back to the function that emits them and shipped the smallest fix: one batched query, one migration adding two indexes, one regression test that pins the statement count.

Here is the part to remember. The after gate rejected that fix. Latency had dropped to a hundred and twenty-five milliseconds and the alert had cleared, but the contract said four statements per request and the new build did five. Devin did not shave a query to hit the number, and it did not raise the threshold. It read the trace for the new build and showed that five was correct — count, page, the two relationship loads the page always made, and one batched query — and that the catalog's four was wrong. So the contract was corrected at its root, with the reason committed alongside the evidence. A red gate is either a real divergence or a wrong contract, and either way you find out before the merge, not after the next page.

Now the two numbers a buyer cares about. Today an incident like this typically costs an on-call team an hour or more from page to a reviewed fix, often longer — someone wakes up, opens the dashboards, finds the trace, tracks it to the code, writes the fix, waits for review, deploys. Every step is a human context switch, usually at a bad hour. What you just saw: the alert fired about ninety seconds after the load started, Devin's pull request and root-cause analysis were in the Slack thread and on GitHub within minutes, and when the PR merged the tenant recovered — p95 from about two point four seconds to roughly a hundred and thirty milliseconds, a hundred and four SQL statements per request down to five, alert resolved, on the same dashboard that paged. Page to recovery was about twelve minutes of wall clock, and the human's only decision was whether to merge.

The same automation answers the other three alerts on this service with the same playbook, each on its own branch. Devin is not replacing your on-call rotation; it is the first responder that has already done the reproduction, the fix, and the proof by the time a person reads the page.
