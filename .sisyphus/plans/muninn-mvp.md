# Muninn MVP — Work Plan

## TL;DR

> **Build a personal project workbench** with kanban board, AI tool tracking, and agent session history — all backed by Firmament (Supabase). Phases 1-3 of the SPEC.md.
> 
> **Deliverables**:
> - Phase 1: Board + Shell (Vite setup, kanban with drag-drop, detail panel)
> - Phase 2: Tools view (AI subscriptions grid, detail panel)
> - Phase 3: Agents view (session history timeline)
> 
> **Estimated Effort**: Large (20+ tasks across 3 phases)
> **Parallel Execution**: YES — 4 waves per phase
> **Critical Path**: Migrations → Types → Shell → Board → Tools → Agents → Final QA

---

## Context

### Original Request
Build Muninn — a personal project workbench for solo vibe coding. Kanban board for projects, AI tool tracking, agent session history. Follow SPEC.md exactly, Phases 1-3, manual testing only.

### SPEC.md Summary
- **Stack**: React + Vite + Tailwind + Zustand + Supabase
- **Layout**: 48px AppBar + Navbar + resizable DetailPanel
- **Views**: Board (`/`), Tools (`/tools`), Agents (`/agents`), Settings (`/settings`)
- **Data**: Firmament tables (`projects`, `agent_sessions`, `memories`) + new `tools` table
- **Styling**: Herstel theme CSS variables, IBM Plex fonts, dark default
- **Features**: Drag-drop kanban, realtime updates, detail panels

### Metis Review Findings

**Addressed in this plan:**
- Cross-repo migrations in `personal-mcp` included as blocking tasks
- Tailwind v3/v4 syntax verification included in setup
- Realtime table enablement included
- Vite env var patterns (`VITE_` prefix) enforced
- Extremely specific manual QA scenarios for every task

**Defaults applied:**
- DetailPanel state: Zustand global (`selectedProjectId`, `isPanelOpen`)
- board_position: Increment by 1000, recalculate on reorder
- Font loading: Google Fonts CDN

---

## Work Objectives

### Core Objective
Build a functional personal project workbench with kanban board, AI tool tracking, and agent session history that syncs across devices via Supabase.

### Concrete Deliverables

**Phase 1: Board + Shell**
- Vite + React + Tailwind project scaffolding
- Supabase client with type generation
- AppBar + Navbar + DetailPanel layout
- Kanban board with 5 columns (Idea, Todo, In-Progress, Paused, Done)
- Drag-drop reordering within and between columns
- Project cards displaying name, description, tech stack, priority
- Detail panel for viewing/editing projects
- Realtime sync across browser tabs

**Phase 2: Tools**
- `tools` table migration in Firmament
- Tools grid view with summary stats (monthly cost, annual cost, active count)
- Tool cards with cost, billing cycle, platform icons, renewal dates
- Tool detail panel for create/edit

**Phase 3: Agents**
- Session feed reading from `agent_sessions`
- Session cards with interface/machine badges
- Project cross-linking (click → Board view)
- Settings view (read-only: connection status, theme toggle)

### Definition of Done
- [ ] All Phase 1-3 features functional at `npm run dev`
- [ ] Manual QA checklist completed for each phase
- [ ] All database migrations applied to Firmament
- [ ] Realtime updates working across browser tabs
- [ ] No console errors in browser DevTools

### Must Have
- Kanban board with drag-drop between 5 fixed columns
- Project detail panel with editable fields
- Tools grid with cost tracking
- Session history timeline
- Realtime sync via Supabase
- Dark theme as default

### Must NOT Have (Guardrails)
- NO authentication flows (anon key only per spec)
- NO automated tests (manual QA only per user request)
- NO column customization (fixed 5 columns)
- NO tool reordering drag-drop (only kanban board)
- NO settings persistence (read-only per Phase 3 spec)
- NO task/issue tracking within projects

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (empty repo)
- **Automated tests**: NO (user explicitly rejected)
- **Manual QA**: YES — extremely specific scenarios for every task
- **QA Method**: Agent-executed Playwright or manual browser verification

### QA Policy
Every task includes agent-executable QA scenarios with:
- Exact URL paths (`http://localhost:5173/board`)
- Specific CSS selectors or visible text assertions
- Step-by-step user actions
- Expected visual state descriptions
- Persistence checks (refresh page, verify state maintained)

Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Parallel Execution Waves

**Phase 1: Board + Shell**

```
Wave 1 (Foundation — blocking for all other work):
├── T1: Vite + React + Tailwind project scaffolding
├── T2: Tailwind v3/v4 verification + CSS variables
├── T3: IBM Plex fonts + base styling
└── T4: Directory structure (src/lib, src/store, src/components, etc.)

Wave 2 (Backend + Types — blocking for data features):
├── T5: Personal-mcp migrations (board_status, tools table)
├── T6: Enable realtime on projects table
├── T7: Supabase client setup + env vars
└── T8: Type generation from database

Wave 3 (Core Shell + Stores — parallel UI development):
├── T9: Zustand stores (projects, tools, sessions, ui)
├── T10: AppBar component
├── T11: Navbar component
├── T12: DetailPanel shell (resizable)
└── T13: React Router setup + route structure

Wave 4 (Board Features):
├── T14: KanbanBoard + KanbanColumn components
├── T15: ProjectCard component
├── T16: Drag-drop implementation (@hello-pangea/dnd)
├── T17: ProjectDetail panel component
├── T18: BoardPage integration
└── T19: Phase 1 manual QA verification
```

**Phase 2: Tools**

```
Wave 5 (Tools Foundation):
├── T20: Tools Zustand store + queries
├── T21: ToolCard component
└── T22: ToolsGrid component

Wave 6 (Tools Features):
├── T23: ToolsPage + summary stats
├── T24: ToolDetail panel component
├── T25: Tools data seeding (optional manual step)
└── T26: Phase 2 manual QA verification
```

**Phase 3: Agents + Settings**

```
Wave 7 (Agents):
├── T27: Sessions Zustand store (read-only)
├── T28: SessionCard component
├── T29: SessionFeed component
└── T30: AgentsPage integration

Wave 8 (Settings + Final):
├── T31: SettingsPage (read-only)
├── T32: Phase 3 manual QA verification
└── T33: Final cross-phase integration QA
```

**Wave FINAL (After ALL tasks):**
```
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA (unspecified-high)
└── F4: Scope fidelity check (deep)
```

### Dependency Matrix

| Task | Blocked By | Blocks |
|------|-----------|--------|
| T1-4 | - | T5-13 |
| T5-8 | T1-4 | T9-19, T20-33 |
| T9-13 | T5-8 | T14-19, T20-33 |
| T14-19 | T9-13 | T20-33 |
| T20-26 | T9-13 | T27-33 |
| T27-33 | T9-13 | F1-4 |
| F1-4 | T1-33 | - |

### Agent Dispatch Summary

- **Wave 1** (4 tasks): `quick` × 4
- **Wave 2** (4 tasks): `quick` × 4 (cross-repo work)
- **Wave 3** (5 tasks): `quick` × 5
- **Wave 4** (6 tasks): `visual-engineering` × 3, `quick` × 2, `unspecified-high` × 1
- **Wave 5** (3 tasks): `quick` × 2, `visual-engineering` × 1
- **Wave 6** (4 tasks): `visual-engineering` × 3, `unspecified-high` × 1
- **Wave 7** (4 tasks): `visual-engineering` × 3, `quick` × 1
- **Wave 8** (3 tasks): `visual-engineering` × 1, `unspecified-high` × 2
- **FINAL** (4 tasks): `oracle`, `unspecified-high` × 2, `deep`

---

## TODOs

- [x] T1. Vite + React + Tailwind project scaffolding

  **What to do**:
  - Initialize Vite project: `npm create vite@latest . -- --template react-ts`
  - Install dependencies: `npm install`
  - Verify project runs: `npm run dev` → should show Vite + React default page at localhost:5173
  - Install Tailwind: `npm install -D tailwindcss postcss autoprefixer` then `npx tailwindcss init -p`
  - Check Tailwind version — if v4, use `@import "tailwindcss"` syntax; if v3, use `@tailwind` directives

  **Must NOT do**:
  - Do NOT install Next.js (explicitly excluded in spec)
  - Do NOT set up any authentication
  - Do NOT modify src files beyond what's needed for Tailwind

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Justification**: Pure setup task, no complex logic

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocked By**: None
  - **Blocks**: T2, T3, T4 (Wave 1 tasks can run in any order within wave)

  **Acceptance Criteria**:
  - [ ] `vite.config.ts` exists and is configured
  - [ ] `npm run dev` starts dev server on localhost:5173
  - [ ] Default Vite + React page displays
  - [ ] `tailwind.config.ts` (or .js) created
  - [ ] Tailwind version identified (v3 or v4) and logged for downstream tasks

  **QA Scenarios**:
  ```
  Scenario: Vite dev server starts
    Tool: Bash
    Steps:
      1. cd /home/alec/git/muninn && npm run dev
      2. Wait 5 seconds
      3. curl -s http://localhost:5173 | head -20
    Expected: HTML contains "Vite + React" or React logo
    Evidence: .sisyphus/evidence/t1-vite-running.html
  
  Scenario: Tailwind installed
    Tool: Bash
    Steps:
      1. cat package.json | grep tailwindcss
      2. ls tailwind.config.*
    Expected: tailwindcss in dependencies, config file exists
    Evidence: .sisyphus/evidence/t1-tailwind-installed.txt
  ```

  **Commit**: YES
  - Message: `init: Vite + React + Tailwind project setup`
  - Files: All new project files

---

- [x] T2. Tailwind v3/v4 verification + CSS variables

  **What to do**:
  - Check Tailwind version in package.json
  - If v4: Use `@import "tailwindcss"` in index.css, configure via CSS variables in `@theme inline`
  - If v3: Use `@tailwind base; @tailwind components; @tailwind utilities` directives
  - Set up Herstel theme CSS variables from SPEC.md section "Color Tokens"
  - Variables needed: --text-high, --text-normal, --text-low, --bg-primary, --bg-secondary, --bg-panel, --border, --brand, --brand-hover, --success, --error, --info
  - Add to `src/index.css`

  **Must NOT do**:
  - Do NOT mix v3 and v4 syntax
  - Do NOT skip any color tokens

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocked By**: T1
  - **Blocks**: T3

  **Acceptance Criteria**:
  - [ ] `src/index.css` contains all CSS variables from spec
  - [ ] Variables use HSL format: `0 0% 13%` (not hex or rgb)
  - [ ] Tailwind configured to use CSS variables
  - [ ] Dev server still runs without errors

  **QA Scenarios**:
  ```
  Scenario: CSS variables defined
    Tool: Bash
    Steps:
      1. cat src/index.css | grep -A 20 "text-high"
      2. cat src/index.css | grep -c "--bg-"
    Expected: All color tokens present, count >= 10
    Evidence: .sisyphus/evidence/t2-css-variables.css
  
  Scenario: Tailwind loads without error
    Tool: Bash
    Steps:
      1. npm run dev &
      2. sleep 3
      3. curl -s http://localhost:5173/src/index.css 2>/dev/null || echo "Check browser console"
    Expected: No Tailwind-related errors in terminal
    Evidence: .sisyphus/evidence/t2-tailwind-ok.txt
  ```

  **Commit**: YES
  - Message: `config: Herstel theme CSS variables`
  - Files: `src/index.css`, `tailwind.config.*`

---

- [x] T3. IBM Plex fonts + base styling

  **What to do**:
  - Add Google Fonts link to `index.html`:
    ```html
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    ```
  - Configure Tailwind to use IBM Plex:
    ```js
    fontFamily: {
      sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
      mono: ['IBM Plex Mono', 'monospace'],
    }
    ```
  - Set base font-size to 14px (spec says 12-14px base)
  - Add body styles: bg-primary, text-normal, font-sans

  **Must NOT do**:
  - Do NOT use local font files (CDN approach per spec)
  - Do NOT skip monospace for code/IDs

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocked By**: T1
  - **Blocks**: T14-T19

  **Acceptance Criteria**:
  - [ ] Google Fonts link in index.html `<head>`
  - [ ] fontFamily configured in Tailwind
  - [ ] Body has base styling applied
  - [ ] Verify fonts load in browser DevTools Network tab

  **QA Scenarios**:
  ```
  Scenario: Fonts load correctly
    Tool: Playwright
    Steps:
      1. Open http://localhost:5173
      2. Wait for page load
      3. Check computed styles on body element
    Expected: font-family contains "IBM Plex Sans"
    Evidence: .sisyphus/evidence/t3-fonts-loaded.png
  ```

  **Commit**: YES
  - Message: `config: IBM Plex Sans/Mono fonts`
  - Files: `index.html`, `tailwind.config.*`, `src/index.css`

---

- [x] T4. Directory structure

  **What to do**:
  - Create all directories from SPEC.md project structure:
    ```
    src/
    ├── lib/
    ├── store/
    ├── components/
    │   ├── layout/
    │   ├── board/
    │   ├── tools/
    │   ├── agents/
    │   ├── detail/
    │   └── ui/
    ├── pages/
    └── types/
    ```
  - Create placeholder `.gitkeep` files in empty directories
  - Verify structure matches spec exactly

  **Must NOT do**:
  - Do NOT create files that belong in other tasks
  - Do NOT deviate from spec directory names

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocked By**: T1
  - **Blocks**: T9-T13 (store and component tasks)

  **Acceptance Criteria**:
  - [ ] All directories from spec exist
  - [ ] Tree structure matches spec
  - [ ] No extra directories created

  **QA Scenarios**:
  ```
  Scenario: Directory structure matches spec
    Tool: Bash
    Steps:
      1. tree src/ || find src -type d | sort
      2. Count directories
    Expected: src/lib, src/store, src/components/layout, src/components/board, etc.
    Evidence: .sisyphus/evidence/t4-directory-tree.txt
  ```

  **Commit**: YES
  - Message: `chore: Create src directory structure`
  - Files: All new directories

---

## Phase 1 Wave 2: Backend + Types

- [x] T5. Personal-mcp migrations (board_status, tools table)

  **What to do**:
  - Navigate to `/home/alec/git/personal-mcp`
  - Create migration file: `supabase/migrations/20260411000001_add_board_status_to_projects.sql`
    ```sql
    alter table projects
      add column if not exists board_status text default 'idea',
      add column if not exists board_position integer default 0;
    
    comment on column projects.board_status is 'Kanban column: idea, todo, in-progress, paused, done';
    comment on column projects.board_position is 'Sort order within a kanban column (lower = higher)';
    
    -- Backfill existing projects based on current status
    update projects set board_status = status where board_status = 'idea';
    ```
  - Create migration file: `supabase/migrations/20260411000002_add_tools_table.sql`
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
    
    comment on table tools is 'AI tool subscriptions and tools to evaluate';
    ```
  - Run migrations locally or note for manual application to remote

  **Must NOT do**:
  - Do NOT create migrations in muninn repo (wrong repo)
  - Do NOT skip the RLS policy on tools table

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocked By**: T1
  - **Blocks**: T6, T7, T8 (all data tasks)

  **Acceptance Criteria**:
  - [ ] Both migration files exist in personal-mcp/supabase/migrations/
  - [ ] SQL syntax is valid
  - [ ] Migrations can be applied (test with `supabase db reset` or manual apply)

  **QA Scenarios**:
  ```
  Scenario: Migrations exist and are valid
    Tool: Bash
    Steps:
      1. ls -la /home/alec/git/personal-mcp/supabase/migrations/*board_status* /home/alec/git/personal-mcp/supabase/migrations/*tools*
      2. head -10 each file
    Expected: Two migration files with correct SQL
    Evidence: .sisyphus/evidence/t5-migrations.txt
  ```

  **Commit**: YES (in personal-mcp repo)
  - Message: `db: Add board_status/board_position to projects, create tools table`
  - Files: `supabase/migrations/20260411000001_add_board_status_to_projects.sql`, `supabase/migrations/20260411000002_add_tools_table.sql`

---

- [x] T6. Enable realtime on projects table

  **What to do**:
  - Create migration in personal-mcp: `supabase/migrations/20260411000003_enable_realtime_projects.sql`
    ```sql
    -- Enable realtime for projects table (for kanban drag-drop sync)
    alter publication supabase_realtime add table projects;
    ```
  - Apply migration
  - Verify in Supabase dashboard: Database → Replication → Realtime → tables should include `projects`

  **Must NOT do**:
  - Do NOT enable realtime on tables not needed for MVP

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocked By**: T5
  - **Blocks**: T16 (drag-drop needs realtime)

  **Acceptance Criteria**:
  - [ ] Migration file exists
  - [ ] Realtime enabled on projects table
  - [ ] Can subscribe to changes in code

  **QA Scenarios**:
  ```
  Scenario: Realtime enabled
    Tool: Bash
    Steps:
      1. cat /home/alec/git/personal-mcp/supabase/migrations/*realtime*
      2. Check Supabase dashboard or note manual verification needed
    Expected: Migration contains ALTER PUBLICATION for projects
    Evidence: .sisyphus/evidence/t6-realtime.sql
  ```

  **Commit**: YES (in personal-mcp repo)
  - Message: `db: Enable realtime on projects table`
  - Files: Migration file

---

- [x] T7. Supabase client setup + env vars

  **What to do**:
  - Install Supabase client: `npm install @supabase/supabase-js`
  - Create `.env` file with VITE_ prefix (required for Vite):
    ```
    VITE_SUPABASE_URL=https://qtwlvbxdybfgrnkotqum.supabase.co
    VITE_SUPABASE_ANON_KEY=<get from personal-mcp .env or Supabase dashboard>
    ```
  - Create `src/lib/supabase.ts`:
    ```typescript
    import { createClient } from '@supabase/supabase-js';
    import type { Database } from '../database.types';
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
    ```
  - Add `.env` to `.gitignore`
  - Verify client initializes without errors

  **Must NOT do**:
  - Do NOT use `process.env` (Vite uses `import.meta.env`)
  - Do NOT skip the VITE_ prefix on env vars
  - Do NOT commit `.env` file

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocked By**: T1
  - **Blocks**: T8, T9, T14-T19

  **Acceptance Criteria**:
  - [ ] `@supabase/supabase-js` in package.json dependencies
  - [ ] `.env` file exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
  - [ ] `src/lib/supabase.ts` exports configured client
  - [ ] `.env` in `.gitignore`
  - [ ] Client can query projects table (test with simple select)

  **QA Scenarios**:
  ```
  Scenario: Supabase client works
    Tool: Bash
    Steps:
      1. Add test query to App.tsx temporarily:
         supabase.from('projects').select('*').limit(1).then(console.log)
      2. npm run dev
      3. Check browser console for query result
    Expected: Query returns data or empty array (not error)
    Evidence: .sisyphus/evidence/t7-supabase-query.txt
  
  Scenario: Env vars loaded
    Tool: Bash
    Steps:
      1. cat .env | grep VITE_SUPABASE
      2. cat .gitignore | grep .env
    Expected: Both env vars defined, .env in gitignore
    Evidence: .sisyphus/evidence/t7-env-vars.txt
  ```

  **Commit**: YES
  - Message: `config: Supabase client with VITE_ env vars`
  - Files: `src/lib/supabase.ts`, `.env` (not committed), `.gitignore`

---

- [x] T8. Type generation from database

  **What to do**:
  - Ensure personal-mcp migrations are applied (T5, T6 complete)
  - Generate TypeScript types:
    ```bash
    npx supabase gen types typescript --project-id qtwlvbxdybfgrnkotqum --schema public > src/database.types.ts
    ```
  - Or if using local Supabase:
    ```bash
    cd /home/alec/git/personal-mcp && npx supabase gen types typescript --local > /home/alec/git/muninn/src/database.types.ts
    ```
  - Verify types include: projects (with board_status, board_position), tools, agent_sessions, memories
  - Export Database type from `src/lib/supabase.ts`

  **Must NOT do**:
  - Do NOT generate types before migrations are applied (types will be incomplete)
  - Do NOT manually edit the generated file (regenerate instead)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocked By**: T5, T6, T7
  - **Blocks**: T9-T33 (all type-dependent tasks)

  **Acceptance Criteria**:
  - [ ] `src/database.types.ts` exists
  - [ ] File contains Database interface
  - [ ] Tables include: projects, tools, agent_sessions, memories
  - [ ] Projects table has board_status and board_position columns
  - [ ] No TypeScript errors when importing Database type

  **QA Scenarios**:
  ```
  Scenario: Types generated correctly
    Tool: Bash
    Steps:
      1. ls -la src/database.types.ts
      2. grep -c "board_status" src/database.types.ts
      3. grep -c "board_position" src/database.types.ts
      4. grep -c "interface Database" src/database.types.ts
    Expected: File exists, contains board_status, board_position, Database interface
    Evidence: .sisyphus/evidence/t8-types-generated.txt
  ```

  **Commit**: YES
  - Message: `types: Generate Supabase database types`
  - Files: `src/database.types.ts`

---

## Phase 1 Wave 3: Core Shell + Stores

- [x] T9. Zustand stores

  **What to do**:
  - Install Zustand: `npm install zustand`
  - Create stores following spec:
    - `src/store/projects.ts`: CRUD + kanban state (board_status, board_position updates)
    - `src/store/tools.ts`: CRUD for tools
    - `src/store/sessions.ts`: Read-only agent sessions
    - `src/store/ui.ts`: panel state (selectedProjectId, isPanelOpen), active view, theme
  - Use slice pattern with devtools middleware:
    ```typescript
    import { create } from 'zustand';
    import { devtools } from 'zustand/middleware';
    
    interface UIState {
      selectedProjectId: string | null;
      isPanelOpen: boolean;
      activeView: 'board' | 'tools' | 'agents' | 'settings';
      theme: 'dark' | 'light';
      selectProject: (id: string | null) => void;
      togglePanel: () => void;
      setView: (view: UIState['activeView']) => void;
      toggleTheme: () => void;
    }
    
    export const useUIStore = create<UIState>()(
      devtools((set) => ({
        selectedProjectId: null,
        isPanelOpen: false,
        activeView: 'board',
        theme: 'dark',
        selectProject: (id) => set({ selectedProjectId: id, isPanelOpen: id !== null }),
        togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
        setView: (view) => set({ activeView: view }),
        toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      }))
    );
    ```
  - Projects store needs realtime subscription setup

  **Must NOT do**:
  - Do NOT use Redux or other state managers
  - Do NOT skip devtools middleware

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocked By**: T4, T8
  - **Blocks**: T10-T33

  **Acceptance Criteria**:
  - [ ] Zustand installed
  - [ ] All 4 store files created
  - [ ] UI store has selectedProjectId, isPanelOpen, activeView, theme
  - [ ] Projects store has fetch, subscribe, updateBoardStatus, updateBoardPosition
  - [ ] Stores compile without TypeScript errors

  **QA Scenarios**:
  ```
  Scenario: Stores compile and export
    Tool: Bash
    Steps:
      1. cat src/store/ui.ts | grep "export"
      2. npm run build 2>&1 | head -20
    Expected: useUIStore exported, no build errors
    Evidence: .sisyphus/evidence/t9-stores.txt
  ```

  **Commit**: YES
  - Message: `store: Zustand stores for projects, tools, sessions, ui`
  - Files: `src/store/*.ts`

---

- [x] T10. AppBar component

  **What to do**:
  - Create `src/components/layout/AppBar.tsx`
  - 48px wide vertical rail, dark background (bg-secondary)
  - Icons stacked vertically with section labels:
    - 📋 KanbanSquare → Board
    - 🤖 Robot → Tools
    - ⚡ Lightning → Agents
    - ⚙️ Gear → Settings
  - Use `@phosphor-icons/react` (install: `npm install @phosphor-icons/react`)
  - Bottom: App name "Muninn" in small text
  - Clicking icon updates UI store activeView
  - Active view highlighted with brand color

  **Must NOT do**:
  - Do NOT use different icons than spec
  - Do NOT make it wider than 48px

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocked By**: T3, T9
  - **Blocks**: T18 (BoardPage integration)

  **Acceptance Criteria**:
  - [ ] Component renders 48px wide rail
  - [ ] 4 navigation icons visible
  - [ ] Clicking icon updates activeView in store
  - [ ] Active view has visual highlight
  - [ ] Uses Phosphor icons

  **QA Scenarios**:
  ```
  Scenario: AppBar renders with icons
    Tool: Playwright
    Steps:
      1. Open http://localhost:5173
      2. Screenshot the AppBar
      3. Check 4 Phosphor icons present
    Expected: 48px rail, 4 icons, "Muninn" at bottom
    Evidence: .sisyphus/evidence/t10-appbar.png
  
  Scenario: Navigation works
    Tool: Playwright
    Steps:
      1. Click Tools icon (Robot)
      2. Check URL or UI store state
      3. Click Board icon (KanbanSquare)
    Expected: activeView changes, visual highlight moves
    Evidence: .sisyphus/evidence/t10-navigation.png
  ```

  **Commit**: YES
  - Message: `ui: AppBar component with navigation`
  - Files: `src/components/layout/AppBar.tsx`

---

- [x] T11. Navbar component

  **What to do**:
  - Create `src/components/layout/Navbar.tsx`
  - Slim horizontal bar (bg-secondary, border-b)
  - Left side: Current view name ("Board", "Tools", "Agents", "Settings")
  - Right side: Theme toggle button, placeholder for Cmd+K search
  - View name should react to UI store activeView

  **Must NOT do**:
  - Do NOT add actual search functionality (future phase per spec)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocked By**: T2, T9
  - **Blocks**: T18

  **Acceptance Criteria**:
  - [ ] Navbar renders at top
  - [ ] Shows correct view name based on activeView
  - [ ] Theme toggle button present
  - [ ] Toggle updates UI store theme

  **QA Scenarios**:
  ```
  Scenario: Navbar shows view name
    Tool: Playwright
    Steps:
      1. Open http://localhost:5173
      2. Screenshot navbar
      3. Click different AppBar icons
      4. Screenshot navbar each time
    Expected: View name changes ("Board" → "Tools" → "Agents" → "Settings")
    Evidence: .sisyphus/evidence/t11-navbar.png
  ```

  **Commit**: YES
  - Message: `ui: Navbar component with view title and theme toggle`
  - Files: `src/components/layout/Navbar.tsx`

---

- [x] T12. DetailPanel shell

  **What to do**:
  - Create `src/components/layout/DetailPanel.tsx`
  - Use `react-resizable-panels` (install: `npm install react-resizable-panels`)
  - Right side panel, hidden by default
  - Slides in when `isPanelOpen` is true (from UI store)
  - Resizable: min 360px, max 600px, default 440px
  - bg-secondary background
  - Close button (×) that sets isPanelOpen to false
  - Escape key handler to close
  - Children render in panel body

  **Must NOT do**:
  - Do NOT implement project/tool detail content (separate tasks)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocked By**: T2, T9
  - **Blocks**: T17, T24 (detail panel content tasks)

  **Acceptance Criteria**:
  - [ ] Panel renders when isPanelOpen is true
  - [ ] Panel hidden when isPanelOpen is false
  - [ ] Resizable with correct constraints
  - [ ] Close button works
  - [ ] Escape key closes panel

  **QA Scenarios**:
  ```
  Scenario: Panel opens and closes
    Tool: Playwright
    Steps:
      1. Open http://localhost:5173
      2. Set isPanelOpen = true via store or button
      3. Screenshot showing panel
      4. Click close button
      5. Screenshot showing panel closed
    Expected: Panel slides in/out, close button works
    Evidence: .sisyphus/evidence/t12-panel-toggle.png
  
  Scenario: Panel is resizable
    Tool: Playwright
    Steps:
      1. Open panel
      2. Drag resize handle
      3. Measure width
    Expected: Width changes between 360-600px
    Evidence: .sisyphus/evidence/t12-resize.png
  ```

  **Commit**: YES
  - Message: `ui: DetailPanel shell with react-resizable-panels`
  - Files: `src/components/layout/DetailPanel.tsx`

---

- [x] T13. React Router setup + route structure

  **What to do**:
  - Install react-router: `npm install react-router`
  - Update `src/main.tsx` to use RouterProvider
  - Create `src/App.tsx` with layout shell:
    ```tsx
    function App() {
       return (
         <div className="flex h-screen bg-primary text-normal">
           <AppBar />
           <div className="flex-1 flex flex-col">
             <Navbar />
             <div className="flex-1 flex overflow-hidden">
               <main className="flex-1 overflow-auto">
                 <Outlet />
               </main>
               <DetailPanel />
             </div>
           </div>
         </div>
       );
     }
    ```
  - Set up routes in `src/main.tsx`:
    - `/` → BoardPage
    - `/tools` → ToolsPage
    - `/agents` → AgentsPage
    - `/settings` → SettingsPage
  - Create placeholder page components (actual content in later tasks)

  **Must NOT do**:
  - Do NOT use Next.js routing (explicitly excluded)
  - Do NOT add route guards (no auth)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocked By**: T1, T9, T10, T11, T12
  - **Blocks**: T18, T23, T29, T31 (page integration tasks)

  **Acceptance Criteria**:
  - [ ] react-router installed
  - [ ] Routes defined for /, /tools, /agents, /settings
  - [ ] App.tsx renders AppBar + Navbar + Outlet + DetailPanel
  - [ ] Navigation changes URL and renders correct page
  - [ ] Layout is full-height with correct flex structure

  **QA Scenarios**:
  ```
  Scenario: Routing works
    Tool: Playwright
    Steps:
      1. Open http://localhost:5173/
      2. Navigate to /tools, /agents, /settings
      3. Check URL and page content
    Expected: Each route loads, URL updates
    Evidence: .sisyphus/evidence/t13-routing.png
  
  Scenario: Layout structure correct
    Tool: Playwright
    Steps:
      1. Open http://localhost:5173/
      2. Inspect layout structure
      3. Measure AppBar width, check flex layout
    Expected: 48px AppBar, full-height layout, Outlet in main area
    Evidence: .sisyphus/evidence/t13-layout.png
  ```

  **Commit**: YES
  - Message: `config: React Router setup with layout shell`
  - Files: `src/main.tsx`, `src/App.tsx`

---

## Phase 1 Wave 4: Board Features

- [x] T14. KanbanBoard + KanbanColumn components

  **What to do**:
  - Create `src/components/board/KanbanBoard.tsx`
  - Create `src/components/board/KanbanColumn.tsx`
  - Install drag-drop: `npm install @hello-pangea/dnd`
  - 5 columns: Idea, Todo, In-Progress, Paused, Done
  - Each column:
    - Header with column name and count
    - Droppable area for cards
    - Color dot matching spec (blue, yellow, orange, gray, green)
  - Board fetches projects from store
  - Groups projects by board_status
  - Sorts by board_position within columns

  **Must NOT do**:
  - Do NOT add column customization (fixed 5 columns per spec)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4)
  - **Blocked By**: T8, T9, T13
  - **Blocks**: T16, T18

  **Acceptance Criteria**:
  - [ ] 5 columns render with correct names
  - [ ] Each column has colored dot
  - [ ] Droppable areas configured
  - [ ] Projects grouped by board_status
  - [ ] Projects sorted by board_position

  **QA Scenarios**:
  ```
  Scenario: Columns render correctly
    Tool: Playwright
    Steps:
      1. Open http://localhost:5173/board
      2. Screenshot board
      3. Count columns
    Expected: 5 columns with names and colored dots
    Evidence: .sisyphus/evidence/t14-columns.png
  ```

  **Commit**: YES
  - Message: `feature: KanbanBoard with 5 columns`
  - Files: `src/components/board/KanbanBoard.tsx`, `src/components/board/KanbanColumn.tsx`

---

- [x] T15. ProjectCard component

  **What to do**:
  - Create `src/components/board/ProjectCard.tsx`
  - Draggable card using `@hello-pangea/dnd`
  - Display per spec:
    - Project name (bold, text-normal)
    - Description (1-2 lines, text-low, line-clamp-2)
    - Tech stack tags (small badges)
    - Priority indicator (dot or number)
    - Last activity timestamp
  - Styling per spec:
    - bg-primary with border
    - `-mt-[1px] -mx-[1px]` overlap trick
    - Hover: bg-panel shift
    - Selected/open: ring-2 ring-brand ring-inset
  - Click opens detail panel (sets selectedProjectId)

  **Must NOT do**:
  - Do NOT add action buttons yet (future enhancement)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4)
  - **Blocked By**: T2, T3, T9
  - **Blocks**: T16, T18

  **Acceptance Criteria**:
  - [ ] Card is draggable
  - [ ] Shows name, description, tags, priority
  - [ ] Clicking opens detail panel
  - [ ] Hover and selected states styled correctly
  - [ ] Uses CSS overlap trick

  **QA Scenarios**:
  ```
  Scenario: Card displays correctly
    Tool: Playwright
    Steps:
      1. Open http://localhost:5173/board
      2. Screenshot a project card
      3. Verify all elements visible
    Expected: Name, description, tags, priority shown
    Evidence: .sisyphus/evidence/t15-card.png
  
  Scenario: Click opens panel
    Tool: Playwright
    Steps:
      1. Click a project card
      2. Check detail panel state
    Expected: isPanelOpen = true, selectedProjectId set
    Evidence: .sisyphus/evidence/t15-click-panel.png
  ```

  **Commit**: YES
  - Message: `feature: ProjectCard component with styling`
  - Files: `src/components/board/ProjectCard.tsx`

---

- [x] T16. Drag-drop implementation

  **What to do**:
  - Implement drag-drop logic in KanbanBoard
  - Handle onDragEnd event
  - Same column reorder: update board_position values
  - Cross-column move: update board_status + recalculate board_position
  - Persist changes to Supabase immediately
  - Optimistic UI updates (update local state before API response)
  - Subscribe to realtime changes from other tabs
  - Handle board_position algorithm:
    - New items: position = max + 1000
    - Reordering: find gap between neighbors, or recalculate all

  **Must NOT do**:
  - Do NOT implement tool reordering (only kanban board per spec)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4)
  - **Blocked By**: T6, T9, T14, T15
  - **Blocks**: T19 (Phase 1 QA)

  **Acceptance Criteria**:
  - [ ] Cards can be dragged between columns
  - [ ] Reordering within column works
  - [ ] Changes persist to Supabase
  - [ ] Realtime updates from other tabs
  - [ ] Position algorithm handles edge cases

  **QA Scenarios**:
  ```
  Scenario: Drag between columns
    Tool: Playwright
    Steps:
      1. Open http://localhost:5173/board
      2. Drag card from "Todo" to "In-Progress"
      3. Refresh page
    Expected: Card stays in new column
    Evidence: .sisyphus/evidence/t16-drag-column.png
  
  Scenario: Realtime sync
    Tool: Playwright (2 browser contexts)
    Steps:
      1. Open board in Browser A
      2. Open board in Browser B
      3. Drag card in Browser A
      4. Check Browser B
    Expected: Card moves in Browser B automatically
    Evidence: .sisyphus/evidence/t16-realtime.png
  ```

  **Commit**: YES
  - Message: `feature: Drag-drop with Supabase persistence and realtime sync`
  - Files: Updates to KanbanBoard, projects store

---

- [x] T17. ProjectDetail panel component

  **What to do**:
  - Create `src/components/detail/ProjectDetail.tsx`
  - Rendered inside DetailPanel when selectedProjectId is set
  - Display and edit:
    - Project name (editable text input)
    - Status selector (dropdown: idea, todo, in-progress, paused, done)
    - Priority selector (dropdown or number input)
    - Description (textarea, markdown support optional)
    - Tech stack tags (tag input)
    - Repo URL (clickable link)
    - Local path (display only)
    - Recent agent sessions (last 5)
    - Recent memories (last 5)
    - Created/updated timestamps
  - Auto-save on blur or debounced input
  - Loading state while fetching project data

  **Must NOT do**:
  - Do NOT add delete functionality (not in spec)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4)
  - **Blocked By**: T8, T12
  - **Blocks**: T18

  **Acceptance Criteria**:
  - [ ] All fields display correctly
  - [ ] Editable fields update Supabase
  - [ ] Sessions and memories lists render
  - [ ] Repo URL is clickable
  - [ ] Auto-save works

  **QA Scenarios**:
  ```
  Scenario: Edit project name
    Tool: Playwright
    Steps:
      1. Open project detail panel
      2. Edit name field
      3. Blur the field
      4. Refresh page
    Expected: New name persists
    Evidence: .sisyphus/evidence/t17-edit-name.png
  
  Scenario: Display sessions and memories
    Tool: Playwright
    Steps:
      1. Open project with sessions/memories
      2. Check detail panel
    Expected: Lists show recent items
    Evidence: .sisyphus/evidence/t17-sessions-memories.png
  ```

  **Commit**: YES
  - Message: `feature: ProjectDetail panel with edit capabilities`
  - Files: `src/components/detail/ProjectDetail.tsx`

---

- [x] T18. BoardPage integration

  **What to do**:
  - Create `src/pages/BoardPage.tsx`
  - Combines KanbanBoard with any page-specific layout
  - Handles empty state: "No projects yet" + create button
  - Create project button opens DetailPanel in create mode
  - Integrates with router at `/`

  **Must NOT do**:
  - Do NOT add complex filtering (future enhancement)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4)
  - **Blocked By**: T10, T13, T14, T15, T17
  - **Blocks**: T19

  **Acceptance Criteria**:
  - [ ] Page renders at `/`
  - [ ] Shows KanbanBoard
  - [ ] Empty state displays when no projects
  - [ ] Create button works

  **QA Scenarios**:
  ```
  Scenario: Board page loads
    Tool: Playwright
    Steps:
      1. Open http://localhost:5173/
      2. Screenshot full page
    Expected: AppBar, Navbar, KanbanBoard visible
    Evidence: .sisyphus/evidence/t18-board-page.png
  ```

  **Commit**: YES
  - Message: `feature: BoardPage integration`
  - Files: `src/pages/BoardPage.tsx`

---

- [ ] T19. Phase 1 manual QA verification

  **What to do**:
  - Run through full Phase 1 QA checklist:
    - [ ] Vite dev server starts without errors
    - [ ] All 5 kanban columns visible at /board
    - [ ] Projects display in correct columns by board_status
    - [ ] Drag-drop moves cards between columns
    - [ ] Drag-drop updates board_status in Supabase
    - [ ] DetailPanel opens when clicking project card
    - [ ] DetailPanel shows project details
    - [ ] DetailPanel closes with X button
    - [ ] Realtime updates reflect across browser tabs
    - [ ] Refresh persists card positions
    - [ ] AppBar navigation works
    - [ ] Navbar shows correct view title
  - Document any issues found
  - Fix critical issues before proceeding to Phase 2

  **Must NOT do**:
  - Do NOT skip any checklist items

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (Final wave task)
  - **Blocked By**: T14-T18
  - **Blocks**: T20-T26 (Phase 2)

  **Acceptance Criteria**:
  - [ ] All checklist items verified
  - [ ] Evidence screenshots captured
  - [ ] No critical bugs
  - [ ] Ready for Phase 2

  **QA Scenarios**:
  ```
  Scenario: Full Phase 1 QA
    Tool: Playwright + Manual
    Steps:
      1. Run through all checklist items
      2. Capture screenshots
      3. Test drag-drop, realtime, panel interactions
    Expected: All features work as specified
    Evidence: .sisyphus/evidence/t19-phase1-qa/
  ```

  **Commit**: NO (QA task, no code changes)
  - Phase 1 commits already made

---

## Phase 2 Wave 5: Tools Foundation

- [ ] T20. Tools Zustand store + queries

  **What to do**:
  - Create `src/store/tools.ts`
  - CRUD operations:
    - fetchTools()
    - createTool(toolData)
    - updateTool(id, updates)
    - deleteTool(id) (optional, not in spec)
  - Computed values for summary stats:
    - totalMonthlyCost
    - totalAnnualCost
    - activeToolCount
    - renewingWithin30Days
  - Subscribe to tools table changes (realtime)

  **Must NOT do**:
  - Do NOT add complex filtering yet (Phase 2 Wave 6)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 5)
  - **Blocked By**: T8, T9
  - **Blocks**: T21-T26

  **Acceptance Criteria**:
  - [ ] Store fetches tools from Supabase
  - [ ] Computed stats work correctly
  - [ ] Realtime subscription active
  - [ ] CRUD operations update Supabase

  **QA Scenarios**:
  ```
  Scenario: Tools store works
    Tool: Bash
    Steps:
      1. Check store exports
      2. Verify TypeScript types
    Expected: All CRUD methods present
    Evidence: .sisyphus/evidence/t20-tools-store.txt
  ```

  **Commit**: YES
  - Message: `store: Tools Zustand store with CRUD and stats`
  - Files: `src/store/tools.ts`

---

- [ ] T21. ToolCard component

  **What to do**:
  - Create `src/components/tools/ToolCard.tsx`
  - Display per spec:
    - Tool name
    - Category badge: "Using" (green) or "To Check Out" (muted)
    - Cost + billing cycle (`$20/mo`, `$100/yr`)
    - Platform icons (mac, linux, web, ios)
    - Renewal date (+ "in Xd" if within 30 days, highlighted)
    - Notes (1-2 lines, truncated)
    - Tags
  - Click opens detail panel

  **Must NOT do**:
  - Do NOT add drag-drop to tool cards

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 5)
  - **Blocked By**: T3, T20
  - **Blocks**: T22, T23

  **Acceptance Criteria**:
  - [ ] All fields display correctly
  - [ ] Category badges colored correctly
  - [ ] Platform icons show
  - [ ] Renewal highlighting works
  - [ ] Click opens detail panel

  **QA Scenarios**:
  ```
  Scenario: ToolCard renders
    Tool: Playwright
    Steps:
      1. Render a ToolCard with sample data
      2. Screenshot
    Expected: All elements visible, styled correctly
    Evidence: .sisyphus/evidence/t21-toolcard.png
  ```

  **Commit**: YES
  - Message: `feature: ToolCard component`
  - Files: `src/components/tools/ToolCard.tsx`

---

- [x] T22. ToolsGrid component

  **What to do**:
  - Create `src/components/tools/ToolsGrid.tsx`
  - Responsive grid layout (1-3 columns based on viewport)
  - Renders array of ToolCards
  - Handles empty state
  - Optional: Filter bar placeholder (per spec)

  **Must NOT do**:
  - Do NOT implement actual filtering yet

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 5)
  - **Blocked By**: T21
  - **Blocks**: T23

  **Acceptance Criteria**:
  - [ ] Grid responsive (1-3 columns)
  - [ ] Renders all tools
  - [ ] Empty state handled

  **QA Scenarios**:
  ```
  Scenario: Grid responsive
    Tool: Playwright
    Steps:
      1. Open tools view at different viewport sizes
      2. Screenshot at 320px, 768px, 1440px
    Expected: 1 col mobile, 2 col tablet, 3 col desktop
    Evidence: .sisyphus/evidence/t22-grid-responsive.png
  ```

  **Commit**: YES
  - Message: `feature: ToolsGrid responsive layout`
  - Files: `src/components/tools/ToolsGrid.tsx`

---

## Phase 2 Wave 6: Tools Features

- [x] T23. ToolsPage + summary stats

  **What to do**:
  - Create `src/pages/ToolsPage.tsx`
  - Summary row at top:
    - Total monthly cost
    - Total annual cost
    - Active tool count
    - Renewing within 30 days count
  - ToolsGrid below summary
  - + button for creating new tool (opens detail panel)
  - Integrates with router at `/tools`

  **Must NOT do**:
  - Do NOT add complex filtering

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 6)
  - **Blocked By**: T10, T20, T22
  - **Blocks**: T26

  **Acceptance Criteria**:
  - [ ] Page renders at `/tools`
  - [ ] Summary stats calculate correctly
  - [ ] ToolsGrid displays
  - [ ] Create button works

  **QA Scenarios**:
  ```
  Scenario: Tools page loads
    Tool: Playwright
    Steps:
      1. Open http://localhost:5173/tools
      2. Screenshot full page
    Expected: Summary stats, tool cards visible
    Evidence: .sisyphus/evidence/t23-tools-page.png
  
  Scenario: Summary stats correct
    Tool: Playwright
    Steps:
      1. Add tools with known costs
      2. Check summary row
    Expected: Totals match calculations
    Evidence: .sisyphus/evidence/t23-stats.png
  ```

  **Commit**: YES
  - Message: `feature: ToolsPage with summary stats`
  - Files: `src/pages/ToolsPage.tsx`

---

- [x] T24. ToolDetail panel component

  **What to do**:
  - Create `src/components/detail/ToolDetail.tsx`
  - Rendered inside DetailPanel for tools
  - Display and edit all tool fields:
    - Name
    - Category (Using / To Check Out)
    - Cost
    - Billing cycle (monthly, annual, one-time)
    - Renewal date
    - Platform checkboxes (mac, linux, web, ios, android, windows)
    - URL
    - Tags
    - Notes
  - Create mode when no tool selected
  - Auto-save or explicit save button

  **Must NOT do**:
  - Do NOT add delete functionality

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 6)
  - **Blocked By**: T12, T20
  - **Blocks**: T26

  **Acceptance Criteria**:
  - [ ] All fields editable
  - [ ] Create mode works
  - [ ] Edit mode updates Supabase
  - [ ] Platform multi-select works

  **QA Scenarios**:
  ```
  Scenario: Create new tool
    Tool: Playwright
    Steps:
      1. Click + button on Tools page
      2. Fill form
      3. Save
      4. Check grid
    Expected: New tool appears
    Evidence: .sisyphus/evidence/t24-create-tool.png
  ```

  **Commit**: YES
  - Message: `feature: ToolDetail panel with create/edit`
  - Files: `src/components/detail/ToolDetail.tsx`

---

- [ ] T25. Tools data seeding

  **What to do**:
  - Create manual seed script or SQL for migrating ai-dashboard data
  - Document the migration process
  - User manually runs this to populate tools table
  - Alternative: Provide UI for bulk import

  **Must NOT do**:
  - Do NOT auto-run on app startup

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 6)
  - **Blocked By**: T20
  - **Blocks**: T26 (optional)

  **Acceptance Criteria**:
  - [ ] Seed script or SQL documented
  - [ ] Can populate tools table with existing data

  **QA Scenarios**:
  ```
  Scenario: Seeding works
    Tool: Bash
    Steps:
      1. Run seed script
      2. Check tools table in Supabase
    Expected: Tools populated
    Evidence: .sisyphus/evidence/t25-seeding.txt
  ```

  **Commit**: YES
  - Message: `data: Tools seeding script`
  - Files: `scripts/seed-tools.sql` or similar

---

- [ ] T26. Phase 2 manual QA verification

  **What to do**:
  - Run through Phase 2 QA checklist:
    - [ ] Tools view loads at /tools
    - [ ] All tools from seed display
    - [ ] Tool cards show name, cost, subscription status
    - [ ] Tool detail panel shows full metadata
    - [ ] Creating tool works
    - [ ] Editing tool works
    - [ ] Summary stats calculate correctly
    - [ ] Platform icons display correctly
    - [ ] Renewal date highlighting works
  - Document issues
  - Fix critical issues before Phase 3

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: T21-T25
  - **Blocks**: T27-T32 (Phase 3)

  **Acceptance Criteria**:
  - [ ] All checklist items verified
  - [ ] Evidence captured
  - [ ] Ready for Phase 3

  **QA Scenarios**:
  ```
  Scenario: Full Phase 2 QA
    Tool: Playwright
    Steps:
      1. Test all Tools features
      2. Capture screenshots
    Expected: All features work
    Evidence: .sisyphus/evidence/t26-phase2-qa/
  ```

  **Commit**: NO

---

## Phase 3 Wave 7: Agents

- [x] T27. Sessions Zustand store (read-only)

  **What to do**:
  - Create `src/store/sessions.ts`
  - Fetch agent_sessions from Supabase
  - Join with projects to get project names
  - Filter/sort options:
    - By interface (claude-code, pi, claude.ai, etc.)
    - By machine (midgard, mini-ygg, etc.)
    - By project
    - By date range
  - No write operations (read-only per spec)

  **Must NOT do**:
  - Do NOT add create/update/delete for sessions

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 7)
  - **Blocked By**: T8, T9
  - **Blocks**: T28-T30

  **Acceptance Criteria**:
  - [ ] Store fetches sessions
  - [ ] Filters work correctly
  - [ ] Joins with projects table

  **QA Scenarios**:
  ```
  Scenario: Sessions store
    Tool: Bash
    Steps:
      1. Check store exports
      2. Verify TypeScript
    Expected: fetch, filter methods present
    Evidence: .sisyphus/evidence/t27-sessions-store.txt
  ```

  **Commit**: YES
  - Message: `store: Sessions Zustand store (read-only)`
  - Files: `src/store/sessions.ts`

---

- [x] T28. SessionCard component

  **What to do**:
  - Create `src/components/agents/SessionCard.tsx`
  - Display per spec:
    - Interface badge (claude-code, pi, claude.ai, etc.)
    - Machine badge (midgard, mini-ygg, etc.)
    - Summary text
    - Duration (started_at → ended_at)
    - Project link (if project_id set)
    - Memories created count
  - Clicking project link navigates to Board view

  **Must NOT do**:
  - Do NOT add click to expand (not in spec)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 7)
  - **Blocked By**: T3, T27
  - **Blocks**: T29

  **Acceptance Criteria**:
  - [ ] All fields display
  - [ ] Badges styled correctly
  - [ ] Duration calculated correctly
  - [ ] Project link works

  **QA Scenarios**:
  ```
  Scenario: SessionCard renders
    Tool: Playwright
    Steps:
      1. Render with sample session data
      2. Screenshot
    Expected: All elements visible
    Evidence: .sisyphus/evidence/t28-sessioncard.png
  ```

  **Commit**: YES
  - Message: `feature: SessionCard component`
  - Files: `src/components/agents/SessionCard.tsx`

---

- [x] T29. SessionFeed component

  **What to do**:
  - Create `src/components/agents/SessionFeed.tsx`
  - Vertical timeline layout
  - Most recent first
  - Grouped by date (Today, Yesterday, April 10, etc.)
  - Renders SessionCards
  - Filter controls (interface, machine, project, date range)

  **Must NOT do**:
  - Do NOT add infinite scroll (not in spec)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 7)
  - **Blocked By**: T28
  - **Blocks**: T30

  **Acceptance Criteria**:
  - [ ] Timeline layout
  - [ ] Date grouping
  - [ ] Filter controls work
  - [ ] Shows all sessions

  **QA Scenarios**:
  ```
  Scenario: Feed with date grouping
    Tool: Playwright
    Steps:
      1. Load sessions spanning multiple days
      2. Screenshot feed
    Expected: Grouped by date headers
    Evidence: .sisyphus/evidence/t29-feed.png
  ```

  **Commit**: YES
  - Message: `feature: SessionFeed with date grouping and filters`
  - Files: `src/components/agents/SessionFeed.tsx`

---

- [x] T30. AgentsPage integration

  **What to do**:
  - Create `src/pages/AgentsPage.tsx`
  - Combines SessionFeed with filters
  - Integrates with router at `/agents`
  - Handles empty state

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 7)
  - **Blocked By**: T10, T29
  - **Blocks**: T32

  **Acceptance Criteria**:
  - [ ] Page renders at `/agents`
  - [ ] SessionFeed displays
  - [ ] Filters work

  **QA Scenarios**:
  ```
  Scenario: Agents page loads
    Tool: Playwright
    Steps:
      1. Open http://localhost:5173/agents
      2. Screenshot
    Expected: Feed visible, filters present
    Evidence: .sisyphus/evidence/t30-agents-page.png
  ```

  **Commit**: YES
  - Message: `feature: AgentsPage integration`
  - Files: `src/pages/AgentsPage.tsx`

---

## Phase 3 Wave 8: Settings + Final

- [x] T31. SettingsPage (read-only)

  **What to do**:
  - Create `src/pages/SettingsPage.tsx`
  - Per spec MVP:
    - Supabase connection status (green/red indicator)
    - Theme toggle (dark/light)
    - Future placeholder: Herstel palette picker
  - Read-only, no persistence

  **Must NOT do**:
  - Do NOT add settings persistence (not in spec)
  - Do NOT add palette picker (future phase)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 8)
  - **Blocked By**: T9
  - **Blocks**: T33

  **Acceptance Criteria**:
  - [ ] Page renders at `/settings`
  - [ ] Connection status shows
  - [ ] Theme toggle works (updates UI store)

  **QA Scenarios**:
  ```
  Scenario: Settings page
    Tool: Playwright
    Steps:
      1. Open http://localhost:5173/settings
      2. Screenshot
      3. Toggle theme
    Expected: Status indicator, theme toggle works
    Evidence: .sisyphus/evidence/t31-settings.png
  ```

  **Commit**: YES
  - Message: `feature: SettingsPage (read-only)`
  - Files: `src/pages/SettingsPage.tsx`

---

- [x] T32. Phase 3 manual QA verification

  **What to do**:
  - Run through Phase 3 QA checklist:
    - [ ] Agents view shows recent sessions
    - [ ] Session cards show summary, timestamp, interface
    - [ ] Project cross-linking works (click → Board view)
    - [ ] Filters work (interface, machine, project)
    - [ ] Settings view displays configuration
    - [ ] Theme toggle works
  - Document issues

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: T27-T31
  - **Blocks**: T33

  **Acceptance Criteria**:
  - [ ] All checklist items verified
  - [ ] Evidence captured
  - [ ] Ready for final integration QA

  **QA Scenarios**:
  ```
  Scenario: Full Phase 3 QA
    Tool: Playwright
    Steps:
      1. Test Agents features
      2. Test Settings
      3. Capture screenshots
    Expected: All features work
    Evidence: .sisyphus/evidence/t32-phase3-qa/
  ```

  **Commit**: NO

---

- [x] T33. Final cross-phase integration QA

  **What to do**:
  - Test interactions between phases:
    - [ ] Board → click project → detail panel → recent sessions show
    - [ ] Agents → click project link → navigate to Board with that project selected
    - [ ] Create tool → appears in Tools grid immediately
    - [ ] Drag project → updates in real-time
    - [ ] Edit project → changes persist across views
  - Full end-to-end flow testing
  - Browser console error check
  - Performance check (no obvious lag)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: T19, T26, T32
  - **Blocks**: F1-F4

  **Acceptance Criteria**:
  - [ ] Cross-phase interactions work
  - [ ] No console errors
  - [ ] Realtime sync verified
  - [ ] All 3 phases integrated

  **QA Scenarios**:
  ```
  Scenario: Cross-phase integration
    Tool: Playwright
    Steps:
      1. Full user journey: Board → Agents → Settings → Tools
      2. Test all interactions
      3. Check console for errors
    Expected: Smooth transitions, no errors
    Evidence: .sisyphus/evidence/t33-integration/
  ```

  **Commit**: NO

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | Evidence [N files] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  
  Run `tsc --noEmit` + check for obvious issues. Review all src files for: `as any` casts, empty catch blocks, console.log in production paths, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  
  Output: `Build [PASS/FAIL] | Issues [N] | AI Slop [N] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-phase integration. Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  
  For each task: read "What to do", read actual implementation. Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance. Detect cross-task contamination.
  
  Output: `Tasks [N/N compliant] | Scope Creep [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

- **Per-task commits** with conventional commit prefixes:
  - `init:` — Project scaffolding
  - `config:` — Configuration, env vars, types
  - `db:` — Database migrations (in personal-mcp repo)
  - `store:` — Zustand stores
  - `ui:` — Layout components
  - `feature:` — Functional features
  - `data:` — Seeding, data migration
  - `chore:` — Setup, structure

---

## Success Criteria

### Verification Commands
```bash
# All phases complete
npm run dev
# Open http://localhost:5173
# Verify: Board loads, drag-drop works, Tools grid shows, Agents feed displays

# Type checking
npx tsc --noEmit
# Expected: No errors
```

### Final Checklist
- [ ] Phase 1: Board + Shell complete and QA'd
- [ ] Phase 2: Tools complete and QA'd
- [ ] Phase 3: Agents + Settings complete and QA'd
- [ ] Cross-phase integration verified
- [ ] No console errors
- [ ] Realtime sync working
- [ ] All "Must NOT Have" items absent from codebase
- [ ] F1-F4 verification tasks complete
- [ ] User explicit "okay" obtained