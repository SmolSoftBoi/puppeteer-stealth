# Research Notes – Modern Test Suite for Puppeteer Stealth

## Decision 1: Vitest runner configuration
- **Decision**: Use Vitest with the Node environment by default, enabling the jsdom environment only for tests that explicitly require DOM-like globals; enable TypeScript transpilation via `tsconfig.json` and source maps, and run test files straight from `tests/**/*.spec.ts` without prior build steps.
- **Rationale**: Vitest offers the fastest feedback loop for TypeScript libraries thanks to ESBuild-powered transforms and built-in watch/coverage support. Constraining the default environment to `node` keeps tests closer to runtime behavior while still allowing per-file overrides. Running TS directly enforces that contributors keep source compliant with the compiler configuration in one place.
- **Alternatives considered**: Staying on Jest + ts-jest (too slow, redundant tooling); Bun test runner (fast but immature coverage reporters and Linux container availability); uvu/ava (lightweight but lack integrated watch+coverage features and would require manual setup for mocking modules).

## Decision 2: Coverage tooling + thresholds
- **Decision**: Use `@vitest/coverage-c8` to emit LCOV + text summaries with enforced thresholds of 100% for functions touching exported APIs and 90% across statements/branches globally.
- **Rationale**: c8 leverages V8 coverage which aligns with Node 20 and keeps instrumentation accurate even for ESM modules. Setting hard thresholds that match success criteria ensures CI fails before regressions ship; exporting LCOV allows GitHub Actions to publish artifacts or integrate with Codecov later.
- **Alternatives considered**: NYC/Istanbul (heavier instrumentation, slower cold starts); `vitest --coverage.provider=v8` without LCOV (simpler but loses artifact compatibility); lowering thresholds (would not satisfy SC-002).

## Decision 3: Mocking + fixtures strategy
- **Decision**: Build reusable factories under `tests/fixtures/` that return mocked Puppeteer `Page`, `Browser`, and `LaunchOptions` objects using `vi.fn()` plus TypeScript interfaces; integration tests will import the real `puppeteer-extra-plugin-stealth` modules to verify hook wiring while the page/browser objects stay mocked and never trigger Chromium downloads.
- **Rationale**: This approach proves that our code calls each plugin’s lifecycle method without performing real I/O, satisfying the compliance constraint and keeping integration tests fast. Centralized fixtures prevent duplication and allow us to inject rate-limit metadata or logging spies consistently.
- **Alternatives considered**: Pure TypeScript stubs for both Puppeteer and stealth plugins (cheaper but wouldn’t validate real plugin APIs); launching headless Chromium in CI (violates “no outbound network” default and increases flakiness); sinon.js mocks (Vitest’s vi spies provide the same capabilities without extra deps).

## Decision 4: CI workflow ordering
- **Decision**: Update `.github/workflows/ci.yml` to run in this order: `yarn install --frozen-lockfile`, `yarn lint`, `yarn build`, `yarn test --runInBand=false`, and finally `yarn test:coverage` (which will reuse Vitest’s cache but emit coverage). Cache `~/.cache/vitest` and `node_modules` between runs and pin Node 20.x.
- **Rationale**: Running lint before tests catches inexpensive issues early; building before running tests ensures TypeScript types stay healthy for downstream consumers. Separating the coverage run keeps reporting deterministic; caching shortens wall time and stays within the <90s goal on warmed runners.
- **Alternatives considered**: Single job that runs lint+test+coverage in one command (simpler but slower failure feedback); skipping the build step (risks shipping type regressions undetected); using matrix Node versions (valuable later but unnecessary for first iteration given focus on a single LTS line).
