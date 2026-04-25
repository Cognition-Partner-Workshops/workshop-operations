# Workshop Content

This guide explains how to use the [`workshop-metadata`](https://github.com/Cognition-Partner-Workshops/workshop-metadata) repository to craft workshop content for your events.

## Information Architecture

The workshop-metadata repo uses a layered approach with three discovery routes:

```
┌───────────────────────────────────────────────────────────┐
│                  WORKSHOP DESIGNER                         │
│                                                            │
│  Route 1: Browse by Workshop                               │
│  workshops/ → pick a template → customize for your event   │
│                                                            │
│  Route 2: Browse by Module                                 │
│  modules/ → pick category → pick challenges → see repos    │
│                                                            │
│  Route 3: Browse by Repo                                   │
│  catalog/repos.md → see what challenges each repo supports │
│                                                            │
│  Compose: events/ → instantiate for a specific audience    │
└───────────────────────────────────────────────────────────┘
```

**Modules are the reusable atoms.** Workshops compose modules into structured lab sequences. Events instantiate workshops for specific audiences.

## Step 1: Choose a Workshop Template

Browse `workshops/` for pre-built workshop templates:

| Workshop | Focus | Duration | Labs |
|----------|-------|----------|------|
| [Legacy Modernization](https://github.com/Cognition-Partner-Workshops/workshop-metadata/tree/main/workshops/legacy-modernization) | COBOL/legacy to modern tech stack | 2-4 hours | 1-4 |
| [Framework Upgrades](https://github.com/Cognition-Partner-Workshops/workshop-metadata/tree/main/workshops/framework-upgrades) | Angular + Spring Boot version upgrades | 1-2 hours | 1-2 |
| [Data Source Migration](https://github.com/Cognition-Partner-Workshops/workshop-metadata/tree/main/workshops/data-source-migration) | Legacy DW to modern schema | 1-2 hours | 1-2 |
| [Security & Compliance](https://github.com/Cognition-Partner-Workshops/workshop-metadata/tree/main/workshops/security-compliance) | CVE remediation, SAST, shift-left | 1-2 hours | 1-3 |
| [Platform Microservice Decomposition](https://github.com/Cognition-Partner-Workshops/workshop-metadata/tree/main/workshops/platform-microservice-decomposition) | Monolith to microservices with IaC | 1.5-2 hours | 1 |
| [Agentic AI](https://github.com/Cognition-Partner-Workshops/workshop-metadata/tree/main/workshops/agentic-ai) | Multi-agent systems, anomaly detection | 2-4 hours | 2-4 |
| [Feature Development](https://github.com/Cognition-Partner-Workshops/workshop-metadata/tree/main/workshops/feature-development) | New features on existing apps | 1-2 hours | 1-2 |
| [Quality Engineering](https://github.com/Cognition-Partner-Workshops/workshop-metadata/tree/main/workshops/quality-engineering) | Testing, docs, code review automation | 2-4 hours | 2-4 |
| [General](https://github.com/Cognition-Partner-Workshops/workshop-metadata/tree/main/workshops/general) | 3-track broad tour (security, modernization, features) | 4-6 hours | 9 |

If no template fits, build a custom workshop by composing modules directly (Step 2).

## Step 2: Select Challenge Modules

The repo contains **77 modules across 12 disciplines**:

| Category | Count | Roles |
|----------|-------|-------|
| Application Development | 7 | Software Developer, Full-Stack Engineer |
| Testing & QA | 11 | QA Engineer, SDET, Test Automation Engineer |
| Security | 7 | Security Engineer, AppSec Engineer |
| Compliance & Governance | 3 | Compliance Officer, GRC Analyst |
| DevOps & CI/CD | 5 | DevOps Engineer, Release Engineer |
| Cloud & Infrastructure | 6 | Cloud Engineer, Platform Engineer |
| Observability & SRE | 4 | SRE, Observability Engineer |
| Data Engineering | 5 | Data Engineer, Analytics Engineer |
| Architecture & Design | 5 | Solution Architect, Enterprise Architect |
| AI & ML Engineering | 3 | ML Engineer, AI Engineer |
| Technical Documentation | 6 | Technical Writer, Documentation Engineer |
| Migration & Modernization | 15 | Modernization Specialist, Migration Lead |

Browse all modules: [`modules/README.md`](https://github.com/Cognition-Partner-Workshops/workshop-metadata/blob/main/modules/README.md)

### Module Structure

Every module follows the 4-step format:

1. **Paste into Devin** — a ready-to-use prompt to kick off a session
2. **Research with Ask Devin** — prompts to refine the approach before building
3. **Read the DeepWiki** *(optional)* — explore auto-generated architecture docs
4. **Review & Give Feedback** *(optional)* — iterate on Devin's PR output

Example from the COBOL-to-Java module:

> **Step 1: Paste into Devin**
>
> "Analyze the COBOL program CBACT01C.cbl in uc-legacy-modernization-cobol-to-java. Understand its business logic, data structures (copybooks), and I/O operations. Rewrite it as a Java 17+ application using modern idioms. Create JUnit tests that verify the Java version produces identical results."

### Audience-Based Selection

| Audience | Recommended Categories | Entry Point |
|----------|----------------------|-------------|
| Developers | Feature Dev + Migration | D1 or D4 |
| QA Engineers | Quality + Bug Fixing | A1 or A2 |
| DevOps/Platform | DevOps + Security | E1 or E3 |
| Security Engineers | Security + DevOps | B2 or B3 |
| Architects | Migration + DevOps | C3 or C5 |
| Mixed/General | A + B + C + D | A1 (warm-up) to B1 to C2 to D4 |
| Executive | D4 + A1 + C2 | Quick wins with visible output |

### Time Budget

| Duration | Challenges | Notes |
|----------|-----------|-------|
| 2 hours | 2-3 | One category |
| Half day (4h) | 4-6 | Mix 2 categories |
| Full day (8h) | 8-12 | Mix 3+ categories |
| Multi-day | All | Full curriculum |

## Step 3: Identify Required Repos

Each module references specific repos. Check:
- The module file itself (lists repos under "Repository")
- [`catalog/repos.md`](https://github.com/Cognition-Partner-Workshops/workshop-metadata/blob/main/catalog/repos.md) for the master inventory and cluster information
- The workshop template's "Repos Required" section

Make sure you've mirrored all required repos to your GitHub org (see [01-mirror-github-org.md](01-mirror-github-org.md)).

## Step 4: Create an Event

1. Copy the event template:
   ```bash
   cp -r workshop-metadata/events/_template workshop-metadata/events/YYYY-MM-DD-city
   ```

2. Fill in event details:
   - Date, location, host organization (use `*(customer)*` placeholder — never real customer names)
   - Duration and participant count
   - Link to the workshop template(s) this event uses
   - Agenda with specific challenge assignments and time slots

3. List required repos and runtime resources

4. Note any event-specific customizations to the standard challenges

### Event Naming Convention

- Use `YYYY-MM-DD-city` format: `2026-05-15-tokyo`
- For non-date-specific events: descriptive slugs like `cobol-modernization-workshop`
- Never include customer/partner names in directory names

## Step 5: Prepare Workshop Materials

### Content Guidelines

- **Use "try" not "demo"** — workshops are hands-on, not demonstrations
- **Use "Key Takeaways"** not "Key Talking Points" for summary bullets
- **Call them "workshops"** not "arcs" in user-facing content
- **Never mention customer names** — use generic placeholders like `*(customer)*`
- **US English spelling** — modernization, not modernisation

### Workshop Lab Preparation

For each lab in your event:

1. Verify the repo is mirrored and accessible
2. Check that any planted bugs or starting-state content is on `main` (not feature branches)
3. Verify target outcomes are concrete and verifiable (4-5 deliverables per lab)
4. Test the sample prompt yourself to identify potential issues

### Runtime Resources

Some labs need a running application. Check [`shared/runtime-resources.md`](https://github.com/Cognition-Partner-Workshops/workshop-metadata/blob/main/shared/runtime-resources.md) for:
- Which challenges need runtime resources
- Local run instructions (participants can ask Devin to run apps locally)
- Hosted instance provisioning (if needed)

## Creating New Modules

To add a new challenge module to the workshop-metadata repo:

1. Create a markdown file in the appropriate `modules/<category>/` directory
2. Follow the 4-step format (Paste into Devin, Research with Ask Devin, Read DeepWiki, Review & Give Feedback)
3. Include: Challenge description, Target Outcomes (4-5 verifiable deliverables), Repository links, Difficulty, Estimated Time, Devin Features Exercised
4. Add cross-references in `catalog/repos.md` for any repos the challenge uses
5. Update `modules/README.md` with the new module entry
