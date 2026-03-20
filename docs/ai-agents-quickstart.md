# AI Agents Quickstart

This is the simple guide for how to use commands, skills, and subagents in this repository.

Use this when you want to get work done fast without learning all internal details.

## What Is What

- **Command**: The thing you type first (`/plan-feature ...`).
- **Skill**: The internal playbook the agent uses to do a task correctly.
- **Subagent**: A specialist worker (planner, UI, API/state, QA).

Think of it like this:

- You start with a **command**.
- The system applies the right **skills**.
- Work is delegated to the right **subagent**.

## Quick Start (Recommended Flow)

For most medium/large tasks, use this exact sequence:

1. `/plan-feature <feature-name>`
2. `/implement-feature <feature-name>`
3. `/add-e2e <flow-or-scenario>`
4. `/verify-change`

Example:

1. `/plan-feature add approval history timeline on solicitudes detail`
2. `/implement-feature add approval history timeline on solicitudes detail`
3. `/add-e2e approval timeline is visible for authenticated user`
4. `/verify-change`

## Commands: When To Use Each One

- `/plan-feature <name>`
  - Use first for non-trivial work.
  - Output: scope, impacted files, risks, test plan.

- `/implement-feature <name>`
  - Use after plan is good.
  - Output: code changes + validation summary.

- `/add-slice <domain>`
  - Use when adding/updating Redux Toolkit state logic.
  - Focus area: `src/store`.

- `/add-api <endpoint-or-feature>`
  - Use when adding/updating service/API calls.
  - Must use shared axios in `src/services/api.ts`.

- `/add-e2e <flow>`
  - Use when behavior changes need test coverage.
  - Focus area: `e2e/*.spec.ts`.

- `/verify-change`
  - Use before finalizing.
  - Runs quality gate and reports PASS/FAIL + risks.

## Skills: What They Enforce

Local project skills (OpenCode):

- `feature-routing-ui`
  - Correct route/page/UI workflow (`src/routes`, `src/pages`, `src/components/ui`).

- `redux-thunk-slice`
  - Typed slice/thunk patterns in `src/store`.

- `api-service-contract`
  - Typed service helpers using shared axios (`src/services/api.ts`).

- `playwright-targeted-e2e`
  - Focused E2E test updates and single-test execution.

- `validation-gate`
  - Final checks (`npm run lint`, targeted Playwright, optional build).

Installed shared skills:

- `vercel-composition-patterns`
- `web-design-guidelines`

## Subagents: Who Does What

- `repo-planner`
  - Read-only planning specialist.
  - Produces implementation steps and risk map.

- `ui-routing-agent`
  - UI + routing specialist.
  - Works in `src/pages`, `src/routes`, and reusable UI patterns.

- `state-api-agent`
  - Redux + API specialist.
  - Works in `src/store` and `src/services`.

- `qa-review-agent`
  - Validation and regression specialist.
  - Confirms lint, targeted E2E, and build when needed.

## How Work Is Orchestrated

Default orchestration for big tasks:

1. Planner defines scope and files.
2. UI and state/API work can run in parallel.
3. QA agent validates and reports risk.
4. Final response includes changed files, commands run, and remaining risks.

## Validation Expectations

From `AGENTS.md`, agents should do:

- `npm run lint` after edits.
- Targeted Playwright tests when behavior changes.
- `npm run build` for integration-sensitive/release-facing updates.

Single-test Playwright examples:

- `npx playwright test e2e/landing.spec.ts`
- `npx playwright test -g "landing page shows hero title and CTA"`
- `npx playwright test e2e/faq.spec.ts:4`

## Installing Extra Skills

Preferred flow (skills CLI):

```bash
npx skills --help
npx skills add <owner/repo>
```

Examples:

```bash
npx skills add vercel-labs/agent-skills --list
npx skills add vercel-labs/agent-skills --skill web-design-guidelines vercel-composition-patterns --agent opencode claude-code -y
```

If skills CLI is not available, create skills manually in:

- `.opencode/skills/<skill-name>/SKILL.md`

## Which One Should I Use?

- New feature or medium task -> use full sequence (plan -> implement -> e2e -> verify).
- Small one-file change -> `/implement-feature ...` then `/verify-change`.
- Only API work -> `/add-api ...` then `/verify-change`.
- Only Redux work -> `/add-slice ...` then `/verify-change`.
- Only test addition -> `/add-e2e ...` then `/verify-change`.

## Where Files Live

- Commands: `.opencode/commands/`
- Skills: `.opencode/skills/`
- Subagents: `.opencode/agents/`
- Claude commands: `.claude/commands/`
- Claude skills: `.claude/skills/`
- Claude subagents: `.claude/agents/`

## OpenCode And Claude Mirror

This repository mirrors the core setup for both tools:

- OpenCode and Claude have matching core skills.
- OpenCode and Claude have matching slash commands.
- OpenCode and Claude have matching subagents and responsibilities.

Use the same command names and workflow regardless of tool.
