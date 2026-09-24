# Playbook: Build a Devin capability demo from a feature or technical requirement

> **Facilitator / author:** this file is the source for a **Devin Playbook**.
> Copy its contents into your Devin organization (Settings → Playbooks → *Create
> a new Playbook*) so sessions can invoke it as `!build-capability-demo`. See
> [Creating Playbooks](https://docs.devin.ai/product-guides/creating-playbooks).

## Overview

Use this when someone hands you a **requirement** — a feature ask, a technical
spec, a sample prompt, a "show me Devin doing X" — and wants a **demoable
capability showcase** at the end, built end to end with as little of their time
as possible. It is the multi-step, multi-session procedure that takes a
requirement from a one-page plan to a repeatable, verified, presenter-ready
flow in the org where it will be shown, and hands it to an independent
assessor.

It sits above three narrower playbooks and calls them at the right moments:

| Step | Delegate to | Why it is separate |
|---|---|---|
| Write the portable Playbook, repo Skill and presenter thread | `!author-devin-demo` | the three-artifact contract and the verification-loop craft |
| Register the playbook and run the flow in the target org as a named user | `!run_demo_sessions` | cross-org work only goes through the v3 API |
| Independent merge-readiness verdict | `!assess-demo-flow` | assessment must have no stake in the result |

The output is: a plan the requester approved (or was told is being executed), a
durable **before-state** in a real repo, the plumbing that makes the capability
observable and triggerable, the three artifacts, at least one **live end-to-end
run** with evidence, the flow replicated in the target org, and an assessment
report. Not a description of any of those — the things themselves.

## The one principle: the requirement is a claim; the demo is its proof

Every requirement decomposes into a small number of **claims** ("Devin starts
on its own when an alert fires", "p95 drops from 2.4 s to under 0.5 s", "no human
types a prompt"). A claim you cannot prove with a command, a metric, a PR, or a
session record is not part of the demo yet — it is scope you still have to
design. Build the proof first, the narration last, and never narrate past what
the proof shows.

## Required from user

- **The requirement**, in their words. A sample prompt, a spec, a Slack message.
  Keep it verbatim; you will quote it back in the plan and in the presenter
  thread's prompts.
- **The audience and the two numbers they care about** (time, cost, risk,
  coverage — "how long does this take a team today vs. here"). If the requester
  does not know, propose them in the plan.
- **The estate**: which repos/runtimes the demo lives in, whether a golden
  environment already exists (do not build a new app if a realistic one is
  already deployed), and what must never be mutated (a golden tenant, `main`).
- **The org(s)**: where you build (usually the internal org) and where it will be
  shown (the target Demo org), plus — when you reach step 8 — the target org ID,
  an enterprise `cog_` key, the user to impersonate, and any Slack channel ID.
- **Autonomy and cost posture**: whether to wait for sign-off after the plan or
  proceed, and which agent mode delegated sessions should use (default the
  cheapest mode that completes the loop; set `devin_mode` explicitly on every
  child/workflow node).

## Procedure

1. **Shallow investigation, then a one-page plan — before building anything.**
   Spend the first pass reading, not writing: the repo (`AGENTS.md`, existing
   harnesses, planted bugs, deploy scripts, CI branch conventions), what is live
   (namespaces, hostnames, dashboards, node capacity), and which platform
   features the requirement leans on (Automations trigger types, Playbook
   macros, MCP connectors, child sessions) — verify each against the docs/API,
   not memory. Write the plan as a file and attach it: claims to prove, the
   scenario catalog (each scenario: what the user sees, what the chart shows,
   what the code cause is, what a correct fix looks like), the telemetry and
   trigger path, the before/after numbers you expect, the artifact list, the
   timeline in *sessions*, and the questions only the requester can answer
   (channel IDs, webhook URLs, org IDs). Send it non-blocking; if the requester
   has pre-authorized autonomy, start building immediately and treat the plan
   as the record.
2. **Reuse the golden estate; never build what already exists.** If a realistic
   application and runtime exist (a polyglot monorepo, a tenant-isolated
   cluster), derive the demo from them: a variant branch off `main`, an
   isolated tenant/namespace, the existing deploy path. Fix genuine wiring gaps
   you hit (missing dependency pins, `.dockerignore`, a health check that calls
   a binary the image lacks) and leave intentionally planted defects alone.
   Only scaffold a new `uc-…` repo when nothing suitable exists.
3. **Make each claim observable before it is fixable.** Instrument the service
   so the symptom is visible in telemetry *before* it is visible in code:
   metrics with the dimensions the alert needs (per-request query count, memory
   vs. limit, log bytes vs. capacity, duplicate work), traces that show *where*
   the time goes, response headers a presenter can `curl`. Ship the local
   observability stack in Compose (Prometheus, Grafana, tracing, Alertmanager,
   an in-cluster/local sink for every external receiver) so the whole flow runs
   on one laptop with no credentials; make the paid/shared tenant the upgrade
   path, not the default.
4. **Build the harness: arm, disarm, verify, fingerprint.** One command plants
   a scenario and starts deterministic load; one reverses it; one runs the
   **before** gate (the symptom must be present and the alert must fire within
   the stated time) and the **after** gate (same load, symptom gone, alert
   inactive); one fingerprints every behavior-changing input (source, schema,
   seed, rules) so a gate cannot pass on stale state; re-recording requires an
   audited reason. Failure paths write diagnostic reports. State the
   time-to-fire and measure it — a promise you did not measure is a live-demo
   failure waiting to happen.
5. **Prove the before-state and the answer key, separately.** Run the before
   gate on the durable branch and capture the numbers (headers, dashboard,
   trace span counts, alert timestamps, a screen recording if the requester
   wants visual proof). Implement the correct fix on an **unmerged answer-key
   branch/worktree** and run the after gate. Keep the answer key out of the
   before-state forever. Record evidence with the exact command that produced
   it; when a recording includes a segment that proves less than it looks like
   (a golden tenant that only shows a 401), say so in the caption.
6. **Wire the trigger so no human types a prompt.** Design the Automation with
   the trigger the environment actually supports (`webhook:incoming` from
   Alertmanager, `slack:message` on a real channel ID, a schedule), the exact
   session prompt (macro first, payload appended, order of work explicit,
   forbidden moves explicit), connectors, agent mode, ACU limit, invocation cap,
   concurrency, and network allowlist — each choice explained in one line.
   Validate the payload against the Automations API before creating it. Route
   at the source (only paging alerts, only `firing`) so the automation itself
   stays unconditional. Keep a `simulate` command that prints the exact payload
   the automation received, as the paste-by-hand fallback.
7. **Write the three artifacts and the facilitator notes with
   `!author-devin-demo`.** Portable Playbook (`.workshop/playbooks/<name>.devin.md`)
   with the *real* divergence the gate caught as its worked example; repo Skill
   (`.agents/skills/<name>/SKILL.md`) with every command, port, namespace,
   deploy and reset path; presenter thread in `workshop-metadata/demos/…`;
   runbook, preflight, reset-between-runs, talk track and Automation config in
   the operator repo / the code repo's `docs/`. Everything quoted must come from
   a file or a measured run. Delegate the content pass to a normal-mode child
   session with the numbers and file list in its brief.
8. **Fan out the independent build tracks as normal-mode child sessions** once
   the harness is green: shared-infra IaC (monitoring stack in the platform
   repo), tenant/namespace wiring and the sandbox deployment (code repo),
   attendee/facilitator content (content repos). Each brief names the repo,
   base branch, PR base, what must never be touched, the exact verification to
   paste into the PR, and the shape of the final message. Do not parallelize
   tracks that depend on each other's output; use a dynamic workflow only for
   five or more independent judgment-heavy units.
9. **Run it unattended, end to end, in the build org.** Arm → alert → trigger →
   session starts with no prompt → reads telemetry → reproduces → fixes →
   after gate green → RCA where the on-call reads → PR → merge/deploy to the
   sandbox → recovery visible. Capture session URL, PR URL, gate outputs and
   before/after numbers. Fix what the run exposes at its root (a wrong
   threshold in the contract, a load profile that fires too late) and keep the
   divergence in the audit trail. A demo you have not run unattended is not
   done.
10. **Open the before-state PRs** (code repo, content repos, platform repo) with
    the evidence in the bodies; lint/typecheck/tests green for the files you
    touched; pre-existing planted failures listed, not fixed. Review each diff
    for answer-key leakage, requester identity, customer names, internal
    `devin/...` branches in participant-facing text, and facilitator logistics
    in attendee-facing repos.
11. **Replicate in the target org with `!run_demo_sessions`.** Register the
    Playbook with its macro, create the Automation from the documented config
    with the target org's webhook/channel values, run one session per phase as
    the requesting user, verify `user_id`/`playbook_id` by reading them back,
    monitor to a real result, and keep the creation/monitoring scripts under
    `/home/ubuntu/prompts/` or the repo.
12. **Hand off to `!assess-demo-flow`** in a separate session with the PR
    links, the validation session, the exact gate commands, and the macro. It
    reports; you fix; it re-checks. Then send the requester the verdict, the
    links, the evidence with honest captions, and the open items that need
    their credentials or approval.

## Specifications (postconditions)

- Every claim in the requirement maps to a command, metric, PR, session record
  or recording — and the mapping is written down in the plan and the presenter
  thread.
- `main` (or the durable before-state branch) reproduces the symptom from seed
  alone; the answer key lives on an unmerged branch and is never merged.
- Time-to-trigger is stated in the scenario catalog and was measured within it.
- A deliberate mutation makes a gate fail closed; the failure writes a report.
- The Automation config (trigger, prompt, connectors, limits, network policy) is
  a file in the repo, validated against the API, with one-line rationale per
  choice, and a simulate/paste-by-hand fallback exists.
- At least one unattended end-to-end run happened in the build org with its
  session URL, PR URL and before/after numbers recorded.
- Delegated sessions used the requested (cost-efficient) agent mode, set
  explicitly.
- The flow is registered and was run in the target org as the requesting user,
  with `user_id` and `playbook_id` read back.
- An independent assessment report exists and its findings are dispositioned.
- Evidence captions never claim more than the artifact shows.

## Advice and pointers

- Timebox the investigation. Two passes over the repo and the live estate,
  then write the plan; everything else you will learn by building.
- Choose scenarios whose symptom, chart and cause are *different from each
  other* (latency vs. disk vs. memory vs. duplicate work) so the same automation
  demonstrably generalizes.
- Measure before you promise: the first load profile in the incident build
  fired the latency alert at ~300 s against a 180 s promise; the fix was a
  heavier profile (24 rps / 24 concurrency → ~90 s), recorded as a divergence,
  not a silent edit.
- The best worked example is the one the gate handed you. In the incident
  build the correct fix was rejected with `FAIL queries_per_request=5.000 <= 4`
  while p95 passed; the trace proved the optimized path is genuinely five
  statements, so the contract was corrected at its root with an audited reason.
  That beat is worth more than any narration.
- Isolate hard: local fixture on loopback ports, sandbox tenant in its own
  namespace on the shared ingress, golden tenant read-only. When a recording
  must include the golden tenant, let it prove only what it proves (reachability,
  auth) and put the reproduction in the isolated environment.
- Resource limits are part of the scenario. An OOM under a global memory cap
  produced 100 % failed requests and no evidence; scope the tight limit to the
  scenario that needs it.
- Write child briefs the way you would want to receive them: repo, base,
  PR base, forbidden zones, exact verification, final-message shape. A child
  that cannot see the before-state repo wastes its first minutes.
- Two Devin resources are approval-gated and easy to mistake for created:
  Playbook and Automation creation return validation, not existence. Read them
  back before saying they exist; tell the requester which approval cards are
  waiting.
- Prefer `webhook:incoming` as the default trigger (no channel prerequisites);
  add the Slack-message trigger as the higher-fidelity variant when a real
  channel ID exists. Slack triggers take channel IDs, never `#names`.
- Keep the plan, prompts, briefs and scripts as files (`/home/ubuntu/plans/`,
  `/home/ubuntu/prompts/`) — they are the re-run kit for the next event.

## Forbidden actions

- Do not build the demo on the golden `main` or golden tenant; do not seed,
  load-test or inject into a perpetual tenant.
- Do not merge the answer key into the before-state, and do not let a
  validation session push to the before-state branch.
- Do not fix intentionally planted defects that belong to other labs.
- Do not edit thresholds, scenarios, seeds, recorded evidence or gate code to
  turn a red gate green; fix the root or record the divergence.
- Do not claim a trigger, connector or platform capability you did not verify
  against the docs/API; do not claim a recording shows what it does not.
- Do not create target-org Playbooks, Automations or sessions with the current
  org's management tools; use the v3 API scoped by the target `org_id`.
- Do not include customer names, requester identity or email in any repo
  artifact, branch, commit, PR or session title.
- Do not put facilitator logistics in attendee-facing content repos, and do not
  point participants at internal `devin/...` branches.
- Do not run delegated sessions in a more expensive agent mode than the
  requester asked for.
