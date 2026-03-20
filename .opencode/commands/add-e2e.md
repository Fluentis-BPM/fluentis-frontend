---
description: Add or update a targeted Playwright E2E test for a flow.
agent: build
---

Follow `AGENTS.md`.

Add or update E2E coverage for: "$ARGUMENTS".

Requirements:

- Prefer editing an existing `e2e/*.spec.ts` when appropriate.
- Keep selectors stable and assertions focused.
- Run one targeted command and report output summary:
  - `npx playwright test e2e/<file>.spec.ts`
  - or `npx playwright test -g "<test name>"`
  - or `npx playwright test e2e/<file>.spec.ts:<line>`

Return changed files and the exact command used.
