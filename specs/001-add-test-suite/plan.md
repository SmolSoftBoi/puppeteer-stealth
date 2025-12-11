# Implementation Plan: Modern Test Suite for Puppeteer Stealth

**Branch**: `001-add-test-suite` | **Date**: 2025-12-10 | **Spec**: `/specs/001-add-test-suite/spec.md`
**Input**: Feature specification from `/specs/001-add-test-suite/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Introduce a Vitest-based testing stack for the TypeScript Puppeteer stealth library, covering every exported helper with fast unit suites plus fixture-driven integration tests that exercise real stealth plugins without touching the network. Deliver a clear folder layout (`tests/unit`, `tests/integration`), Yarn scripts (`test`, `test:watch`, `test:coverage`), coverage enforcement (100% exported functions, 90% overall), and documentation for local + CI execution while reiterating compliance safeguards.

## Technical Context

**Language/Version**: TypeScript 5.x targeting Node.js Active LTS (20.x)  
**Primary Dependencies**: Vitest + @vitest/coverage-c8, ts-node/tsx for inline TS execution, puppeteer, puppeteer-extra-plugin-stealth, sinon/vi mocks for fixtures  
**Storage**: N/A (in-memory fixtures only)  
**Testing**: Vitest test runner with jsdom/node environments, c8 coverage, custom fixture harness  
**Target Platform**: Headless Linux runners (CI) and local macOS/Linux dev machines running Node 20  
**Project Type**: Single TypeScript library package (src + tests)  
**Performance Goals**: `npm test` < 90s wall clock on laptop; watch mode hot reload < 2s; coverage report generated every CI run  
**Constraints**: Zero outbound network calls; puppeteer binary optional; fixtures must fail-fast if Chromium download triggered; maintain-safe defaults + compliance logging  
**Scale/Scope**: ~3 exported helpers today, expect growth to ~10 modules; tests anticipated < 150 specs split between unit/integration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Ethical Automation & Transparency** – Testing plan reiterates README disclaimer inside docs/quickstart, enforces local fixtures only, and adds fail-fast guards when any test attempts outbound traffic.
- [x] **Modular Stealth Surface** – Work only touches `tests/**` + documentation; plugins remain modular and TypeScript strict mode/Yarn scripts stay intact; Node 20 enforced in CI matrix.
- [x] **Safe & Documented Public APIs** – Every exported helper (`onPageCreated`, `beforeLaunch`, `beforeConnect`) receives named unit suites plus README/quickstart snippets showing safe defaults and opt-in flags.
- [x] **Tests Gate Every Module** – Unit + integration coverage spans all plugins with mocked Puppeteer Pages and real stealth modules; CI forbids talking to third-party sites.
- [x] **Release Discipline & Observability** – Plan includes changelog + README testing section updates, coverage badge, and guidance for logging which evasions run during fixture tests so adopters can audit behavior.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
└── index.ts                # exported helpers wiring puppeteer-extra-plugin-stealth

tests/
├── unit/                   # vi.mock-based specs per exported helper
├── integration/            # fixture flows using mocked Puppeteer Page + real stealth modules
└── fixtures/               # reusable mock builders (page, browser options, rate-limit data)

docs/
└── testing.md              # quickstart + compliance reminders for running the suite

.github/
└── workflows/
  └── ci.yml             # lint + test + coverage jobs (new/updated)
```

**Structure Decision**: Single-package TypeScript library; tests live under `tests/{unit,integration}` with shared fixtures, and documentation lands in `docs/testing.md`. Existing `src/index.ts` remains the public surface while CI workflow orchestrates lint → build → vitest.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| _None_ |  |  |

## Phase 0 – Research Summary

| Topic | Outcome | Reference |
|-------|---------|-----------|
| Vitest runner defaults | Use Vitest node environment by default, allow per-test jsdom, run TS source directly | `research.md#decision-1` |
| Coverage tooling | Adopt @vitest/coverage-c8 with LCOV + text-summary, thresholds 100% exported functions / 90% global | `research.md#decision-2` |
| Mocking strategy | Shared fixture factories mock Puppeteer objects while importing real stealth plugins | `research.md#decision-3` |
| CI workflow | Install → lint → build → test → coverage with caching on Node 20.x | `research.md#decision-4` |

All Technical Context fields are now concrete, and no `NEEDS CLARIFICATION` markers remain.

## Phase 1 – Design & Contracts

### Data Model Highlights
- `TestRunnerConfig` centralizes Vitest env, globbing, coverage thresholds, and the fail-fast network guard bit.
- `FixtureLibrary` exposes factories for `Page`, `Browser`, options, plugin manifests, and telemetry sinks ensuring integration parity with runtime modules.
- `CoverageArtifacts` tracks text + LCOV outputs plus threshold states for CI enforcement.

### API/Contract Outputs
- `contracts/testing-suite.openapi.yaml` defines logical endpoints for `yarn test`, `yarn test:watch`, and `yarn test:coverage`, enabling tooling and CI integration.
- Interfaces in `tests/fixtures` will mirror Puppeteer types so TypeScript consumers get compile-time hints when writing new specs.

### Developer Quickstart
- `quickstart.md` documents prerequisites, Yarn commands, guardrails against live traffic, and CI expectations.
- README will reference `docs/testing.md` derived from the quickstart to reiterate Responsible Automation before execution.

### Constitution Check (Post-Design)
- [x] **Ethical Automation & Transparency** – Quickstart + docs repeat disclaimers, fixtures stub outbound network modules, and telemetry assertions confirm transparency.
- [x] **Modular Stealth Surface** – Tests validate plugins without altering their modular structure; TypeScript strict config shared between src/tests.
- [x] **Safe & Documented Public APIs** – Quickstart + future README section explain safe defaults, opt-in flags, and required TSDoc for new helpers.
- [x] **Tests Gate Every Module** – Data model + contracts ensure every export has unit coverage and at least two integration flows using fixtures.
- [x] **Release Discipline & Observability** – Coverage artifacts + CI steps feed changelog updates and support future badges/metrics.

## Phase 2 – Implementation Strategy (next steps)
1. **Tooling setup**: Add Vitest + coverage deps, create `vitest.config.ts`, wire Yarn scripts (`test`, `test:watch`, `test:coverage`), and update tsconfig path aliases if needed.
2. **Fixture + helper scaffolding**: Build `tests/fixtures/` factories for Puppeteer `Page`, `Browser`, and shared telemetry/rate-limit data; add network guard util.
3. **Unit suites**: Write targeted specs for `onPageCreated`, `beforeLaunch`, `beforeConnect`, covering success + failure cases, logging, and option mutation order.
4. **Integration suites**: Implement at least two flows verifying plugin hook invocation and rate-limit enforcement using real stealth plugin modules, plus a dedicated negative spec that triggers the network guard and a fixture-driven test covering missing Chromium binaries.
5. **Documentation + CI**: Author `docs/testing.md`, update README testing section, add coverage badge or summary, adjust `.github/workflows/ci.yml` to run lint/test/coverage with caching, and capture/publish `yarn test` wall-clock duration so CI fails when it exceeds 90 seconds.
6. **Changelog + observability**: Record new scripts/tests in CHANGELOG, ensure telemetry sinks log which evasions were exercised, and expose debug output path for adopters.

_Stop here per instructions; detailed task breakdown continues in `/speckit.tasks` during the next phase._
