import { useEffect } from 'react';
import { Plus, MagnifyingGlass, Archive, List, Kanban } from '@phosphor-icons/react';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { ProjectList } from '../components/board/ProjectList';
import { useProjectsStore } from '../store/projects';
import { useUIStore } from '../store/ui';

const priorities = [1, 2, 3, 4, 5];

export default function BoardPage() {
  const { projects, fetchProjects, fetchProjectCounts, subscribeToProjects, isLoading, selectProject, searchQuery, setSearchQuery, filterPriority, setFilterPriority, showArchived, setShowArchived } = useProjectsStore();
  const openPanel = useUIStore((s) => s.openPanel);
  const projectsViewMode = useUIStore((s) => s.projectsViewMode);
  const setProjectsViewMode = useUIStore((s) => s.setProjectsViewMode);

  useEffect(() => {
    void fetchProjects();
    void fetchProjectCounts();
    const cleanup = subscribeToProjects();
    return cleanup;
  }, [fetchProjects, fetchProjectCounts, subscribeToProjects]);

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-low">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-normal font-medium">Projects</h2>
          <div
            role="group"
            aria-label="View mode"
            className="flex items-center bg-muted border border-border rounded-lg p-0.5"
          >
            <button
              type="button"
              onClick={() => setProjectsViewMode('list')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors ${
                projectsViewMode === 'list'
                  ? 'bg-elevated text-normal'
                  : 'text-low hover:text-normal'
              }`}
              aria-pressed={projectsViewMode === 'list'}
              title="List view"
            >
              <List size={14} />
              List
            </button>
            <button
              type="button"
              onClick={() => setProjectsViewMode('kanban')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors ${
                projectsViewMode === 'kanban'
                  ? 'bg-elevated text-normal'
                  : 'text-low hover:text-normal'
              }`}
              aria-pressed={projectsViewMode === 'kanban'}
              title="Kanban view"
            >
              <Kanban size={14} />
              Kanban
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-low" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted border border-border rounded-lg pl-8 pr-3 py-1 text-xs text-normal placeholder:text-low focus:outline-none focus:ring-1 focus:ring-brand w-48"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-low text-xs">Priority:</label>
            <select
              value={filterPriority ?? ''}
              onChange={(e) => setFilterPriority(e.target.value ? Number(e.target.value) : null)}
              className="bg-muted border border-border rounded-lg px-3 py-1 text-xs text-normal focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">All</option>
              {priorities.map((p) => (
                <option key={p} value={p}>P{p}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs transition-colors ${
              showArchived
                ? 'border-brand text-brand bg-brand/10'
                : 'border-border text-low hover:text-normal'
            }`}
            title={showArchived ? 'Hide archived projects' : 'Show archived projects'}
          >
            <Archive size={14} />
            Archived
          </button>
          <button
            onClick={() => { selectProject('new'); openPanel(); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand text-white rounded-lg text-sm hover:bg-brand-hover transition-colors"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-low mb-2">No projects yet</div>
            <button
              onClick={() => { selectProject('new'); openPanel(); }}
              className="text-brand hover:underline text-sm"
            >
              Create your first project
            </button>
          </div>
        </div>
      ) : projectsViewMode === 'kanban' ? (
        <KanbanBoard />
      ) : (
        <ProjectList />
      )}
    </div>
  );
}
