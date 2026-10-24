# dev-launch-checklist-ai

**Promise:** get a project readiness report in ~10 minutes.

`dev-launch-checklist-ai` scans a local repository and generates a markdown report with:

- production readiness checklist
- security and performance quick audit
- release checklist
- CI missing-parts report

## Why this prototype exists

This MVP is intentionally isolated under `experiments/` so we can validate the concept before turning it into a standalone public repository.

## Features in MVP

- Evidence-backed scoring (0-100)
- 5 core modules:
  1. README quality
  2. Tests presence
  3. CI health
  4. Dependency risk
  5. Release readiness
- `--fix-suggestions` mode (non-destructive)
- Local-only analysis by default (no code upload)

## Usage

```bash
cd /home/runner/work/rea/rea/experiments/dev-launch-checklist-ai
node ./src/cli.mjs /absolute/path/to/repo --fix-suggestions --output ./report.md
```

### Arguments

- `<target>`: absolute local repository path
- `--output <path>`: write markdown report to file
- `--fix-suggestions`: append actionable suggestions
- `--json`: print structured JSON instead of markdown

## Privacy

The scanner reads local files only and does not send repository content anywhere.

## Example output

See [`samples/sample-report.md`](./samples/sample-report.md).
