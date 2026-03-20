---
description: Review current changes and run validation gate commands.
agent: build
---

Follow `AGENTS.md`.

Analyze current workspace changes and perform verification:

1. Summarize changed files and risk areas.
2. Run `npm run lint`.
3. Run targeted Playwright command(s) based on changed behavior.
4. Run `npm run build` when integration-sensitive.

Return concise PASS/FAIL report with actionable next fixes.
