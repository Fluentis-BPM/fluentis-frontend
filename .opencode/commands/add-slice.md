---
description: Add/update Redux Toolkit slice and thunk with strict typing.
agent: build
---

Follow `AGENTS.md`.

Implement Redux slice/thunk for: "$ARGUMENTS".

Requirements:

- Use `createSlice` and `createAsyncThunk`.
- Avoid `any`; use typed payloads/selectors.
- Register reducer in `src/store/index.ts` when needed.
- Keep state serializable and normalized.

Run `npm run lint` and report updated selectors/actions.
