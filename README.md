# Puppeteer Stealth

Modular, opt-in Puppeteer hardening utilities for teams that need reliable stealth features without crossing ethical boundaries.

## Why This Project Exists

- **Benign automation only**: Demonstrate techniques that improve reliability for testing, monitoring, and research without bypassing access controls.
- **Composable evasions**: Ship each hardening tactic as a self-contained plugin so you can enable only what you need.
- **Safe defaults**: Every module starts in conservative mode—explicit opt-in is required for riskier behavior.
- **Maintainable APIs**: TypeScript + Yarn toolchain, strict typings, and TSDoc-covered entry points keep the public surface approachable.

## Responsible Automation (Read First)

Using this library does **not** grant permission to violate website terms, regional laws, or platform policies. By installing or running `puppeteer-stealth` you agree to:

1. Respect rate limits, robots.txt, and any published automation guidance from the sites you touch.
2. Avoid using this project for credential stuffing, account takeover, paywall evasion, or other abusive actions.
3. Clearly disclose automated traffic when feasible and never misrepresent an automated session as a human.
4. Remain solely responsible for complying with local laws, contracts, and acceptable-use policies.

Pull requests or issues that attempt to bypass security controls will be closed immediately.

## Prerequisites

- **Node.js 20.x (Active LTS)** – enforced via `package.json` engines and the project `.nvmrc`.
- **Yarn 1.22+** – required for the scripts defined in this repository and mirrored in CI.

## Getting Started

```bash
yarn install
yarn add puppeteer-stealth
```

```ts
import puppeteer from "puppeteer";
import { createStealth } from "puppeteer-stealth";

const browser = await puppeteer.launch({ headless: "new" });
const stealth = createStealth({
	modules: ["fingerprintProtection", "navigatorGuards"],
	rateLimitPerMinute: 60, // adjust to match the site’s published limits
});

await stealth.harden(browser);
```

- Target Node.js: latest Active LTS.
- Types: first-class TypeScript definitions and strict `tsconfig` recommended.
- Configuration: modules are opt-in; unsafe combinations are blocked unless you explicitly override safeguards.

## Testing

- Run the full suite with `yarn test`; use `yarn test:watch` for hot reloading and `yarn test:coverage` to enforce the 90% global thresholds.
- The fail-fast network guard (see `tests/setup/network-guard.ts`) aborts any attempt to access real `http/https` endpoints so contributors cannot accidentally probe live sites.
- Read `docs/testing.md` for the full folder layout, responsible-automation safeguards, and CI expectations before adding or modifying specs.

## Contributing

1. Open an issue describing the benign automation goal you are solving.
2. Provide a spec/plan via `/speckit` commands and confirm it satisfies every constitutional principle.
3. Include unit + fixture integration tests (`yarn test` must stay ≤ 90s), keep coverage thresholds green via `yarn test:coverage`, and ensure the network guard remains satisfied (no live `http/https` calls).

We welcome improvements that enhance transparency, safety, and maintainability.
