# Test Suite Layout

This directory tree provides a deterministic structure for the Vitest migration. All contributors must follow the folder and naming conventions below so CI discovers new specs automatically.

## Folders

| Path | Purpose |
|------|---------|
| `tests/unit/` | Fast specs for every exported helper in `src/`. File names follow `*.spec.ts` and rely on vi mocks only. |
| `tests/integration/` | Fixture-driven flows that import real `puppeteer-extra-plugin-stealth` modules while keeping Puppeteer objects mocked. |
| `tests/fixtures/` | Shared factories for mocked `Page`, `Browser`, launch/connect options, plugin manifests, rate-limit profiles, and telemetry sinks. |
| `tests/setup/` | Global Vitest setup (e.g., network guard, telemetry wiring) executed before specs run. |

## Guardrails

- **No outbound network calls**: Fixtures stub every HTTP/socket primitive and trigger an immediate failure if a spec attempts to reach `http://` or `https://` targets.
- **Local-only Chromium usage**: Integration tests never download Chromium. Missing binaries must be detected via fixtures and result in a skipped test with remediation guidance.
- **Responsible automation reminders**: Each suite should assert that opt-in safeguards, rate-limit defaults, and the README disclaimer surfaces remain intact.
- **Deterministic telemetry**: Use the shared spies from `tests/fixtures/` to capture which evasions/plugins execute so reviewers can audit opt-in combinations.

Refer to `/specs/001-add-test-suite/quickstart.md` for the commands (`yarn test`, `yarn test:watch`, `yarn test:coverage`) once they are wired up in later phases. Until then, keep new specs colocated here so future tooling work can drop in without churn.
