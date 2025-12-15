# Tasks: Modern Test Suite for Puppeteer Stealth

**Input**: Design documents in `/specs/001-add-test-suite/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/testing-suite.openapi.yaml, quickstart.md

**Tests**: Every story requires Vitest unit coverage plus at least one local Puppeteer fixture integration test. No external network calls.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align runtime prerequisites (Node 20 + Yarn) and create the folder skeleton demanded by the plan before adding tooling.

- [x] T001 Update Node requirement to `>=20` in `package.json` and document Yarn + Node prerequisites in `README.md`.
- [x] T002 [P] Create `.nvmrc` at repo root pinning Node 20.x to keep local and CI environments aligned.
- [x] T003 [P] Scaffold `tests/unit`, `tests/integration`, `tests/fixtures`, and `tests/setup` directories plus `tests/README.md` describing layout and compliance guardrails.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Install and configure the Vitest stack, coverage thresholds, fixtures, and guardrails that every user story depends upon.

- [x] T004 Install Vitest tooling (e.g., `vitest`, `@vitest/coverage-c8`, `tsx`, `@types/node`) and remove legacy Jest deps inside `package.json`/`yarn.lock`.
- [x] T005 [P] Create `vitest.config.ts` with node environment default, coverage thresholds (functions 100%, global 90%), include/exclude globs, and reference setup files.
- [x] T006 [P] Add Yarn scripts `test`, `test:watch`, `test:coverage` in `package.json` mapping to the Vitest commands defined in the contracts doc.
- [x] T007 [P] Implement shared Puppeteer mock factories + rate-limit profile per the data model inside `tests/fixtures/puppeteer.ts` and export typed helpers.
- [x] T008 [P] Create fail-fast network guard + telemetry sink under `tests/setup/network-guard.ts`, mocking `net/http` modules and hooking into Vitest setup.
- [x] T009 [P] Update `tsconfig.json` to include `tests/**`, add strict compiler options for tests, and configure a path alias (e.g., `@tests/*`) pointing to `tests/`.

**Checkpoint**: Once T004–T009 pass review, user stories can begin.

---

## Phase 3: User Story 1 – Maintainer validates a plugin tweak (Priority: P1)

**Goal**: Provide fast, deterministic unit feedback for every exported helper so maintainers can catch regressions before publishing.
**Independent Test**: `yarn test` executes all unit suites (`tests/unit/*.spec.ts`) in under 90s without requiring a build.

### Tests for User Story 1

- [x] T010 [P] [US1] Add `tests/unit/onPageCreated.spec.ts` covering plugin hook invocation order, logging, and failure cases via mocked `Page` objects.
- [x] T011 [P] [US1] Add `tests/unit/beforeLaunch.spec.ts` asserting option mutations (args defaults, webdriver overrides) using fixture launch options.
- [x] T012 [P] [US1] Add `tests/unit/beforeConnect.spec.ts` verifying user-agent overrides and telemetry publishing with mocked browser connect options.
- [x] T013 [P] [US1] Add `tests/unit/safeguards.spec.ts` asserting opt-in flags remain enabled by default and that Responsible Automation disclaimer text/logging surfaces during unit execution.

### Implementation for User Story 1

- [x] T014 [US1] Refactor `src/index.ts` `onPageCreated` export to accept injected plugin arrays for testing while emitting telemetry events consumed by the unit suite.
- [x] T015 [US1] Update `src/index.ts` `beforeLaunch`/`beforeConnect` exports to reuse shared fixtures, enforce safe defaults, and document behavior with TSDoc.
- [x] T016 [US1] Expand maintainer instructions in `docs/testing.md` and the `README.md` Testing section to explain running unit suites, interpreting failures, and confirming disclosure messaging.

**Parallel Example (US1)**: T010–T013 can proceed concurrently (separate spec files) while T016 updates documentation.

---

## Phase 4: User Story 2 – Contributor wires a new module (Priority: P2)

**Goal**: Ensure integration tests prove real stealth plugins fire through the public API using only local fixtures.
**Independent Test**: `yarn test --runInBand` targeting `tests/integration/*.spec.ts` runs entirely against fixtures with zero outbound network calls.

### Tests for User Story 2

- [x] T017 [P] [US2] Create `tests/integration/pluginHooks.spec.ts` verifying each selected stealth plugin’s `onPageCreated` hook executes once using mocked `Page` fixtures.
- [x] T018 [P] [US2] Create `tests/integration/rateLimitGuard.spec.ts` proving `beforeLaunch` and `beforeConnect` respect rate-limit profiles and never reach network APIs.
- [x] T019 [P] [US2] Create `tests/integration/networkGuardFailure.spec.ts` that intentionally attempts an outbound call and asserts the fail-fast guard surfaces the compliance message.
- [x] T020 [P] [US2] Create `tests/integration/chromiumMissing.spec.ts` simulating absent Puppeteer binaries, ensuring tests skip gracefully with guidance as required by the edge cases.

### Implementation for User Story 2

- [x] T021 [US2] Extend `tests/fixtures/pluginManifest.ts` to import real `puppeteer-extra-plugin-stealth` modules, expose opt-in lists, and track hook invocations.
- [x] T022 [US2] Enhance `src/index.ts` to accept a module selection config so integration tests (and future contributors) can enable explicit plugin subsets.
- [x] T023 [US2] Document integration workflow (fixtures, opt-in flags, network guard expectations, chromium-missing handling) in `docs/testing.md` and reference it from `quickstart.md`.

**Parallel Example (US2)**: T017–T020 target distinct spec files and can be developed simultaneously, while T021 builds shared fixtures another contributor can consume.

---

## Phase 5: User Story 3 – CI engineer enforces coverage gates (Priority: P3)

**Goal**: Wire coverage enforcement into CI so every pull request proves compliance and surfaces guidance when thresholds drop.
**Independent Test**: GitHub Actions job runs `yarn test:coverage` headlessly, uploads LCOV/text summaries, and fails when thresholds—or timing goals—are violated.

### Tests for User Story 3

- [x] T024 [P] [US3] Add `tests/integration/coverageFail.spec.ts` that simulates coverage below thresholds (via fixture reports) and asserts the coverage script exits non-zero.

### Implementation for User Story 3

- [x] T025 [US3] Update `.github/workflows/ci.yml` to pin Node 20, cache Yarn/Vitest artifacts, and run `yarn lint`, `yarn build`, `yarn test`, and `yarn test:coverage` sequentially.
- [x] T026 [US3] Enhance the CI workflow to record/publish `yarn test` wall-clock duration and fail the job when it exceeds the 90-second success criterion.
- [x] T027 [US3] Add coverage artifact upload + summary comment steps in `.github/workflows/ci.yml`, persisting `coverage/lcov.info` and HTML reports.
- [x] T028 [US3] Document CI execution, coverage thresholds, negative network tests, timing checks, and troubleshooting in `docs/testing.md`.
- [x] T029 [US3] Update the `README.md` Contributing section to require new exports include unit + fixture tests, mention opt-in/disclaimer assertions, and describe CI coverage/timing gates.

**Parallel Example (US3)**: While one engineer adjusts the workflow commands (T025), another can add timing instrumentation (T026) and artifact uploads (T027), with documentation tasks (T028–T029) running in parallel after command names stabilize.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation, changelog, and ecosystem metadata so the feature ships cleanly.

- [x] T030 [P] Update `techstack.md` and `techstack.yml` to list Vitest, @vitest/coverage-v8, and the new testing workflow.
- [x] T031 [P] Add or update `CHANGELOG.md` with entries covering the Vitest migration, coverage/timing gates, and new Yarn scripts.
- [x] T032 Run the documented quickstart commands end-to-end, capture sample output/coverage badge/timing screenshot, and embed the results in `docs/testing.md` for future audits.

---

## Dependencies & Execution Order

1. **Setup (Phase 1)** → must finish before tooling work begins.
2. **Foundational (Phase 2)** → depends on Phase 1; blocks every user story until Vitest config, fixtures, and guardrails exist.
3. **User Stories (Phases 3–5)** → each depends on Foundational completion but otherwise can run in parallel, prioritized P1 → P3.
   - US1 produces the MVP (`yarn test` fast feedback with safeguard assertions).
   - US2 adds integration confidence, negative network coverage, and chromium-missing handling without network access.
   - US3 enforces coverage + timing gates and can start once scripts exist.
4. **Polish (Phase 6)** → runs after desired user stories complete to capture docs/changelog/quickstart validation.

## Parallel Execution Examples

- **US1**: T010–T013 can execute simultaneously (separate spec files). Implementation tasks T014–T016 are independent once fixtures and unit specs are in place.
- **US2**: T017–T020 are independent integration specs; T021 can start concurrently because it only touches `tests/fixtures/`.
- **US3**: T024 (coverage failure spec) can run while CI workflow work (T025–T027) proceeds; docs tasks (T028–T029) follow once CI command names are finalized.

## Implementation Strategy

1. Complete Setup + Foundational (T001–T009) to establish Vitest, fixtures, and guardrails.
2. Deliver **MVP (US1)** by finishing T010–T016 so maintainers gain fast unit feedback plus safeguard verification.
3. Layer **US2** integration confidence (T017–T023) to validate real plugin wiring, negative network behavior, and chromium-missing handling.
4. Harden CI + coverage/timing (**US3**, T024–T029) ensuring every PR respects thresholds and documentation reflects the workflow.
5. Finish with Polish tasks (T030–T032), updating tech stack metadata, changelog, and embedding verified quickstart outputs.

This sequencing delivers a working unit-test MVP quickly while enabling parallelism for integration/CI enhancements and ensuring every story remains independently testable while satisfying all constitutional safeguards.
