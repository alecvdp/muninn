import { useEffect } from 'react';
import { Archive, Brain, Lightning, WarningCircle, FolderOpen } from '@phosphor-icons/react';
import { useProjectsStore } from '../../store/projects';
import { useUIStore } from '../../store/ui';
import type { ProjectRow } from '../../types';

const STALE_PROJECT_DAYS = 60;

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  idea: 'Idea',
  paused: 'Paused',
  archived: 'Archived',
  todo: 'Todo',
  'in-progress': 'In Progress',
  done: 'Done',
};

const STATUS_DOT: Record<string, string> = {
  active: 'bg-success',
  idea: 'bg-status-idea',
  paused: 'bg-status-paused',
  archived: 'bg-low',
  todo: 'bg-status-todo',
  'in-progress': 'bg-status-in-progress',
  done: 'bg-status-done',
};

function formatRelative(iso: string | null): string {
  if (!iso) return 'never';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

function isStale(project: ProjectRow): boolean {
  if (project.archived_at) return false;
  if (project.status !== 'active') return false;
  const t = project.updated_at ? new Date(project.updated_at).getTime() : 0;
  return Date.now() - t > STALE_PROJECT_DAYS * 24 * 60 * 60 * 1000;
}

export function ProjectList() {
  const {
    filteredProjects,
    fetchProjectCounts,
    projectCounts,
    selectProject,
    selectedProjectId,
  } = useProjectsStore();
  const openPanel = useUIStore((s) => s.openPanel);

  useEffect(() => {
    void fetchProjectCounts();
  }, [fetchProjectCounts]);

  const projects = filteredProjects();

  if (projects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-low">
          <FolderOpen size={32} />
          <span className="text-sm">No projects match the current filters</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-surface z-10">
          <tr className="text-left text-low text-xs uppercase tracking-wide">
            <th className="font-medium px-4 py-2">Name</th>
            <th className="font-medium px-3 py-2 w-32">Status</th>
            <th className="font-medium px-3 py-2 w-16 text-right" title="Priority">Pri</th>
            <th className="font-medium px-3 py-2 w-20 text-right" title="Linked memories">
              <span className="inline-flex items-center gap-1 justify-end">
                <Brain size={12} /> Mem
              </span>
            </th>
            <th className="font-medium px-3 py-2 w-20 text-right" title="Linked sessions">
              <span className="inline-flex items-center gap-1 justify-end">
                <Lightning size={12} /> Sess
              </span>
            </th>
            <th className="font-medium px-3 py-2 w-32">Last touched</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => {
            const counts = projectCounts[p.id] ?? { sessions: 0, memories: 0 };
            const stale = isStale(p);
            const isArchived = !!p.archived_at;
            const isSelected = selectedProjectId === p.id;
            const displayStatus = isArchived
              ? 'archived'
              : (p.status ?? 'active');

            return (
              <tr
                key={p.id}
                onClick={() => {
                  selectProject(p.id);
                  openPanel();
                }}
                className={`border-t border-border cursor-pointer transition-colors hover:bg-muted ${
                  isSelected ? 'bg-muted' : ''
                } ${isArchived ? 'opacity-60' : ''}`}
              >
                <td className="px-4 py-2.5 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {isArchived && <Archive size={12} className="text-low shrink-0" />}
                    <span className="text-normal font-medium truncate">{p.name}</span>
                    {stale && (
                      <span
                        title="Not updated in 60+ days"
                        className="text-warning shrink-0"
                      >
                        <WarningCircle size={12} weight="fill" />
                      </span>
                    )}
                  </div>
                  {p.description && (
                    <div className="text-low text-xs truncate mt-0.5">
                      {p.description}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs text-low">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        STATUS_DOT[displayStatus] ?? 'bg-low'
                      }`}
                    />
                    {STATUS_LABEL[displayStatus] ?? displayStatus}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-low text-xs">
                  {p.priority != null ? `P${p.priority}` : '—'}
                </td>
                <td className="px-3 py-2.5 text-right text-low text-xs font-mono">
                  {counts.memories || '—'}
                </td>
                <td className="px-3 py-2.5 text-right text-low text-xs font-mono">
                  {counts.sessions || '—'}
                </td>
                <td className="px-3 py-2.5 text-low text-xs">
                  {formatRelative(p.updated_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
