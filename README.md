# Muninn 🐦‍⬛

> Visual control room for Alec's agent memory system. Frontend for [Firmament](https://github.com/alecvdp/personal-mcp) — the Supabase-backed personal memory layer that agents use through `personal-mcp`.

Named for Odin's raven of memory.

![Muninn Board View](docs/screenshot.png)

## What it does

Muninn makes the agent memory substrate visible, inspectable, and (eventually) curatable. The default view answers one question: **what do agents currently know about me?**

- **Overview** — Profile, active projects, recent sessions, recent memories, derived insights, and lightweight data-health signals (last memory/session, stale projects, totals)
- **Memories** — Browse, search, and filter the discrete facts agents have recorded (read-only in MVP)
- **Sessions** — Chronological feed of agent sessions with interface/machine filters
- **Projects** — Kanban board of projects agents orient themselves around (drag-and-drop, archiving, search)
- **Insights** — Derived patterns, trends, predictions, and connections produced by the reasoning pipeline
- **Tools** — AI subscription tracker (cost summary, renewal alerts) — secondary module
- **Settings** — Supabase connection status, theme toggle, version info

All data lives in your Firmament Supabase instance. Reads are live; the MVP intentionally avoids risky write flows for the new memory/insight tables.

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 19 + Vite |
| Styling | Tailwind CSS + HSL CSS variables |
| State | Zustand (devtools + persist) |
| Backend | Supabase (`@supabase/supabase-js`) |
| Drag & drop | `@hello-pangea/dnd` |
| Panels | `react-resizable-panels` |
| Icons | `@phosphor-icons/react` |
| Fonts | IBM Plex Sans + IBM Plex Mono |
| Router | React Router v7 |
| Tests | Vitest + Testing Library |

## Getting started

### Prerequisites

- Node.js 18+
- A Supabase project (the app uses anon key auth — no login required)

### Install

```bash
git clone https://github.com/alecvdp/muninn.git
cd muninn
npm install
```

### Configure

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Database setup

Muninn reads from the existing Firmament tables: `profile`, `projects`, `agent_sessions`, `memories`, `derived_insights`, and `tools`. The schema is owned by [personal-mcp](https://github.com/alecvdp/personal-mcp). The migrations below only cover the columns Muninn itself adds (kanban state, archived flag, the `tools` table) — apply them only if you're starting fresh:

**Projects table** (add kanban columns):
```sql
alter table projects
  add column if not exists board_status text default 'idea',
  add column if not exists board_position integer default 0,
  add column if not exists archived_at timestamptz;
```

**Tools table** (new):
```sql
create table tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'to-check-out',
  cost numeric(10,2) default 0,
  billing_cycle text,
  renewal_date date,
  platform text[] default '{}',
  url text,
  tags text[] default '{}',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tools enable row level security;
create policy "Allow all access" on tools for all using (true) with check (true);
```

**Enable realtime** (for live sync):
```sql
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table tools;
```

The `profile`, `preferences`, `agent_sessions`, `memories`, and `derived_insights` tables are managed by [personal-mcp](https://github.com/alecvdp/personal-mcp). Muninn reads from them but does not write — write/curation flows for memory data are intentionally deferred past MVP.

### Run

```bash
npm run dev
```

Open `http://localhost:5173`.

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server (Vite, port 5173) |
| `npm run build` | Type-check with tsc, then build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests (Vitest, 135 tests) |
| `npm run test:watch` | Run tests in watch mode |

## Project structure

```
muninn/
├── src/
│   ├── components/
│   │   ├── agents/         # SessionFeed, SessionCard
│   │   ├── board/          # KanbanBoard, KanbanColumn, ProjectCard
│   │   ├── detail/         # ProjectDetail, ToolDetail, CreateProjectDetail
│   │   ├── layout/         # AppBar, Navbar, DetailPanel
│   │   ├── tools/          # ToolsGrid, ToolCard
│   │   └── ui/             # ErrorBoundary, ErrorToast
│   ├── lib/
│   │   ├── supabase.ts     # Typed Supabase client
│   │   └── dates.ts        # Date utilities (renewal checks)
│   ├── pages/
│   │   ├── OverviewPage.tsx # Profile + projects + sessions + memories + insights + health
│   │   ├── MemoriesPage.tsx # Memory list with search/filter/expand
│   │   ├── InsightsPage.tsx # Derived insights with type/confidence filters
│   │   ├── BoardPage.tsx    # Kanban with search/filter/archive (mounted at /projects)
│   │   ├── ToolsPage.tsx    # Tool grid with cost summary
│   │   ├── AgentsPage.tsx   # Session feed with filters (mounted at /sessions)
│   │   ├── SettingsPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── store/
│   │   ├── overview.ts     # Aggregate fetch for the home dashboard
│   │   ├── memories.ts     # Memory list with pagination + filters
│   │   ├── insights.ts     # Derived insights with pagination + filters
│   │   ├── projects.ts     # Projects CRUD, kanban state, realtime
│   │   ├── tools.ts        # Tools CRUD, cost calculations, realtime
│   │   ├── sessions.ts     # Sessions with pagination + server-side filters
│   │   └── ui.ts           # Panel state, theme (persisted)
│   ├── types/
│   │   └── index.ts        # Shared row/insert/update types
│   ├── database.types.ts   # Generated Supabase schema types
│   ├── App.tsx             # Layout shell (AppBar + Navbar + Outlet + DetailPanel)
│   ├── main.tsx            # Router + ErrorBoundary
│   └── index.css           # CSS variables, dark/light themes
├── supabase/
│   └── migrations/         # SQL migrations
├── docs/
│   └── screenshot.png
├── SPEC.md                 # Original design spec
├── .env.example
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
└── package.json
```

## Layout

```
┌──────┬─────────────────────────────────────────────┐
│      │  Navbar  (view title, theme toggle)         │
│ App  ├──────────────────────┬──────────────────────┤
│ Bar  │                      │                      │
│      │  Main Content        │  Detail Panel        │
│ 48px │  (overview / mem /   │  (440px, resizable,  │
│      │   sess / proj / etc) │   opens on click)    │
│      │                      │                      │
└──────┴──────────────────────┴──────────────────────┘
```

- **AppBar** — Icon rail on the left. Overview, Memories, Sessions, Projects, Insights, Tools, Settings.
- **Navbar** — Top bar with view title and theme toggle.
- **Detail Panel** — Slides in from the right when you click a card. Escape to close. Focus-trapped for accessibility.

## Overview view

The home view (`/`). A one-screen answer to "what do agents currently know?"

Sections:
- **Profile** card from the `profile` table (name, pronouns, location, timezone, communication style, context)
- **Active projects** with stale-warning glyph for any active project that hasn't been touched in 60+ days
- **Recent sessions** (last 8) from `agent_sessions`
- **Recent memories** (last 8) from `memories` (excludes superseded)
- **Recent insights** (last 6) from `derived_insights` (excludes superseded)
- **Health bar** with totals and "last memory / last session" relative times

Read-only by design. Each section has a "View all →" link into the matching list page.

## Memories view

Browse, search, and filter the discrete facts agents have recorded (`/memories`).

- Server-side ILIKE search on `content`
- Filter by category, confidence, tag
- Click a row to expand inline (full content + tags + ids + provenance)
- Paginated (25 per page, "Load more")
- Read-only in MVP — promote/demote/edit flows come later

## Sessions view

Chronological feed of agent sessions from `agent_sessions` (`/sessions`).

- Sessions grouped by date
- Paginated (25 per page, "Load more")
- Filter by interface (claude-code, claude.ai, amp, etc.)
- Filter by machine (midgard, mini-ygg, etc.)
- Server-side filtering (queries pushed to Supabase, not client-side)

## Projects view

Kanban board of projects (`/projects`) — the records agents read to orient themselves.

| Column | Status | Color |
|---|---|---|
| Idea | `idea` | Blue |
| Todo | `todo` | Yellow |
| In Progress | `in-progress` | Orange |
| Paused | `paused` | Gray |
| Done | `done` | Green |

**Features:**
- Drag cards between columns to change status
- Reorder within columns (fractional positioning, handles filtered views)
- Search by name/description
- Filter by priority (P1–P5)
- Toggle archived projects visibility
- Click any card to edit in the detail panel
- Create new projects with the + button

## Insights view

Derived patterns, trends, predictions, and connections from `derived_insights` (`/insights`).

- Filter by `insight_type` (pattern / trend / prediction / connection)
- Filter by confidence (high / medium / low)
- Click a row to expand inline (full content + provenance counts)
- Excludes superseded insights
- Read-only in MVP

## Tools view

Track AI subscriptions and tools you're evaluating (`/tools`).

**Summary stats bar** at the top shows:
- Total monthly cost
- Total annual cost
- Active tool count
- Tools renewing within 30 days (highlighted)

**Each tool card** shows name, category badge (Using/To Check Out), cost, billing cycle, platform icons, renewal date, and tags.

**Filters:** Search by name, filter by category, filter by platform.

## Theming

Dark and light themes via CSS variables. Toggle in the navbar or Settings page. Theme preference persists in localStorage.

Colors use HSL format for easy customization — edit `src/index.css` to adjust:

```css
:root {
  --brand: 25 82% 54%;      /* Warm orange accent */
  --bg-surface: 0 0% 13%;   /* Main background */
  --bg-muted: 0 0% 11%;     /* Sidebar, panels */
  --text-normal: 0 0% 77%;  /* Body text */
}
```

Kanban column colors and tool category badges use semantic CSS variables (`--status-idea`, `--category-using`, etc.) so themes stay consistent.

## Realtime sync

Projects and Tools use Supabase Realtime channels. Changes on one machine appear instantly on others — no refresh needed.

The subscription lifecycle uses a global registry pattern to survive Vite HMR without orphaning channels. Each store tracks subscriber count and only removes the channel when the last consumer unmounts.

## Deployment

Build and deploy as a static site:

```bash
npm run build
```

The `dist/` folder can go to Cloudflare Pages, Vercel, Netlify, GitHub Pages, or any static host. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your hosting platform.

## Troubleshooting

**App crashes on load with "Missing Supabase environment variables":**
You need a `.env` file. Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key.

**Projects don't sync between tabs/machines:**
Check that the `supabase_realtime` publication includes the `projects` table. Run:
```sql
alter publication supabase_realtime add table projects;
```

**Drag and drop feels janky after many reorders:**
Fractional positioning can accumulate precision issues over time. A future improvement would normalize positions periodically.

**Build warns about chunk size:**
The 660KB bundle is primarily `@hello-pangea/dnd` + Supabase client. Code splitting via `React.lazy()` is tracked as a future improvement.

## Design references

Muninn's visual design and component architecture are heavily inspired by [Vibe Kanban](https://github.com/barvian/vibe-kanban):
- Three-zone layout (AppBar + main + detail panel)
- Card styling with border overlap trick
- HSL color token system
- IBM Plex typography
- Phosphor icon set

Full design spec: [SPEC.md](SPEC.md)

---

> *"Muninn and Huginn fly each day over the spacious earth. I fear for Huginn, that he come not back, yet more anxious am I for Muninn."* — Odin

MIT License — Built for solo builders who ship.
