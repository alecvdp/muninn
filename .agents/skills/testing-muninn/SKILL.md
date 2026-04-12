# Testing Muninn

## Prerequisites

### Devin Secrets Needed
- `VITE_SUPABASE_URL` — Supabase project URL (e.g. `https://xxx.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous/public API key

These must be written to a `.env` file in the repo root before starting the dev server.

## Setup

```bash
# Write .env (values from secrets)
echo "VITE_SUPABASE_URL=$VITE_SUPABASE_URL" > .env
echo "VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY" >> .env

# Start dev server
npm run dev
# App runs at http://localhost:5173
```

The app will throw a descriptive error on startup if the env vars are missing.
If the Supabase key is invalid/expired, the app will load but all API calls will fail with "Invalid API key" — the ErrorToast component will surface this.

## Chrome Setup

Chrome must be launched with CDP on port 29229 for the `google-chrome` wrapper to work:

```bash
/opt/.devin/chrome/chrome/linux-137.0.7118.2/chrome-linux64/chrome \
  --remote-debugging-port=29229 \
  --no-first-run \
  --disable-session-crashed-bubble \
  --no-default-browser-check \
  --user-data-dir=/tmp/chrome-profile \
  http://localhost:5173/ &disown
```

The Chrome binary path might change — check `/opt/.devin/chrome/` for available versions if the above path doesn't exist.

## UI Navigation

### Sidebar (left)
The sidebar has 4 icon buttons (top to bottom):
1. **Board** (kanban icon) → `/` — Kanban board with 5 columns (Idea, Todo, In-Progress, Paused, Done)
2. **Tools** (grid icon) → `/tools` — AI tools dashboard with cost tracking
3. **Agents** (lightning icon) → `/agents` — Agent session feed
4. **Settings** (gear icon) → `/settings` — Theme toggle + Supabase connection status

### Key UI Flows

**Create Project:**
- Click "+ New Project" button (top-right on Board page)
- Panel opens on right with form: Name, Status (dropdown), Priority (0-5), Description, Tech Stack (comma-separated)
- "Create Project" button is disabled when name is empty

**View/Edit Project:**
- Click any project card on the Kanban board
- Detail panel opens with project data
- Fields auto-save on change (priority is debounced 600ms)

**Delete Project/Tool:**
- Open detail panel for a project or tool
- Scroll to bottom → click red "Delete" button → confirm in dialog

**Theme Toggle:**
- Go to Settings → click moon/sun icon button
- Theme persists across page refresh via localStorage (`muninn-ui` key)

**Panel Close:**
- Click X button in panel header, or press Escape
- Both methods clear selection state (no stale data on re-open)

## What to Test

### Requires valid Supabase credentials
- Project CRUD (create, read in detail panel, update fields, delete)
- Tool CRUD
- Drag-and-drop between Kanban columns
- Settings connection check (should show green dot + "Supabase Connected")

### Testable without Supabase
- Create form UI rendering and field validation
- Panel open/close mechanics (X button + Escape)
- Theme toggle + localStorage persistence
- Navigation between all 4 pages
- ErrorToast component (will show API errors)
- Settings page layout and connection check error state

## Known Gotchas
- The `google-chrome` wrapper script at `~/.local/bin/google-chrome` uses CDP on port 29229. If Chrome isn't already running with CDP, the wrapper will fail with "Connection refused". You need to manually launch Chrome with `--remote-debugging-port=29229`.
- The Supabase anon key might be expired or rotated — if you see "Invalid API key" errors, ask the user for a fresh key.
- There is no automated test suite in this project — all testing is manual UI testing.
- The app uses Zustand devtools — you can inspect state in browser devtools if needed.
