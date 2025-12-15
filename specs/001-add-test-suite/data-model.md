# Data Model – Testing Suite Enablement

## Entity: TestRunnerConfig
- **Purpose**: Captures inputs required to initialize Vitest consistently across local and CI environments.
- **Fields**:
  - `environment` (enum: `node`, `jsdom`) – default `node`; integration tests may override per-file via annotations.
  - `includeGlobs` (string[]) – defaults to [`tests/**/*.spec.ts`]; ensures unit + integration locations are auto-discovered.
  - `excludeGlobs` (string[]) – includes `dist/**`, `examples/**`, `node_modules/**` to keep bundle artifacts out of the suite.
  - `coverageThresholds` (object) – `statements: 0.9`, `branches: 0.9`, `functions: 1.0`, `lines: 0.9` enforcing SC-002.
  - `reporters` (string[]) – `['default', 'junit']` optional for CI artifact generation.
  - `watchMode` (boolean) – toggled by `test:watch` script; ensures fast HMR loop locally.
  - `failOnOutboundNetwork` (boolean) – injected via custom environment setup to mock `net`/`http` modules and throw if called.

## Entity: FixtureLibrary
- **Purpose**: Provides deterministic stand-ins for Puppeteer components and rate-limiting metadata so integration tests never require Chromium downloads.
- **Fields**:
  - `mockPage` (factory) – returns object implementing subset of `Page` with spies for `evaluate`, `setUserAgent`, etc.
  - `mockBrowserOptions` (factory) – yields `LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions` with safe defaults.
  - `pluginManifest` (array) – lists actual `puppeteer-extra-plugin-stealth` modules under test to assert hook invocation order.
  - `rateLimitProfile` (object) – carries site policy metadata, ensures tests assert against published caps.
  - `telemetrySink` (spy) – collects logs/events so tests can verify transparency outputs.

## Entity: CoverageArtifacts
- **Purpose**: Tracks generated reports for local development and CI gating.
- **Fields**:
  - `textSummary` – stored in console output for quick validation.
  - `lcovFile` – persisted under `coverage/lcov.info` for upload or IDE visualization.
  - `htmlReport` – optional static assets under `coverage/html` for manual review.
  - `badgeData` – JSON snippet enabling README badge updates (future-proofing).
  - `thresholdStatus` – boolean flag (pass/fail) consumed by CI to determine job result.

## Relationships
- `TestRunnerConfig.coverageThresholds` governs the acceptance criteria for `CoverageArtifacts.thresholdStatus`.
- `FixtureLibrary.pluginManifest` references the same modules imported by runtime `src/index.ts`, ensuring integration parity.
- `FixtureLibrary.telemetrySink` feeds data into logs referenced by the Responsible Automation documentation, aligning with the constitution’s observability mandate.
