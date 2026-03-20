---
description: Implement a feature with minimal edits and required validation.
agent: build
---

Follow `AGENTS.md` as strict policy.

Implement feature: "$ARGUMENTS".

Execution requirements:

- Reuse existing patterns and components.
- Use shared axios in `src/services/api.ts` for API work.
- Keep edits focused and avoid unrelated refactors.
- Run `npm run lint` after edits.
- Run targeted Playwright tests for changed behavior.
- Run `npm run build` if integration-sensitive.

Final output format:

- Changed files
- Commands executed
- Validation results
- Remaining risks
