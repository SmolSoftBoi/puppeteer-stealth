# Testing Guide

This document explains how to run, extend, and audit the Vitest-powered suite that now ships with `puppeteer-stealth`. Every command below executes entirely against local fixtures—no outbound network traffic is permitted.

## Prerequisites

- Node.js **20.x** (Active LTS). Use `.nvmrc` to stay aligned with CI.
- Yarn **1.22+**.
- `PUPPETEER_STEALTH_STRICT=1` (default) so safeguard assertions remain active.

Install dependencies with:

```bash
yarn install --frozen-lockfile
```

## Commands

| Task | Command | Notes |
|------|---------|-------|
| Typecheck (src + tests) | `yarn typecheck` | Runs `tsc` against `tsconfig.test.json` with `--noEmit` for fast feedback. |
| Run unit + integration suites | `yarn test` | Executes all specs under `tests/**` with the fail-fast network guard. |
| Watch mode | `yarn test:watch` | Ideal for local iteration; coverage is disabled for faster feedback. |
| Coverage enforcement | `yarn test:coverage` | Generates text, HTML, and LCOV reports while enforcing 90% global thresholds. |

## Verified Output

`yarn test`:

```text
$ vitest run --config vitest.config.ts

 RUN  v4.0.15 /workspaces/puppeteer-stealth

 Test Files  11 passed (11)
		Tests  20 passed (20)
	Duration  3.80s
```

`yarn test:coverage`:

```text
$ vitest run --config vitest.config.ts --coverage

 RUN  v4.0.15 /workspaces/puppeteer-stealth
	 Coverage enabled with v8

 % Coverage report from v8
----------|---------|----------|---------|---------|
All files |   96.36 |    90.47 |     100 |      99 |
----------|---------|----------|---------|---------|
```

## Folder Layout

| Path | Description |
|------|-------------|
| `tests/unit/` | Fast specs for every exported helper (`onPageCreated`, `beforeLaunch`, `beforeConnect`, safeguards). |
| `tests/integration/` | Fixture-driven wiring tests that import real `puppeteer-extra-plugin-stealth` modules without reaching the internet. |
| `tests/fixtures/` | Shared Puppeteer mocks, telemetry sinks, rate-limit profiles, and the real-plugin manifest used by integration specs. |
| `tests/setup/` | Global hooks, including the fail-fast network guard that stubs `http`, `https`, `net`, `tls`, `dns`, and `fetch`. |

## Responsible Automation Guardrails

- The Vitest setup mocks every outbound network primitive; any attempt to access `http://` or `https://` fails instantly with actionable messaging.
- `src/index.ts` emits telemetry events for each hook plus a "responsible-automation" safeguard event so tests can assert opt-in defaults were not tampered with.
- Unit tests verify that safeguards remain enabled by default and that setting `strictCompliance: false` is an explicit, opt-in action.

## Unit Suite Expectations

- Inject custom plugin objects via the optional handler parameters to validate ordering, telemetry, and error propagation without touching real stealth modules.
- Use the helpers from `tests/fixtures/puppeteer.ts` to build deterministic launch options, mocked `Page` objects, and telemetry sinks for assertions.

## Integration & CI

- Use `tests/fixtures/pluginManifest.ts` to decide which real stealth modules to exercise and keep selection consistent across specs.
- Prefer enabling real modules via `modules: [...]` in `StealthHandlerOptions` (instead of injecting hand-written plugin stubs) so tests validate the public selection surface.
- Integration specs must remain offline. If anything calls `fetch`, `http(s)`, `net`, `tls`, or `dns`, the global network guard will fail the test with the Responsible Automation message.
- `tests/integration/chromiumMissing.spec.ts` verifies Chromium availability and skips gracefully with guidance when Puppeteer binaries are absent.

GitHub Actions runs `yarn test` and `yarn test:coverage`, uploads coverage artifacts, and fails if runtime exceeds the documented 90-second budget.

### CI Gates

- Workflow: `.github/workflows/ci.yml`
- Runtime: Node.js 20.x
- Order: `yarn lint` → `yarn build` → `yarn test` (timed, must be ≤ 90s) → `yarn test:coverage`
- Artifacts: uploads the full `coverage/` directory (including `lcov.info` + HTML report)

## Troubleshooting

- **Engine mismatch**: run `nvm use` (or rebuild the devcontainer) to ensure Node 20 is active; Yarn refuses to run with older runtimes.
- **Network guard failures**: verify new tests rely on fixtures; any accidental `fetch`, `http.request`, or socket usage indicates the spec is violating policy and should be rewritten.
- **Coverage drops**: run `yarn test:coverage --runTestsByPath <spec>` to focus on the area in question, then consult the HTML report under `coverage/`.
