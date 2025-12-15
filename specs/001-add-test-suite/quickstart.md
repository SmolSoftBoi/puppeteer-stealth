# Testing Suite Quickstart

## Prerequisites
- Node.js 20.x (Active LTS)
- Yarn 1.22+
- No chromium download required; integration fixtures mock Puppeteer objects
- Environment variable `PUPPETEER_STEALTH_STRICT=1` (default) blocks outbound network calls during tests

## Install
```bash
yarn install --frozen-lockfile
```

## Commands
| Task | Command | Notes |
|------|---------|-------|
| Run all unit + integration tests | `yarn test` | Executes Vitest in node environment with fail-fast network stubs |
| Watch mode for local dev | `yarn test:watch` | Enables hot module reload, no coverage instrumentation |
| Coverage gate | `yarn test:coverage` | Enforces 90% global thresholds |
| Lint + typecheck (pre-req) | `yarn lint && yarn build` | Run before publishing or pushing |

## Writing Tests
1. Place unit specs under `tests/unit/<module>.spec.ts` and integration flows under `tests/integration/<scenario>.spec.ts`.
2. Reuse factories from `tests/fixtures/` to mock Puppeteer `Page`, `Browser`, and launch options—never instantiate Chromium directly.
3. Use `tests/fixtures/pluginManifest.ts` to exercise real `puppeteer-extra-plugin-stealth` plugins when validating wiring; prefer enabling them via `modules: [...]` (rather than injecting hand-written stubs) so the public selection surface stays covered.
4. Add assertions that confirm rate-limit defaults, opt-in flags, and telemetry logs remain intact.

## Compliance Guardrails
- Tests fail immediately if any code attempts to open network sockets or navigate to `http/https` URLs.
- README disclaimer is referenced in `docs/testing.md`; contributors must acknowledge benign automation principles before merging.
- Integration fixtures log which evasions were activated so reviewers can audit opt-in combinations.

## CI Expectations
1. Workflow pins Node 20.x and caches Yarn + Vitest artifacts.
2. Job order: install → lint → build → `yarn test` → `yarn test:coverage`.
3. Coverage artifacts (`coverage/lcov.info`, HTML report) are uploaded for every run.
4. Any coverage dip below thresholds or outbound network attempt marks the build as failed.
