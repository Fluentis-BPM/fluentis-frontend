---
name: validation-gate
description: Run the repository validation gate for lint, targeted E2E, and build checks before finalizing work.
---

## Purpose

Use this skill at the end of implementation work.

## Required repo rules

- Always run `npm run lint` after edits.
- Run targeted Playwright tests for behavior changes.
- Run `npm run build` for integration-sensitive/release-facing updates.

## Workflow

1. Run `npm run lint`.
2. Run targeted Playwright command(s) matching changed behavior.
3. Run `npm run build` when change touches integration-critical areas.
4. Return concise pass/fail report with failing command output summary.

## Validation report template

- Lint: PASS/FAIL
- E2E targeted: PASS/FAIL (command)
- Build: PASS/FAIL (or N/A + reason)

## Done checklist

- Commands were executed in required order.
- Results are clearly reported.
- Any remaining risk is explicitly listed.
