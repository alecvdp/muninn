import { useEffect } from 'react';
import { Plus, MagnifyingGlass } from '@phosphor-icons/react';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { useProjectsStore } from '../store/projects';
import { useUIStore } from '../store/ui';

const priorities = [1, 2, 3, 4, 5];

export default function BoardPage() {
  const { projects, fetchProjects, subscribeToProjects, isLoading, selectProject, searchQuery, setSearchQuery, filterPriority, setFilterPriority } = useProjectsStore();
  const openPanel = useUIStore((s) => s.openPanel);

  useEffect(() => {
    void fetchProjects();
    const cleanup = subscribeToProjects();
    return cleanup;
  }, [fetchProjects, subscribeToProjects]);

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
        <h2 className="text-normal font-medium">Projects</h2>
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
      ) : (
        <KanbanBoard />
      )}
    </div>
  );
}
