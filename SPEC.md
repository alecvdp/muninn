# Muninn — Product Spec

> **Muninn is the visual control room for Alec's agent memory system.**
>
> It is not primarily a Vibe Kanban clone anymore. It is the frontend for Firmament: the Supabase-backed personal memory layer that agents actually use through `personal-mcp`.

**Repo:** `~/git/muninn`  
**Backend:** Firmament / Supabase  
**Primary user:** Alec, plus the agents helping Alec  
**Product stance:** local-first-feeling, personal, sharp, fast, inspectable

---

## 1. Why Muninn Exists

Alec has multiple memory-ish systems: Obsidian/Octarine, Recall, Supermemory, Firmament, MCP tools, agent session logs, project records, and derived insights. The most useful layer for agents right now is Firmament via `personal-mcp`, but it is mostly invisible unless queried by an agent.

Muninn exists to answer:

- **What do agents know about me right now?**
- **What memory/context is being injected into agent sessions?**
- **What did agents do recently?**
- **Which memories are useful, stale, duplicated, sensitive, or wrong?**
- **Which projects are actually active vs lingering as stale metadata?**
- **Is my memory system quietly working, or silently rotting?**

Muninn should make the agent memory substrate visible, editable, and trustworthy.

---

## 2. Product Reframe

### Old framing

A personal project workbench / Vibe Kanban-inspired board with tools and agent history.

### New framing

**An agent memory observability and curation console.**

Kanban/project tracking still matters, but it is now one lens over Firmament, not the center of the app. Tools/subscriptions are useful, but secondary.

The primary object is not a task. The primary object is **context**.

---

## 3. Core Principles

1. **Show what agents see**  
   Muninn should preview the context an agent would receive from Firmament: profile, active projects, preferences, recent sessions, recent memories, and derived insights.

2. **Make memory inspectable**  
   Every memory should have visible metadata: source, tags, category, project linkage, confidence, created date, and embedding/index status where available.

3. **Curation beats capture**  
   The system already captures plenty. Muninn should help Alec review, edit, merge, promote, archive, or delete memory.

4. **Staleness is a first-class signal**  
   Projects, preferences, insights, and recommendations should surface when they are old, contradicted, or repeatedly ignored.

5. **Agent-native, not note-app-native**  
   This is not Obsidian. It should focus on operational context agents use, not freeform knowledge management.

6. **Readable over elaborate**  
   The UI should feel like a cockpit: dense enough to be useful, calm enough to trust.

---

## 4. Primary Views

### 4.1 Overview — “What agents know”

Default route: `/` or `/overview`.

Purpose: give Alec a one-screen answer to “what context does my agent memory layer currently provide?”

Sections:

- **Profile card**
  - name
  - timezone/location
  - pronouns
  - communication style
  - key personal context fields if present

- **Active projects**
  - project name
  - status / board status
  - local path
  - last updated
  - warning if stale or likely superseded

- **Recent sessions**
  - last 5–10 agent sessions
  - interface, machine, summary, started/ended

- **Recent memories**
  - last 5–10 memories
  - tags/category/confidence

- **Derived insights**
  - recent high-confidence insights
  - predictions/recommendations requiring action

- **System health**
  - last memory timestamp
  - last session timestamp
  - projects with no recent activity
  - embedding/indexing gaps if detectable
  - MCP/service status if available later

Key feature: **Agent Context Preview** — a panel that approximates what `personal_get_context` returns to agents.

---

### 4.2 Memories

Route: `/memories`.

Purpose: browse, search, and curate discrete memories stored in Firmament.

Features:

- full-text search initially; semantic search later if exposed safely
- filters by tag, category, confidence, project, date range
- table/list toggle
- memory detail panel
- edit content/tags/category/confidence/project linkage
- archive/delete where supported
- mark as stale / needs review
- show related sessions and projects
- identify likely duplicates or contradictions later

Important interactions:

- **Promote** memory to a higher-level insight or project context
- **Demote/archive** noisy memories
- **Correct** inaccurate memories without needing SQL

---

### 4.3 Sessions

Route: `/sessions`.

Purpose: inspect what agents have been doing across interfaces and machines.

Features:

- chronological feed grouped by day/week
- filters: interface, machine, project, date range
- detail panel with summary, timestamps, duration, memories created
- link to related project and memories
- flag stub/low-quality summaries
- identify sessions without project linkage

Useful analytics:

- sessions per week
- interface mix: pi, claude-code, api-direct, etc.
- machines used
- percentage of sessions with meaningful summaries
- unlinked sessions count

---

### 4.4 Projects

Route: `/projects`.

Purpose: maintain the project records agents use to orient themselves.

This can retain the existing kanban board, but the view should be reinterpreted as **project context management**, not task management.

Features:

- board/list toggle
- active/paused/archived filters
- project detail panel
- edit name, description, local path, repo URL, status, board status, priority, context, tech stack
- show recent sessions and memories linked to project
- stale project warnings
- archive obvious dead projects

Key issue to surface: projects like “Agent Command Center” that remain active despite repeated insights saying they are superseded.

---

### 4.5 Insights

Route: `/insights`.

Purpose: review derived patterns, predictions, recommendations, and weekly syntheses.

Features:

- list by created date
- filter by type: pattern, trend, prediction, connection, recommendation
- confidence filter
- detail panel
- mark as accepted/rejected/resolved/stale if schema supports it later
- show related memories/sessions/projects if available

This view is where Muninn becomes more than CRUD: it helps Alec notice recurring meta-patterns the agents are detecting.

---

### 4.6 Tools

Route: `/tools`.

Purpose: keep the existing AI subscription/app tracker, but demote it to a supporting module.

Features remain roughly as originally planned:

- tool cards
- cost summaries
- renewal alerts
- category/platform/tag filters
- notes and URLs

This is useful, but not MVP-critical for the memory-console pivot.

---

### 4.7 Settings

Route: `/settings`.

Purpose: connection/configuration and lightweight diagnostics.

Features:

- Supabase connection status
- app version
- theme toggle
- visible table availability checks
- future: MCP status checks, embedding health, data export tools

---

## 5. Data Sources

Muninn should read directly from the existing Firmament Supabase database.

Known/expected tables include:

- `profile`
- `projects`
- `preferences`
- `agent_sessions`
- `memories`
- `derived_insights`
- `tools` if present

Avoid inventing new schema unless necessary. Prefer read-only MVP behavior where writes are unclear or risky.

---

## 6. MVP Scope

The MVP should prove that Muninn is useful as a memory observability console.

### MVP must have

1. Overview page that approximates `personal_get_context`
2. Memories list with search/filter and detail view
3. Sessions list with filters and detail view
4. Projects list/board with detail view
5. Insights list with detail view
6. Supabase connection handling
7. Clear empty/error/loading states

### MVP can defer

- drag-and-drop kanban polish
- semantic search
- memory deduplication
- contradiction detection
- MCP server status integrations
- write/edit flows for sensitive tables
- tool subscription tracker polish
- advanced charts

---

## 7. UX Direction

Visual feel:

- dark-first
- dense but calm
- IBM Plex Sans / Mono is still good
- left icon rail is still good
- resizable detail panel is still good
- avoid dashboard clutter; prioritize inspectable records

Information architecture:

```text
Overview
Memories
Sessions
Projects
Insights
Tools
Settings
```

The app should feel less like Jira/Trello and more like:

> “Here is the living memory graph your agents are using. Here is where it is strong. Here is where it is stale. Here is what needs your attention.”

---

## 8. Implementation Notes

Current stack is still appropriate:

- React + Vite
- TypeScript
- Tailwind
- Supabase JS
- Zustand if useful
- React Router
- resizable detail panels
- Phosphor icons

Recommended implementation order:

1. Audit existing components/routes/data access.
2. Keep useful shell/layout pieces.
3. Rename/reframe navigation around Overview, Memories, Sessions, Projects, Insights.
4. Implement read-only Overview from existing tables.
5. Implement Memories list/detail.
6. Implement Sessions list/detail.
7. Implement Projects list/detail.
8. Implement Insights list/detail.
9. Only then revisit writes/editing and Tools.

---

## 9. Success Criteria

Muninn is working if Alec can open it and quickly answer:

- What do agents currently know about me?
- What have agents done recently?
- What project context will agents rely on?
- What memories were added recently?
- What insights keep recurring?
- What should be corrected, archived, or promoted?
- Is Firmament healthy enough to keep relying on?

If the app makes Alec trust and improve the memory layer that agents already use, it succeeds.
