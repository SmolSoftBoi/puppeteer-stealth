# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Vitest test suite (unit + fixture-driven integration) with a fail-fast offline network guard.
- Coverage enforcement via the Vitest v8 coverage provider (90% statements/branches/lines, 100% functions).
- GitHub Actions CI workflow (`.github/workflows/ci.yml`) that pins Node 20, enforces a ≤90s `yarn test` budget, and uploads coverage artifacts.

### Changed
- Migrated from Jest/ts-jest to Vitest.
- Enforced Node.js `>=20` via `package.json` engines and `.nvmrc`.
