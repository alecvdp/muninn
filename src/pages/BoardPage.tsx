import { useEffect } from 'react';
import { Plus } from '@phosphor-icons/react';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { useProjectsStore } from '../store/projects';
import { useUIStore } from '../store/ui';

export default function BoardPage() {
  const { projects, fetchProjects, subscribeToProjects, isLoading, selectProject } = useProjectsStore();
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
        <button
          onClick={() => { selectProject('new'); openPanel(); }}
          className="flex items-center gap-2 px-3 py-1.5 bg-brand text-white rounded-lg text-sm hover:bg-brand-hover transition-colors"
        >
          <Plus size={16} />
          New Project
        </button>
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
