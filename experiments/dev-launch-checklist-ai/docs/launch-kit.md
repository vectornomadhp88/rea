# Launch kit

Use this checklist when publishing `dev-launch-checklist-ai` as a standalone repository.

## 1) Repository setup

- Create public repository: `dev-launch-checklist-ai`.
- Copy this folder contents to repository root.
- Replace `your-username` in README badge links.
- Enable GitHub Actions.

## 2) Trust and adoption assets

- Keep `samples/sample-report.md` updated with latest scanner behavior.
- Keep issue templates and PR template active.
- Add a 30-60 second terminal demo GIF in repository assets.

## 3) Launch checklist

- Publish v0.1.0 release notes from `CHANGELOG.md`.
- Post one before/after report example from a real open-source repo.
- Publish launch thread with copy-paste command:
  - `node ./src/cli.mjs /absolute/path/to/repo --fix-suggestions --output ./report.md`

## 4) First 30 days growth loop

- Ship community-requested checks weekly.
- Label easy tasks as `good first issue`.
- Publish monthly benchmark report with scoring improvements.
