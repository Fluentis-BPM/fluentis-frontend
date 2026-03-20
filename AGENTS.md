# AGENTS.md

Operational guide for agentic coding assistants working in this repository.

## Project Snapshot

- Stack: React 18 + TypeScript + Vite.
- State management: Redux Toolkit slices in `src/store`.
- Styling: Tailwind CSS v4 + reusable UI components under `src/components/ui`.
- HTTP client: shared Axios instance in `src/services/api.ts`.
- Routing: React Router (public/private route split in `src/routes`).
- Package manager: `npm` (`package-lock.json` is present).

## Install And Run

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Start Vite in production mode: `npm run prod`
- Build app (TypeScript build + Vite production build): `npm run build`
- Build in development mode: `npm run build:dev`
- Docker-oriented build: `npm run build:docker`
- Preview build: `npm run preview`
- Preview production mode: `npm run preview:prod`

## Lint And Format

- Run lint (with autofix): `npm run lint`
- Run formatter: `npm run format`

Important details:

- `npm run lint` executes `eslint . --ext .ts,.tsx --fix`.
- Pre-commit hook (`.husky/pre-commit`) runs `npx lint-staged`.
- `lint-staged` config (`.lintstagedrc`) applies `eslint --fix` to staged `*.js,*.jsx,*.ts,*.tsx`.

## Test Commands (Including Single Test)

There is no `npm test` script currently.
Current tests in repo are Playwright E2E specs in `e2e/`.

- Run all E2E tests: `npx playwright test`
- Run one file: `npx playwright test e2e/landing.spec.ts`
- Run one test by name: `npx playwright test -g "landing page shows hero title and CTA"`
- Run one test in one file: `npx playwright test e2e/navigation.spec.ts -g "navigates to login"`
- Run test by file line: `npx playwright test e2e/faq.spec.ts:4`
- Run headed mode: `npx playwright test --headed`
- Run Chromium project only: `npx playwright test --project=chromium`
- Open HTML report: `npx playwright show-report`

If Playwright is not yet installed in dependencies, use `npx playwright test` (it can bootstrap via npx) and add proper scripts/dependency in a follow-up cleanup change.

## Expected Validation Before Finishing A Task

- Always run `npm run lint` after edits.
- Run targeted E2E tests when behavior changes.
- Run `npm run build` for integration-sensitive or release-facing updates.

## Cursor/Copilot Rule Files Status

Searched locations requested by user:

- `.cursorrules`: not found
- `.cursor/rules/`: not found
- `.github/copilot-instructions.md`: not found

No repository-level Cursor or Copilot rule file is currently present.

## Formatting Rules

Follow `.prettierrc`:

- Semicolons required.
- `tabWidth: 2`.
- `printWidth: 100`.
- Single quotes in JS/TS and JSX.
- `trailingComma: es5`.
- `bracketSpacing: true`.

Do not hand-format against Prettier; prefer running formatter/lint fix.

## ESLint And Compiler Constraints

- ESLint config lives in `eslint.config.js` (flat config).
- Base rule sets: `@eslint/js`, `typescript-eslint` recommended, `react` recommended.
- `react/react-in-jsx-scope` is disabled.
- `@typescript-eslint/no-unused-vars` is disabled in ESLint.

TypeScript still enforces unused checks via `tsconfig.app.json`:

- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

Treat TS compiler as the final authority when lint and TS disagree.

## Import Conventions

- Prefer path alias `@/*` for `src/*` imports.
- Keep imports grouped and readable:
  - third-party packages
  - alias imports (`@/...`)
  - relative imports
- Separate groups with one blank line.
- Use `import type` for type-only imports.

## Type And API Design Guidelines

- Prefer explicit interfaces/types for exported APIs and thunk payloads.
- Avoid `any`; use `unknown` and narrow.
- Keep slice state normalized and serializable.
- Keep endpoint request/response types near API helpers when practical.
- Reuse shared API instance; do not create new ad-hoc axios instances.

## Naming Conventions

- Components/pages: `PascalCase` (`LoginPage.tsx`, `UserProfile.tsx`).
- Hooks: `useXxx` in camelCase (`useAuth.ts`).
- Redux slices: `<domain>Slice.ts`.
- Utility modules: concise lowercase names (`auth.ts`, `utils.ts`).
- Preserve existing bilingual domain naming (Spanish + English) instead of forced renames.

## React And State Patterns

- Use function components and hooks.
- Keep side effects in `useEffect`; wrap async flows in internal async functions.
- Keep route composition in `src/routes` and provider wiring in `src/App.tsx`.
- Reuse UI primitives from `src/components/ui` before creating new base components.
- Prefer Redux Toolkit async thunks for shared async workflows.

## Error Handling Guidelines

- Wrap network and async actions in `try/catch`.
- Use actionable user-facing messages in UI state.
- Use console diagnostics sparingly and purposefully.
- Do not silently swallow critical failures unless explicitly intended.
- Preserve fallback patterns already used for backend route variations.

## Auth And Storage Consistency

- Keep token handling aligned with current app behavior.
- Before changing storage keys (`accessToken`, `token`, etc.), check full usage paths.
- Keep interceptor behavior in `src/services/api.ts` consistent with auth flow.

## Agent Behavior Expectations

- Make minimal, focused edits.
- Do not refactor unrelated files opportunistically.
- Do not revert user-authored changes outside your task.
- Update docs/scripts together when introducing new commands.
- If test infrastructure changes, add explicit single-test command examples here.

## Quick Task Checklist

- Install: `npm install`
- Implement scoped change
- Validate: `npm run lint`
- Validate behavior: targeted `npx playwright test ...`
- Validate build when needed: `npm run build`
