# dev-launch-checklist-ai

[![CI](https://img.shields.io/github/actions/workflow/status/your-username/dev-launch-checklist-ai/ci.yml?branch=main&style=flat-square)](https://github.com/your-username/dev-launch-checklist-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg?style=flat-square)](./LICENSE)
[![Stars](https://img.shields.io/github/stars/your-username/dev-launch-checklist-ai?style=flat-square)](https://github.com/your-username/dev-launch-checklist-ai/stargazers)

**Promise:** get a project readiness report in ~10 minutes.

`dev-launch-checklist-ai` scans a local repository and generates:

- production readiness checklist
- security and performance quick audit
- release checklist
- CI missing-parts report

> This folder is a standalone-ready scaffold kept under `experiments/` for now. Replace `your-username` in badges when publishing.

## MVP capabilities

- Evidence-backed scoring (0-100)
- 5 core modules:
  1. README quality
  2. Tests presence
  3. CI health
  4. Dependency risk
  5. Release readiness
- `--fix-suggestions` mode (non-destructive)
- Local-only analysis by default (no code upload)

## Quick start

```bash
cd /home/runner/work/rea/rea/experiments/dev-launch-checklist-ai
node ./src/cli.mjs /absolute/path/to/repo --fix-suggestions --output ./report.md
```

### CLI arguments

- `<target>`: absolute local repository path
- `--output <path>`: write markdown or JSON report to a file
- `--fix-suggestions`: append actionable suggestions
- `--json`: output structured JSON instead of markdown

## Sample output

- Markdown: [`samples/sample-report.md`](./samples/sample-report.md)

## Privacy

The scanner reads local files only and does not send repository content anywhere.

## Publish as your own repo

1. Copy this folder into a new repository named `dev-launch-checklist-ai`.
2. Update `README.md` badges (`your-username` → your GitHub username).
3. Push to GitHub and enable Actions.
4. Follow [`docs/launch-kit.md`](./docs/launch-kit.md) for launch checklist.

## Roadmap

- Add optional URL clone mode (`--repo-url`) with explicit consent.
- Add score history and trend reports.
- Add ecosystem-specific checks (Go/Rust/Java).
