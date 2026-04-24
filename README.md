# Operator

Tools for mirroring and operating Cognition Partner Workshops in your own GitHub org and Devin Enterprise.

## Cleanup Scripts

Located in `scripts/`. All scripts are parameterized — pass your GitHub org name as the first argument.

### Prerequisites

- [GitHub CLI (`gh`)](https://cli.github.com/) authenticated with `repo` and `pull-request` scopes
- `jq` installed

### Individual Scripts

| Script | Purpose |
|--------|---------|
| `sanitize-pr-pii.sh` | Remove "Requested by" PII from PR descriptions, issue comments, and review comments |
| `delete-stale-branches.sh` | Delete branches with no commits in N weeks (default 3), excluding the default branch |
| `close-old-prs.sh` | Close open PRs older than N weeks (default 3) with a comment |
| `cleanup-all.sh` | Run all three scripts in sequence |

### Usage

```bash
# Dry run (preview changes without modifying anything)
./scripts/cleanup-all.sh Cognition-Partner-Workshops --dry-run

# Execute cleanup with default 3-week threshold
./scripts/cleanup-all.sh Cognition-Partner-Workshops

# Custom threshold
./scripts/cleanup-all.sh Cognition-Partner-Workshops --stale-weeks=4

# Run individual scripts
./scripts/sanitize-pr-pii.sh Cognition-Partner-Workshops --dry-run
./scripts/delete-stale-branches.sh Cognition-Partner-Workshops --stale-weeks=2
./scripts/close-old-prs.sh Cognition-Partner-Workshops --older-than-weeks=4
```

### Logs

All scripts write timestamped logs to `./cleanup-logs/`. Each run produces a separate log file.

### Mirroring to Your Own Org

These scripts work with any GitHub org. To run the same workshops in your own environment:

1. Fork/mirror all repos from `Cognition-Partner-Workshops` to your org
2. Run `./scripts/cleanup-all.sh YOUR_ORG_NAME` to sanitize PII and clean up stale artifacts
