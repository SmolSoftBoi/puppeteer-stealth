<!--
Sync Impact Report
Version change: N/A → 1.0.0
Modified principles:
- N/A → Ethical Automation & Transparency
- N/A → Modular Stealth Surface
- N/A → Safe & Documented Public APIs
- N/A → Tests Gate Every Module
- N/A → Release Discipline & Observability
Added sections:
- Automation Safeguards & Compliance
- Delivery Workflow & Quality Gates
Removed sections:
- None
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
- ✅ .specify/templates/checklist-template.md
- ✅ README.md
Follow-up TODOs:
- None
-->

# puppeteer-stealth Constitution

## Core Principles

### Ethical Automation & Transparency
- The library MUST only demonstrate benign automation techniques; we never document or ship features that bypass access controls, violate terms of service, or conceal abusive traffic.
- Every entry point (README, API docs, examples) MUST include the compliance disclaimer: users are solely responsible for following applicable laws, site policies, and rate limits.
- Default configurations MUST enforce conservative request pacing, identifiable user agents, and opt-in activation for risky modules.
*Rationale: Sustaining trust in automation tools requires proactive respect for platform rules and clear user accountability.*

### Modular Stealth Surface
- Hardening behavior ships as discrete TypeScript modules that implement the shared plugin/evasion interface and avoid hidden global state.
- Modules MUST declare dependencies, support the current Node.js LTS line, and compile with strict TypeScript settings via Yarn.
- Architectural diagrams and code comments MUST explain how modules compose so contributors can safely extend the system.
*Rationale: A composable architecture keeps the project maintainable and enables controlled evolution of stealth techniques.*

### Safe & Documented Public APIs
- Every exported symbol requires complete TSDoc plus at least one runnable example covering safe defaults and ethical guidance.
- Options default to the safest behavior the library can provide; disabling safeguards must require explicit opt-in flags.
- Breaking changes trigger deprecation notices, semver MAJOR releases, and changelog entries outlining migration steps.
*Rationale: Clear contracts and safe defaults prevent accidental misuse and reduce maintenance cost.*

### Tests Gate Every Module
- New functionality MUST include unit tests that cover edge cases plus a minimal integration test using local Puppeteer fixtures.
- Tests run in CI without contacting third-party sites; fixtures emulate targets to prove efficacy safely.
- Pull requests lacking the required tests cannot merge, and test failures block releases until resolved.
*Rationale: Verification is the only way to keep stealth modules reliable while avoiding harmful live traffic.*

### Release Discipline & Observability
- Each release increments semantic version numbers, updates the changelog, and records bundle-size deltas for any new module.
- Modules MUST expose structured debug hooks so integrators can audit what evasions are active in production.
- Security or compliance regressions trigger immediate patch releases and retroactive documentation updates.
*Rationale: Predictable releases and introspection keep consumers confident in adopting the toolkit.*

## Automation Safeguards & Compliance

- Maintain a prominent "Responsible Automation" section in `README.md`, mirroring the disclaimer text referenced by Principle 1.
- Publish guidance for respectful automation: rate limiting recommendations, honoring robots.txt, and transparent identification of automated traffic when feasible.
- Keep a curated list of non-allowable contributions (e.g., credential stuffing, account takeover helpers) and reject pull requests that violate it.
- Provide configuration switches for region-specific compliance needs and document the legal responsibility of downstream users.

## Delivery Workflow & Quality Gates

- Every feature follows the `/speckit` flow: spec → plan → tasks → checklist. Each artifact MUST document how it satisfies all five principles under the "Constitution Check" gate.
- Code reviews MUST verify: (a) plugin modularity, (b) TSDoc + example coverage, (c) unit + integration tests, (d) changelog and bundle measurements, (e) README compliance reminders when user-visible behavior changes.
- CI enforces linting, type-checking, formatting, and the Puppeteer fixture test suite under the latest Node.js LTS runtime.
- Releases require a signed tag describing enabled evasions and any new safeguards so adopters can audit upgrades quickly.

## Governance

- This constitution supersedes conflicting guidance. Exceptions require a written RFC, risk assessment, and approval from the maintainers before implementation begins.
- Amendments occur via pull request referencing the impacted principles, the justification for the version bump, and updates to dependent templates/docs listed in the Sync Impact Report.
- Compliance audits happen at least once per release cycle; unresolved violations block publishing until mitigations are documented and merged.
- Versioning follows semantic rules: MAJOR for breaking governance changes, MINOR for new principles or expanded mandates, PATCH for clarifications. Record ratification and amendment dates in ISO format.

**Version**: 1.0.0 | **Ratified**: 2025-12-10 | **Last Amended**: 2025-12-10
