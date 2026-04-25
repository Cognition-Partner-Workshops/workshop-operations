# Mirror the GitHub Organization

This guide walks through cloning all repositories from the `Cognition-Partner-Workshops` GitHub org (or any source org) into your own GitHub organization.

## Overview

The Cognition-Partner-Workshops org contains ~80 repositories with workshop content — application codebases, use-case demos, tech-stack examples, and infrastructure templates. To run these workshops in your own environment, you need your own copies of these repos.

**Important:** We use independent copies, not git mirrors. Mirrors would overwrite your lab-specific changes (planted bugs, custom branches, modified configs). Each target repo diverges independently from the source.

## Prerequisites

- [GitHub CLI (`gh`)](https://cli.github.com/) authenticated with `admin:org` and `repo` scopes for both source and target orgs
- `git` and `jq` installed
- Admin access to the target GitHub org

## Quick Start

```bash
# Preview what would be mirrored
./scripts/mirror-github-org.sh Cognition-Partner-Workshops YOUR_ORG --dry-run

# Mirror all repos as private repos (default)
./scripts/mirror-github-org.sh Cognition-Partner-Workshops YOUR_ORG

# Mirror with custom visibility
./scripts/mirror-github-org.sh Cognition-Partner-Workshops YOUR_ORG --visibility=internal
```

## What the Script Does

For each repo in the source org:

1. **Clones** a bare copy of the repo
2. **Strips CI workflows** (`.github/workflows/`) by default — your PAT may not have `workflow` scope, and source CI pipelines may reference resources you don't have
3. **Creates** a new repo in the target org with the same name and description
4. **Pushes** all branches and tags to the target
5. **Sleeps** 0.5s between repos to avoid GitHub API rate limits

## Filtering

```bash
# Only mirror repos matching a pattern
./scripts/mirror-github-org.sh Cognition-Partner-Workshops YOUR_ORG --include="uc-*"

# Exclude specific repos
./scripts/mirror-github-org.sh Cognition-Partner-Workshops YOUR_ORG --exclude="*.github.io"

# Keep CI workflows (if you want them)
./scripts/mirror-github-org.sh Cognition-Partner-Workshops YOUR_ORG --no-strip-workflows
```

## Selective Mirroring

You don't need all 80 repos for every workshop. Each workshop template in the [`workshop-metadata`](https://github.com/Cognition-Partner-Workshops/workshop-metadata) repo lists which repos it requires under "Repos Required." Mirror only what you need:

```bash
# Example: mirror only repos needed for the Legacy Modernization workshop
./scripts/mirror-github-org.sh Cognition-Partner-Workshops YOUR_ORG \
  --include="uc-legacy-modernization-*" \
  --include="aws-mainframe-modernization-carddemo"
```

Or create a file listing the repos you need and mirror from that list using `gh` directly.

## Repo Naming Convention

Repos in the source org follow a prefix convention:

| Prefix | Meaning | Example |
|--------|---------|---------|
| `uc-` | Use Case | `uc-legacy-modernization-cobol-to-java` |
| `ts-` | Tech Stack | `ts-java-spring-boot-realworld-example-app` |
| `i-` | Industry Vertical | `i-banking-loan-processing` |
| `app_<name>-` | Multi-repo App | `app_petclinic-angular`, `app_petclinic-backend` |
| _(none)_ | Forks/utilities | `cal.com`, `fineract` |

Keep these names in your target org — the workshop content (modules, events) references repos by name.

## Repo Clusters

Some repos are intentional duplicates from the same upstream (e.g., two labs need the same Spring Boot monolith but with different objectives). The full cluster mapping is in [`workshop-metadata/catalog/repos.md`](https://github.com/Cognition-Partner-Workshops/workshop-metadata/blob/main/catalog/repos.md). You need all repos in a cluster if you're running any lab from that cluster.

## After Mirroring

1. **Verify** a few repos were mirrored correctly: check branch counts, commit history, and file contents
2. **Set up Devin** for these repos — see [02-devin-enterprise-setup.md](02-devin-enterprise-setup.md)
3. **Add upstream remotes** if you want to pull future updates from the source:
   ```bash
   cd your-repo
   git remote add upstream https://github.com/Cognition-Partner-Workshops/your-repo.git
   git fetch upstream
   ```

## Logs

Mirror logs are written to `./mirror-logs/` with timestamps. Review the log to verify all repos were mirrored successfully and investigate any failures.
