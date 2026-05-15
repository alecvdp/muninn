# Dev Agent Handoff — Muninn Pivot

You are working in `~/git/muninn`.

## Goal

Pivot Muninn from a Vibe Kanban/app tracker into the visual frontend for Alec's Firmament memory system.

Firmament is a Supabase-backed personal memory database used by agents through `personal-mcp`. It stores profile context, projects, preferences, agent sessions, memories, and derived insights. The key product question Muninn should answer is:

> What do agents know about Alec, and is that memory layer healthy, accurate, and useful?

Read `SPEC.md` first. Treat it as the source of truth for the new product direction.

## Current Situation

Muninn already exists as a React/Vite/Tailwind/Supabase app. It was originally scoped as:

- Vibe Kanban-inspired project board
- AI tool/subscription tracker
- agent session history

But the center of gravity has changed. The board and tools are now secondary. The primary product is an **agent memory observability and curation console**.

Do not start from scratch unless absolutely necessary. Reuse shell/layout/components/data access where practical, but be willing to simplify or delete old assumptions.

## Desired Navigation

Top-level sections should become:

1. Overview
2. Memories
3. Sessions
4. Projects
5. Insights
6. Tools
7. Settings

The default view should be Overview, not Kanban.

## MVP Implementation Target

Prioritize read-only visibility before editing.

Build enough that Alec can open the app and answer:

- What profile/context do agents see?
- What projects are marked active?
- What memories were recently created?
- What sessions happened recently?
- What derived insights exist?
- What looks stale, wrong, duplicated, or unactioned?

## Data Sources

Use the existing Supabase/Firmament tables if present:

- `profile`
- `projects`
- `preferences`
- `agent_sessions`
- `memories`
- `derived_insights`
- `tools`

Avoid unnecessary migrations. If a field/table is missing, degrade gracefully with clear empty/error states.

## Implementation Order

1. Inspect current app structure, routes, Supabase client, and types.
2. Update navigation and route names around the new IA.
3. Implement Overview page approximating the output of `personal_get_context`:
   - profile
   - active projects
   - recent sessions
   - recent memories
   - derived insights
   - lightweight data health indicators
4. Implement Memories list/detail:
   - search/filter basics
   - tags/category/confidence/project/date metadata
5. Implement Sessions list/detail:
   - filters by interface/machine/project/date if straightforward
6. Implement Projects list/detail:
   - preserve board if cheap, but list/detail is fine for MVP
   - surface stale/superseded projects
7. Implement Insights list/detail.
8. Leave Tools as existing or stubbed unless it blocks build.
9. Run lint/build/tests and fix issues.

## UX Direction

Keep it dark, dense, calm, and inspectable. This is not Trello. It is closer to an aircraft panel for agent memory.

Good labels:

- “What agents know”
- “Recent memories”
- “Agent sessions”
- “Derived insights”
- “Needs review”
- “Stale context”

Prefer tables/lists/detail panels over flashy dashboards.

## Constraints

- Be careful with write operations. Read-only MVP is acceptable.
- Do not expose secrets from `.env`.
- Do not assume every table has every column; inspect actual types/schema/code.
- Keep build green.
- Update README if the app behavior/navigation meaningfully changes.

## Definition of Done

A successful first pass makes Muninn feel like the frontend for Firmament rather than a neglected kanban clone. Alec should be able to visually inspect the memory layer that agents are already using through `personal-mcp`.
