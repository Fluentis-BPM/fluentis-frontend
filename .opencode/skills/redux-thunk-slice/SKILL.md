---
name: redux-thunk-slice
description: Create or update Redux Toolkit slices and async thunks with strict typing and normalized state.
---

## Purpose

Use this skill for shared domain state updates under `src/store`.

## Required repo rules

- Use Redux Toolkit patterns (`createSlice`, `createAsyncThunk`).
- Keep payloads and selectors explicitly typed.
- Avoid `any`; prefer `unknown` with narrowing.
- Preserve serializable and normalized store shape.

## Workflow

1. Locate target domain slice under `src/store/<domain>`.
2. Define request/response and thunk payload types.
3. Implement or update thunk with `try/catch` and actionable error state.
4. Add or update selectors and ensure `src/store/index.ts` registration when needed.
5. Run lint and targeted E2E for affected behavior.

## Done checklist

- Slice state and actions are typed.
- Async error paths are handled.
- Store wiring is complete.
- Validation report is included.
