---
name: api-service-contract
description: Add or update typed API helpers using the shared axios instance in src/services/api.ts.
---

## Purpose

Use this skill for network/API work in `src/services/*`.

## Required repo rules

- Use shared axios from `src/services/api.ts` only.
- Keep endpoint types near helpers when practical.
- Preserve existing backend fallback route conventions when already used.
- Do not create ad-hoc axios instances.

## Workflow

1. Inspect existing service file patterns in `src/services`.
2. Define request/response types for the target endpoint.
3. Implement helper with explicit return type and robust error handling.
4. Reuse auth/interceptor behavior from shared api client.
5. Validate with lint and relevant E2E path.

## Done checklist

- Shared axios instance is used.
- Types are explicit and stable.
- Error handling is actionable.
- Validation report is included.
