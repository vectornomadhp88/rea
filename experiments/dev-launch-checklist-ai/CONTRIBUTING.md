# Contributing

Thanks for helping improve `dev-launch-checklist-ai`.

## Development

```bash
npm install
node ./src/cli.mjs /absolute/path/to/repo --fix-suggestions --output ./samples/sample-report.md
```

## Pull requests

- Keep changes focused and small.
- Add or update sample output when scanner behavior changes.
- Explain evidence rules when changing scoring logic.

## Scope

In this MVP phase, prioritize:

- developer trust (evidence + predictable scoring)
- local-only/privacy-first behavior
- non-destructive suggestions
