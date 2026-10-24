# Project Readiness Report

- **Target:** /home/runner/work/rea/rea
- **Generated at:** 2026-10-24T23:21:18.862Z
- **Overall score:** 100/100 (grade A)

## Scorecard

| Module            | Score | Status  |
| ----------------- | ----: | ------- |
| README quality    | 20/20 | healthy |
| Tests presence    | 20/20 | healthy |
| CI health         | 20/20 | healthy |
| Dependency risk   | 20/20 | healthy |
| Release readiness | 20/20 | healthy |

## README quality

- Detected 19 markdown heading(s).
- Installation/setup section: present.
- Usage/examples section: present.

Evidence:

- `README.md`

## Tests presence

- Detected 1924 test-related file(s)/path(s).

Evidence:

- `http3-lab.test.py`
- `http3-capture-assertions.test.mjs`
- `http3-verifier-lifecycle.test.mjs`
- `AdbCommand.test.ts`
- `AdbConfiguration.test.ts`
- `AdbDeviceOutput.test.ts`
- `AdbHostFileName.test.ts`
- `AdbProvider.test.ts`

## CI health

- Workflow files detected: 32.
- pull_request trigger: yes.
- push trigger: yes.
- Automated test command detected: yes.

Evidence:

- `.github/workflows/cache-retention.yml`
- `.github/workflows/ci-full-pr.yml`
- `.github/workflows/ci-timings.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/ghidra-bridge-sources.yml`
- `.github/workflows/mutation.yml`
- `.github/workflows/nativeaot-fixtures.yml`
- `.github/workflows/pages.yml`
- `.github/workflows/pr-readiness.yml`
- `.github/workflows/pr-title.yml`
- `.github/workflows/real-agentenv.yml`
- `.github/workflows/real-binary-layout.yml`
- `.github/workflows/real-browser.yml`
- `.github/workflows/real-cutter.yml`
- `.github/workflows/real-evm-interface.yml`
- `.github/workflows/real-ghidra-windows.yml`
- `.github/workflows/real-go-binary.yml`
- `.github/workflows/real-hopper-linux.yml`
- `.github/workflows/real-hopper.yml`
- `.github/workflows/real-javascript-recovery.yml`
- `.github/workflows/real-packet-capture.yml`
- `.github/workflows/real-recorded-crash.yml`
- `.github/workflows/real-signal-recording.yml`
- `.github/workflows/real-termux.yml`
- `.github/workflows/real-web-network-captures.yml`
- `.github/workflows/real-web-runtime.yml`
- `.github/workflows/real-web-source-map.yml`
- `.github/workflows/release-recovery.yml`
- `.github/workflows/release.yml`
- `.github/workflows/sqlite-runtime.yml`
- `.github/workflows/website-check.yml`
- `.github/workflows/website-pages.yml`

## Dependency risk

- Node dependencies declared: 67.

Evidence:

- `package.json`
- `package-lock.json`

## Release readiness

- Release hygiene files present: 4/4.
- All baseline release files detected.

Evidence:

- `LICENSE`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `SECURITY.md`

## Privacy mode

- Local-only scan: no repository code is uploaded by this CLI.
- URL inputs are not fetched in this MVP; provide a local checkout path.
