# bootstrap

Mirror the entire [Cognition-Partner-Workshops](https://github.com/Cognition-Partner-Workshops) GitHub org into your own organization so you can run workshops independently.

## Quick Start

```bash
# 1. Clone this repo
git clone https://github.com/Cognition-Partner-Workshops/bootstrap.git
cd bootstrap

# 2. Preview what will be cloned
./clone-all.sh --target-org <your-org> --dry-run

# 3. Clone everything (private repos by default)
./clone-all.sh --target-org <your-org>
```

## clone-all.sh

Reads the canonical repo list from [`workshop-metadata/catalog/upstream-map.yaml`](https://github.com/Cognition-Partner-Workshops/workshop-metadata/blob/main/catalog/upstream-map.yaml) and mirror-clones every repo into a target GitHub org.

### Prerequisites

| Tool | Purpose |
|------|---------|
| [gh](https://cli.github.com/) | Create repos in the target org and fetch the repo list |
| git | Mirror-clone and push |
| python3 + [PyYAML](https://pypi.org/project/PyYAML/) | Parse `upstream-map.yaml` |

The `gh` CLI must be authenticated with permissions to **create repos** and **push** in the target org.

### Options

```
--target-org <org>        Target GitHub organization (required)
--source-org <org>        Source GitHub organization   (default: Cognition-Partner-Workshops)
--visibility <v>          private | public | internal  (default: private)
--metadata-ref <ref>      Git ref for upstream-map.yaml (default: main)
--include-bootstrap       Also clone the bootstrap repo itself
--skip-existing           Skip repos that already exist in the target org
--dry-run                 Show what would be done without doing it
-h, --help                Show this message
```

### How It Works

1. Fetches `upstream-map.yaml` from the source org via the GitHub API
2. Extracts every repo name from the `repos:` section
3. For each repo:
   - Creates an empty repo in the target org (with `--<visibility>`)
   - `git clone --mirror` from the source org (all branches, tags, and refs)
   - `git push --mirror` to the target org
   - Cleans up the local mirror clone
4. Prints a summary of successes, skips, and failures
