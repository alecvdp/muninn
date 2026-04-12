# Muninn — Project Spec

> A personal project workbench for a solo vibe coder. Kanban board for projects, AI tool tracking, agent session history — all backed by Firmament (Supabase). Named for Odin's raven of memory.

**Repo:** `~/git/muninn`

---

## Core Idea

Vibe Kanban's mental model and visual design, stripped of everything a solo builder doesn't need. One place to see all projects, track AI subscriptions, and review what agents have been doing — across every machine.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React + Vite | No SSR needed — pure client app talking to Supabase |
| Styling | Tailwind CSS + CSS variables (HSL tokens) | Match VK's approach exactly |
| State | Zustand | Already familiar, lightweight |
| Backend | Supabase (Firmament) via `@supabase/supabase-js` | Already has projects, sessions, memories — add tools table |
| Drag & drop | `@hello-pangea/dnd` | What VK uses, maintained fork of react-beautiful-dnd |
| Resizable panels | `react-resizable-panels` | What VK uses for board + detail split |
| Icons | `@phosphor-icons/react` | What VK uses — clean, consistent weight system |
| Fonts | IBM Plex Sans + IBM Plex Mono | What VK uses — clean, readable |
| Router | `react-router` (v7) | Simpler than TanStack for 3-4 routes |
| Hosting | Static — `npm run dev` locally, or deploy to Cloudflare Pages / Vercel | Portable |

**Explicitly not using:** Next.js, Tauri, any server-side runtime.

---

## Layout

Matching Vibe Kanban's three-zone structure:

```
┌──────┬──────────────────────────────────────────────────┐
│      │  Navbar (top bar)                                │
│      │  view title | search (Cmd+K future)              │
│ App  ├────────────────────────────┬─────────────────────┤
│ Bar  │                            │                     │
│      │  Main Content              │  Detail Panel       │
│ 48px │  (kanban board, tool grid, │  (resizable,        │
│      │   session list)            │   slides in on      │
│      │                            │   card click)       │
│      │                            │                     │
└──────┴────────────────────────────┴─────────────────────┘
```

### AppBar (left icon rail)

Narrow vertical sidebar (~48px). Dark background (`bg-secondary`). Icons stacked vertically with tiny section labels.

| Icon | Label | Route |
|---|---|---|
| 📋 KanbanSquare | Board | `/` (default) |
| 🤖 Robot | Tools | `/tools` |
| ⚡ Lightning | Agents | `/agents` |
| ⚙️ Gear | Settings | `/settings` |

Bottom of AppBar: app name/version.

### Navbar (top bar)

Slim horizontal bar (`bg-secondary border-b`). Shows:
- Left: current view name
- Right: future Cmd+K search trigger, theme toggle

### Main Content

Full remaining space. Content depends on active route.

### Detail Panel

Right side, hidden by default. Slides in when a card is clicked. Resizable via `react-resizable-panels` (min 360px, max 600px, default 440px). `bg-secondary`. Dismiss with × or Escape.

---

## Views

### 1. Board (`/`) — The Kanban

The home view. Projects from Firmament's `projects` table displayed as cards in status columns.

**Columns** (mapped to `projects.board_status`):

| Column | `board_status` value | Color dot |
|---|---|---|
| Idea | `idea` | blue |
| Todo | `todo` | yellow |
| In Progress | `in-progress` | orange/brand |
| Paused | `paused` | gray |
| Done | `done` | green |

> The `board_status` column is the source of truth for kanban position. Dragging between columns updates `board_status` directly.

**Project Card** (in column):
- Project name (bold, `text-normal`)
- Description (1-2 lines, `text-low`, `line-clamp-2`)
- Tech stack tags (small badges)
- Priority indicator (dot or number)
- Last activity timestamp (from most recent `agent_sessions` row)

**Drag & drop:** Reorder within columns (priority) and across columns (status change). Writes back to Firmament on drop.

**Card click → Detail Panel** opens with:
- Project name (editable)
- Status selector
- Priority selector
- Description (editable, markdown)
- Tech stack tags (editable)
- Repo URL (clickable link)
- Local path (display only)
- Recent agent sessions (last 5, from `agent_sessions` where `project_id` matches)
- Recent memories (from `memories` where `project_id` matches)
- Created / updated timestamps

**Empty state:** "No projects yet" + button to create one.

**Create project:** + button in column header opens Detail Panel in create mode.

### 2. Tools (`/tools`) — AI Subscriptions

The ai-dashboard data, but backed by a Firmament table instead of markdown files.

**Layout:** Card grid (responsive, 1-3 columns). Optional filter bar at top (category, platform, cost range).

**Summary row** (top of view):
- Total monthly cost
- Total annual cost
- Active tool count
- Renewing within 30 days count

**Tool Card:**
- Tool name
- Category badge: "Using" (green) or "To Check Out" (muted)
- Cost + billing cycle (`$20/mo`, `$100/yr`)
- Platform icons (mac, linux, web, ios)
- Renewal date (+ "in Xd" if within 30 days, highlighted)
- Notes (1-2 lines, truncated)
- Tags

**Card click → Detail Panel** with full tool info, editable fields.

**Create tool:** + button top-right opens Detail Panel in create mode.

### 3. Agents (`/agents`) — Session History

A timeline/log view of agent activity pulled from `agent_sessions`.

**Layout:** Vertical feed, most recent first. Grouped by date.

**Session Card:**
- Interface badge (claude-code, pi, claude.ai, etc.)
- Machine badge (midgard, mini-ygg, etc.)
- Summary text
- Duration (started_at → ended_at)
- Project link (if `project_id` set, clickable → navigates to Board + opens that project's detail)
- Memories created count

**Filters:** Interface, machine, project, date range.

### 4. Settings (`/settings`)

Minimal for MVP:
- Supabase connection status (green/red indicator)
- Theme toggle (dark/light — dark default)
- Future: Herstel palette picker

---

## Data Model

### Existing Firmament Tables

- **`projects`** — already has: name, status, description, local_path, repo_url, tech_stack, priority, context, last_agent_context. **Migration needed:** add `board_status` column and `board_position` (integer for ordering within a column).
- **`agent_sessions`** — already has: interface, machine, summary, project_id, started_at, ended_at, memories_created
- **`memories`** — already has: content, category, tags, project_id, created_at

### New Table: `tools`

Migrations to add to `personal-mcp/migrations/`:

```sql
-- 005_add_board_status_to_projects.sql

alter table projects
  add column if not exists board_status text default 'idea',
  add column if not exists board_position integer default 0;

comment on column projects.board_status is 'Kanban column: idea, todo, in-progress, paused, done';
comment on column projects.board_position is 'Sort order within a kanban column (lower = higher)';

-- Backfill existing projects based on current status
update projects set board_status = status where board_status = 'idea';
```

```sql
-- 006_add_tools_table.sql

create table tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'to-check-out',  -- 'tools-using' | 'to-check-out'
  cost numeric(10,2) default 0,
  billing_cycle text,  -- 'monthly' | 'annual' | 'one-time' | null
  renewal_date date,
  platform text[] default '{}',  -- ['mac', 'linux', 'web', 'ios', 'android', 'windows']
  url text,
  tags text[] default '{}',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: allow anon read/write (single-user app)
alter table tools enable row level security;
create policy "Allow all access" on tools for all using (true) with check (true);

comment on table tools is 'AI tool subscriptions and tools to evaluate';
```

---

## Styling

### Color Tokens (CSS Variables)

Adapted from Vibe Kanban's system. Dark theme default:

```css
:root {
  /* Text hierarchy */
  --text-high:    0 0% 96%;      /* primary text, headings */
  --text-normal:  0 0% 77%;      /* body text */
  --text-low:     0 0% 56%;      /* secondary, placeholders */

  /* Background hierarchy */
  --bg-primary:   0 0% 13%;      /* main content area */
  --bg-secondary: 0 0% 11%;      /* sidebar, panels, navbar */
  --bg-panel:     0 0% 16%;      /* inputs, hover states */

  /* Borders */
  --border:       0 0% 20%;

  /* Brand accent — Herstel Warm-inspired orange */
  --brand:        25 82% 54%;
  --brand-hover:  25 75% 62%;

  /* Semantic */
  --success:      117 38% 50%;
  --error:        0 59% 57%;
  --info:         210 50% 55%;
}
```

### Typography

- Body: `IBM Plex Sans`, 12-14px base
- Mono: `IBM Plex Mono` for IDs, paths, timestamps
- Tight spacing matching VK (`half=4px`, `base=8px`, `double=16px`)
- Small border-radius (~0.25rem)

### Card Styling

Following VK's approach:
- `bg-primary` with `border` on `border` color
- `-mt-[1px] -mx-[1px]` overlap trick to avoid double borders
- Hover: subtle `bg-panel` shift
- Selected/open: `ring-2 ring-brand ring-inset`
- Action buttons invisible until `group-hover`

---

## Project Structure

```
muninn/
├── index.html
├── vite.config.ts
├── package.json
├── tailwind.config.ts
├── src/
│   ├── main.tsx                  # React root + router
│   ├── App.tsx                   # Layout shell (AppBar + Navbar + Outlet + Panel)
│   ├── index.css                 # CSS variables, font imports, Tailwind directives
│   ├── lib/
│   │   └── supabase.ts           # Supabase client init
│   ├── store/
│   │   ├── projects.ts           # Zustand: projects CRUD + kanban state
│   │   ├── tools.ts              # Zustand: tools CRUD
│   │   ├── sessions.ts           # Zustand: agent sessions (read-only)
│   │   └── ui.ts                 # Zustand: panel state, active view, theme
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppBar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── DetailPanel.tsx   # Resizable right panel shell
│   │   ├── board/
│   │   │   ├── KanbanBoard.tsx   # Column layout + drag context
│   │   │   ├── KanbanColumn.tsx  # Single column (header + droppable)
│   │   │   └── ProjectCard.tsx   # Card in column
│   │   ├── tools/
│   │   │   ├── ToolsGrid.tsx     # Card grid + summary stats
│   │   │   └── ToolCard.tsx
│   │   ├── agents/
│   │   │   ├── SessionFeed.tsx   # Vertical timeline
│   │   │   └── SessionCard.tsx
│   │   ├── detail/
│   │   │   ├── ProjectDetail.tsx # Right panel: project view/edit
│   │   │   └── ToolDetail.tsx    # Right panel: tool view/edit
│   │   └── ui/                   # Shared primitives (Badge, Button, etc.)
│   ├── pages/
│   │   ├── BoardPage.tsx
│   │   ├── ToolsPage.tsx
│   │   ├── AgentsPage.tsx
│   │   └── SettingsPage.tsx
│   └── types/
│       ├── project.ts
│       ├── tool.ts
│       └── session.ts
└── SPEC.md                       # This file
```

---

## MVP Scope

### Phase 1: Board + Shell
- [ ] Vite + React + Tailwind project setup (replace Next.js)
- [ ] CSS variables + dark theme + IBM Plex fonts
- [ ] AppBar + Navbar + main layout
- [ ] Supabase client connecting to Firmament
- [ ] Kanban board reading from `projects` table
- [ ] Project cards with drag & drop between columns
- [ ] Detail panel opening on card click
- [ ] Create / edit / update project from detail panel

### Phase 2: Tools
- [ ] `tools` table migration in Firmament
- [ ] Seed script to migrate ai-dashboard markdown → tools table
- [ ] Tools grid view with summary stats
- [ ] Tool cards with cost, platform, renewal info
- [ ] Tool detail panel (create / edit)

### Phase 3: Agents
- [ ] Session feed reading from `agent_sessions`
- [ ] Session cards with interface/machine badges
- [ ] Filtering by interface, machine, project
- [ ] Project cross-linking (click project name → Board view)

### Phase 4: Polish
- [ ] Light theme
- [ ] Keyboard shortcuts (Cmd+1-4 for sections)
- [ ] Cmd+K search across projects and tools
- [ ] Herstel palette picker
- [ ] Settings page with connection status

---

## Non-Goals (for now)

- Agent dispatch / running agents from the UI
- Real-time agent status monitoring
- Team/collaboration features
- Mobile-native app (web is fine on phone)
- Obsidian vault integration (that's Yggdrasil Center's job)
- Task/issue-level tracking within projects (projects are the unit, not tickets)

---

## Decisions Made

1. **Project name** — Muninn (Odin's raven of memory).
2. **Project status mapping** — dedicated `board_status` column on `projects` table. Clean, explicit, no hacks.
3. **Tool data source** — Firmament `tools` table is the source of truth. The ai-dashboard markdown data was mostly samples — start fresh.
4. **Auth** — skip for now. Supabase anon key is fine for a personal tool.
