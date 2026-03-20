---
name: playwright-targeted-e2e
description: Add or update Playwright E2E tests and provide single-test run commands for fast verification.
---

## Purpose

Use this skill whenever behavior changes that require end-to-end coverage.

## Required repo rules

- E2E-first strategy with Playwright (`e2e/`, `playwright.config.ts`).
- Prefer targeted single-test execution during development.

## Workflow

1. Identify impacted user flow and corresponding `e2e/*.spec.ts` file.
2. Add or adjust one focused test with stable selectors.
3. Run at least one targeted command:
   - `npx playwright test e2e/<file>.spec.ts`
   - `npx playwright test -g "<test name>"`
   - `npx playwright test e2e/<file>.spec.ts:<line>`
4. Report command used and result.

## Done checklist

- Test is deterministic and flow-focused.
- Single-test run command is documented.
- Validation report is included.
