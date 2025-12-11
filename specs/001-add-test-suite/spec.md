# Feature Specification: Modern Test Suite for Puppeteer Stealth

**Feature Branch**: `001-add-test-suite`  
**Created**: 2025-12-10  
**Status**: Draft  
**Input**: User description: "Add a testing suite to this existing project.\n\nRequirements:\n- Introduce a modern, fast test runner appropriate for TypeScript.\n- Create unit tests for all core modules and exported functions.\n- Add minimal integration tests that verify module wiring using local fixtures only.\n- Provide clear test folder structure and naming conventions.\n- Add scripts for test, test:watch, and coverage.\n- Document how to run tests locally and in CI.\n\nNon-goals:\n- Do not add tests that require live external websites/services.\n- Do not inflate coverage with low-value snapshot-only tests."

> **Responsible Automation Reminder**: The testing effort must reinforce the README disclaimer—every suite must demonstrate benign, transparent automation, respect robots.txt and published rate limits, and keep all fixtures local so contributors cannot accidentally probe real sites. Document in the test README how the suite enforces these safeguards and how maintainers can audit opt-in evasions.

## Clarifications

### Session 2025-12-10

- Q: Which modern TypeScript test runner should power both unit and integration suites? → A: Use Vitest with native TS + coverage support.
- Q: How should integration tests balance realism with offline execution? → A: Mock Puppeteer Page objects but invoke real stealth plugin modules.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Maintainer validates a plugin tweak (Priority: P1)

A maintainer updates one stealth plugin (e.g., navigator guards) and wants immediate feedback that all exported helpers still behave.

**Why this priority**: Core contributors must rely on fast feedback before publishing to npm; without this, regressions could slip into security-sensitive automation flows.

**Independent Test**: Run `npm test` locally; the suite must execute unit specs for `onPageCreated`, `beforeLaunch`, and `beforeConnect`, fail fast if mocks break, and finish in under 90 seconds on a laptop.

**Acceptance Scenarios**:

1. **Given** a repo clone with dependencies installed, **When** the maintainer runs the default test script, **Then** all unit suites execute in memory using TypeScript inputs without requiring a manual build step.
2. **Given** a regression introduced to any exported function, **When** the maintainer runs the suite, **Then** at least one unit test fails with a clear message pointing to the offending helper.

---

### User Story 2 - Contributor wires a new module (Priority: P2)

A contributor adds a new stealth module and needs integration tests that prove the module is invoked via the public API using only local fixtures.

**Why this priority**: Ensures community additions remain compliant with the "opt-in only" promise and prevents accidental network calls.

**Independent Test**: Run the integration suite located under `tests/integration` using mocked browser/page fixtures; verify wiring without reaching the internet.

**Acceptance Scenarios**:

1. **Given** a local fixture simulating a Puppeteer `Page`, **When** the contributor invokes the exported hardening entry point, **Then** the integration tests confirm each opted-in plugin receives the correct hooks.
2. **Given** fixtures that stub rate-limiting data, **When** integration tests run, **Then** they assert the code never attempts real network navigation and instead reads from fixtures/logs only.

---

### User Story 3 - CI engineer enforces coverage gates (Priority: P3)

The CI engineer must wire the suite into pipelines so every pull request proves the feature set still respects safety rules and coverage minimums.

**Why this priority**: Publishing stealth utilities without automated guardrails threatens project credibility and could enable unsafe automation.

**Independent Test**: Run `npm run test:coverage` in a headless environment; verify exit codes, coverage summary artifacts, and documentation referenced by CI scripts.

**Acceptance Scenarios**:

1. **Given** a CI runner with no GUI access, **When** the coverage script runs, **Then** it completes using mocked fixtures only and uploads a coverage artifact meeting the documented threshold.
2. **Given** a contributor lowers coverage below the documented bar, **When** CI executes the coverage task, **Then** the job fails and publishes a message pointing to the README instructions for remediating gaps.

---

### Edge Cases

- What happens when Puppeteer binaries are unavailable on the host? Tests must skip gracefully with guidance to install dependencies rather than attempting a download, and this scenario must be covered by a dedicated fixture-driven test. 
- How does the system handle race conditions where multiple plugins mutate the same option? Provide fixtures that emulate conflicting hooks and assert deterministic ordering. 
- How do we prevent network leakage if a developer accidentally points a fixture to `https://`? Add assertions/mocks that fail the suite whenever a real URL is requested, reinforcing policy compliance. 
- How are rate-limit defaults validated? Include tests that simulate exceeding the documented limits and confirm the suite surfaces a clear warning instead of retrying aggressively.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Provide a Vitest-based, TypeScript-native test runner configuration that executes specs without a separate build step and supports watch + coverage modes with sub-minute cold starts on typical laptops.
- **FR-002**: Author unit tests for every exported helper (`onPageCreated`, `beforeLaunch`, `beforeConnect`, plus future exports) covering happy paths, failure modes, and logging expectations.
- **FR-003**: Author minimal integration tests that boot the module wiring against mocked Puppeteer fixtures while importing real `puppeteer-extra-plugin-stealth` modules, ensuring plugin hooks fire in order while making zero outbound network calls.
- **FR-004**: Establish a deterministic folder and naming convention (e.g., `tests/unit/<module>.spec.ts`, `tests/integration/<flow>.spec.ts`) and document it so contributors know where to place new specs.
- **FR-005**: Provide npm scripts `test`, `test:watch`, and `test:coverage` that wrap the runner with consistent reporter output and CI-friendly exit codes.
- **FR-006**: Enforce coverage thresholds (lines, branches, statements) that guarantee every exported function stays above the agreed minimum, and fail CI when violated.
- **FR-007**: Document local vs. CI execution instructions (prereqs, commands, expected output) in the README or `/docs/testing.md`, including how to run only unit or only integration suites.
- **FR-008**: Bake in safeguards so tests double-check rate-limiting defaults, opt-in flags, and compliance disclaimers—no fixture may override these protections without an explicit assertion—and add explicit unit/integration specs that fail if opt-in defaults or disclaimer surfacing are tampered with.
- **FR-009**: Update contributor guidance (changelog or CONTRIBUTING) describing how new public APIs must include accompanying unit + fixture tests and TSDoc usage examples referencing the suite.

### Key Entities *(include if feature involves data)*

- **Test Runner Configuration**: Describes the chosen runner, reporters, watch settings, coverage options, and environment variables required for local vs. CI execution.
- **Local Fixture Library**: Mocked Puppeteer browsers/pages, rate-limit metadata, and plugin manifests used to simulate module wiring without touching the network.
- **Coverage Artifact**: Generated summary (LCOV/HTML) published locally and in CI so reviewers can audit gaps before merges.

## Assumptions

- Contributors run Node.js Active LTS and can install optional system dependencies (Chromium download) if they opt into integration tests, but default fixtures avoid live downloads.
- Existing scripts in `package.json` can be replaced if needed, provided the new runner meets performance and compliance goals.
- CI has at least 2 vCPUs and 4 GB RAM, sufficient for headless test execution.

## Compliance & Safeguards *(mandatory)*

- Testing docs must restate the Responsible Automation section (rate limits, robots.txt, opt-in behavior) and link back to the README disclaimer. 
- Default runner config must stub all outbound network calls; any attempt to reach the internet should fail tests with messaging about policy violations.
- Provide guidance on auditing which evasions/modules a test touched, ensuring opt-in behavior remains transparent and logged.
- Include a TODO checklist for regions requiring additional privacy review if fixtures ever include synthetic personal data, even though current scope uses generated values only.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `npm test` completes in under 90 seconds on a typical laptop (Apple M1/16 GB or similar Linux dev box) when the cache is warm, and CI publishes the recorded duration, failing the job when the threshold is exceeded.
- **SC-002**: 100% of exported functions and 90% of branches/statements across `src/` have unit or integration coverage, enforced via coverage thresholds.
- **SC-003**: At least two integration scenarios run exclusively on local fixtures and fail—via a dedicated negative test—if any code attempts a live network call, ensuring the compliance messaging and guardrail are verified.
- **SC-004**: Documentation updates reduce onboarding questions about testing (as measured by zero new "how do I run tests" issues within one release cycle) and include explicit CI steps for watch/coverage usage.
