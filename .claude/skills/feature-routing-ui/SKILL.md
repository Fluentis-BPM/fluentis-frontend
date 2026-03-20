---
name: feature-routing-ui
description: Implement or update React pages and route wiring using existing UI patterns in src/routes and src/components/ui.
---

## Purpose

Use this skill when a task requires page-level UI work, route updates, or navigation flow changes.

## Required repo rules

- Follow `AGENTS.md` strictly.
- Reuse UI primitives from `src/components/ui`.
- Keep route composition in `src/routes`.
- Keep edits minimal and focused.

## Workflow

1. Identify affected route files in `src/routes` and page files in `src/pages`.
2. Reuse existing patterns from similar pages before introducing new structures.
3. Implement page and route updates with TypeScript-safe props and imports.
4. Verify responsive behavior (desktop and mobile layout sanity).
5. Run validation commands from `validation-gate` skill.

## Done checklist

- Route is wired and reachable.
- No duplicate base UI components introduced.
- Imports are grouped and readable.
- Validation report is included.
