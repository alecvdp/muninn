# Muninn 🐦‍⬛

> A personal project workbench for solo vibe coders. Kanban board for projects, AI tool tracking, agent session history — all backed by Firmament (Supabase). Named for Odin's raven of memory.

![Muninn Screenshot](https://via.placeholder.com/800x450/1a1a1a/ffffff?text=Muninn+Screenshot)

## ✨ Features

### 📋 Board View — Project Kanban
- **5-column kanban board**: Idea → Todo → In-Progress → Paused → Done
- **Drag & drop**: Reorder projects within columns and move between status columns
- **Project cards**: Show name, description, tech stack, priority
- **Detail panel**: Full project editing with inline fields
- **Realtime sync**: Changes sync across browser tabs instantly
- **Cross-references**: See recent agent sessions and memories per project

### 🛠️ Tools View — AI Subscriptions
- **Cost tracking**: Monitor monthly and annual AI tool expenses
- **Renewal alerts**: Highlights tools renewing within 30 days
- **Platform badges**: Visual indicators for mac, linux, web, ios, android
- **Categories**: "Using" vs "To Check Out" classification
- **Summary stats**: Total costs, active count, renewal warnings

### ⚡ Agents View — Session History
- **Timeline feed**: Chronological agent session history
- **Date grouping**: Sessions grouped by day
- **Filterable**: Filter by interface (claude-code, claude.ai, etc.) and machine
- **Project linking**: Click through to associated projects
- **Session details**: Duration, memory count, summary

### ⚙️ Settings View
- **Connection status**: Supabase/Firmament connectivity indicator
- **Theme toggle**: Dark/light mode switch
- **Read-only configuration**: View current setup

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Muninn (React + Vite + Tailwind + Zustand + Supabase)     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ AppBar   │  │   Main Content   │  │  Detail Panel    │  │
│  │ (48px)   │  │                  │  │  (resizable)     │  │
│  │          │  │  • Board         │  │                  │  │
│  │ 📋 Board │  │  • Tools         │  │  • Project edit  │  │
│  │ 🤖 Tools │  │  • Agents        │  │  • Tool edit     │  │
│  │ ⚡ Agents│  │  • Settings      │  │  • Create forms  │  │
│  │ ⚙️ Settings│  │                  │  │                  │  │
│  └──────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Firmament (Supabase) — Your Personal Knowledge Base        │
├─────────────────────────────────────────────────────────────┤
│  • projects (kanban status, board_position)                │
│  • tools (AI subscriptions, costs, renewals)               │
│  • agent_sessions (session history, summaries)             │
│  • memories (insights, observations)                       │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** or **pnpm**
- **Supabase account** (for Firmament backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/muninn.git
   cd muninn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example env file and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Set up database migrations** (in your Firmament/personal-mcp repo)
   
   The following migrations need to be applied to your Supabase project:
   
   ```sql
   -- Add board columns to projects table
   alter table projects
     add column if not exists board_status text default 'idea',
     add column if not exists board_position integer default 0;
   
   -- Create tools table
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
   
   -- Enable realtime
   alter publication supabase_realtime add table projects;
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   
   Navigate to `http://localhost:5173`

## 📖 Usage Guide

### Board View — Managing Projects

**Adding a Project:**
1. Click the "+" button in any column header, or
2. Click "New Project" in the empty state
3. Fill in project details in the side panel
4. Click save — the project appears in the selected column

**Moving Projects:**
- **Drag & drop** cards between columns to change status
- **Reorder** within columns by dragging to new positions
- Changes sync automatically to Supabase

**Editing Projects:**
1. Click any project card to open the detail panel
2. Edit fields inline:
   - **Name**: Click to edit, blur to save
   - **Status**: Dropdown selector
   - **Priority**: Number input (0-5)
   - **Description**: Textarea with auto-save
   - **Tech Stack**: Comma-separated tags
3. View related sessions and memories at the bottom

### Tools View — Tracking AI Subscriptions

**Adding a Tool:**
1. Click "Add Tool" button in the top-right
2. Fill in the form:
   - **Name**: Tool name (e.g., "Claude Pro")
   - **Category**: "Using" (green) or "To Check Out" (gray)
   - **Cost**: Monthly/annual amount
   - **Billing Cycle**: monthly, annual, or one-time
   - **Renewal Date**: For renewal alerts
   - **Platforms**: Check all that apply
   - **URL**: Tool website
   - **Tags**: Categories, use cases
   - **Notes**: Additional details

**Understanding the Summary Stats:**
- **Monthly Cost**: Sum of all monthly subscriptions
- **Annual Cost**: Sum of all annual subscriptions
- **Active Tools**: Count of tools marked "Using"
- **Renewing Soon**: Count renewing within 30 days (highlighted in orange)

### Agents View — Reviewing Session History

**Browsing Sessions:**
- Sessions are grouped by date (Today, Yesterday, specific dates)
- Each card shows:
  - **Interface**: claude-code, claude.ai, pi, etc.
  - **Machine**: Which computer the session ran on
  - **Duration**: How long the session lasted
  - **Summary**: AI-generated session summary
  - **Memory Count**: Number of memories created

**Filtering:**
- Use the dropdown filters at the top:
  - **Interface**: Show only sessions from specific interfaces
  - **Machine**: Filter by computer (mini-ygg, midgard, etc.)

**Project Cross-Linking:**
- Click "View Project →" on any session with a project to jump to that project in the Board view

### Navigation Tips

**Keyboard Shortcuts:**
- `Escape`: Close detail panel
- Navigation via sidebar icons

**Resizable Panels:**
- Drag the divider between main content and detail panel
- Panel remembers size between sessions (min: 360px, max: 600px)

**Theme Toggle:**
- Click the sun/moon icon in the Navbar to switch themes
- Dark mode is default (easy on the eyes for long coding sessions)

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

### Project Structure

```
muninn/
├── src/
│   ├── components/
│   │   ├── board/          # Kanban components
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   └── ProjectCard.tsx
│   │   ├── tools/          # Tools grid components
│   │   │   ├── ToolsGrid.tsx
│   │   │   └── ToolCard.tsx
│   │   ├── agents/         # Session feed components
│   │   │   ├── SessionFeed.tsx
│   │   │   └── SessionCard.tsx
│   │   ├── detail/         # Detail panel components
│   │   │   ├── ProjectDetail.tsx
│   │   │   └── ToolDetail.tsx
│   │   └── layout/         # App shell components
│   │       ├── AppBar.tsx
│   │       ├── Navbar.tsx
│   │       └── DetailPanel.tsx
│   ├── pages/              # Route pages
│   │   ├── BoardPage.tsx
│   │   ├── ToolsPage.tsx
│   │   ├── AgentsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── store/              # Zustand stores
│   │   ├── projects.ts
│   │   ├── tools.ts
│   │   ├── sessions.ts
│   │   └── ui.ts
│   ├── lib/                # Utilities
│   │   └── supabase.ts
│   ├── database.types.ts   # Supabase types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env                    # Environment variables
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

### Key Technologies

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **Zustand** | State management |
| **Supabase** | Backend and realtime sync |
| **@hello-pangea/dnd** | Drag and drop |
| **react-resizable-panels** | Resizable panels |
| **Phosphor Icons** | Icon system |
| **IBM Plex fonts** | Typography |

### Customization

**Styling:**
- Colors are defined as CSS variables in `src/index.css`
- Uses HSL format for easy theming
- Dark mode is default; light mode available via toggle

**Adding New Columns:**
Currently uses fixed 5-column kanban. To modify:
1. Edit `boardColumns` in `src/store/projects.ts`
2. Update column colors in `src/components/board/KanbanColumn.tsx`
3. Add column header in `src/components/board/KanbanBoard.tsx`

## 🔄 Realtime Sync

Muninn uses Supabase Realtime for instant synchronization:
- **Projects**: Changes to kanban status or position sync immediately
- **Tools**: New tools, edits, and deletions sync across tabs
- **Sessions**: New agent sessions appear automatically

This means you can have Muninn open on multiple machines, and changes made on one will instantly appear on the others.

## 🚢 Deployment

### Static Hosting (Recommended)

Build the app:
```bash
npm run build
```

Deploy the `dist/` folder to:
- **Cloudflare Pages**
- **Vercel**
- **Netlify**
- **GitHub Pages**
- Any static hosting service

### Environment Variables for Production

Make sure to set these environment variables in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🐛 Troubleshooting

**Build fails with TypeScript errors:**
```bash
npm run build
```
Check that all dependencies are installed: `npm install`

**Supabase connection errors:**
- Verify `.env` variables are correct
- Check that database migrations have been applied
- Ensure RLS policies allow anonymous access (for tools table)

**Realtime not working:**
- Check browser console for WebSocket errors
- Verify `supabase_realtime` publication includes `projects` table
- Some ad blockers block WebSocket connections

**Drag and drop not working:**
- Ensure `@hello-pangea/dnd` is installed
- Check for React version compatibility issues
- Verify `react StrictMode` is configured correctly

## 📝 Tips for Solo Vibe Coding

1. **Keep it lightweight**: Muninn is intentionally minimal — no auth, no complex permissions, just you and your data

2. **Use the board for prioritization**: Drag projects to "In Progress" when actively working, "Paused" when context-switching

3. **Track AI costs**: The Tools view helps you stay aware of monthly AI spending — easy to lose track with multiple subscriptions

4. **Review agent sessions**: Check Agents view weekly to see patterns in your AI-assisted work

5. **Leverage realtime**: Keep Muninn open on your main machine; changes from other devices sync instantly

6. **Project notes**: Use the description field for context — links, decisions, next steps

7. **Tag consistently**: Tech stack tags help you see patterns in what you're building

## 🤝 Integration with Firmament

Muninn is designed to work with your existing Firmament (personal-mcp) setup:
- Reads from your existing `projects`, `agent_sessions`, and `memories` tables
- Adds a new `tools` table for AI subscription tracking
- Uses the same Supabase client configuration
- Respects your existing data — no migrations that delete data

## 📄 License

MIT — Built for personal use, but feel free to adapt for your own solo workflow.

---

> *"Muninn and Huginn fly each day over the spacious earth. I fear for Huginn, that he come not back, yet more anxious am I for Muninn."* — Odin

Built with ⚡ for solo builders who ship.
