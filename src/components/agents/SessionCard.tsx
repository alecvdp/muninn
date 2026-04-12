import { useUIStore } from '../../store/ui';
import type { Database } from '../../database.types';
import { DesktopIcon } from '@phosphor-icons/react/dist/csr/Desktop';
import { ClockIcon } from '@phosphor-icons/react/dist/csr/Clock';

type SessionRow = Database['public']['Tables']['agent_sessions']['Row'];

interface SessionCardProps {
  session: SessionRow;
}

export function SessionCard({ session }: SessionCardProps) {
  const { setView, selectProject } = useUIStore();

  const formatDuration = (): string => {
    if (!session.started_at || !session.ended_at) return '—';
    const start = new Date(session.started_at);
    const end = new Date(session.ended_at);
    const mins = Math.round((end.getTime() - start.getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const handleProjectClick = () => {
    if (session.project_id) {
      selectProject(session.project_id);
      setView('board');
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 bg-muted rounded text-low">
            {session.interface}
          </span>
          {session.machine && (
            <span className="text-xs px-2 py-0.5 bg-muted rounded text-low flex items-center gap-1">
              <DesktopIcon size={10} />
              {session.machine}
            </span>
          )}
        </div>
        <span className="text-low text-xs flex items-center gap-1">
          <ClockIcon size={12} />
          {formatDuration()}
        </span>
      </div>

      <p className="text-normal text-sm mb-2">{session.summary || 'No summary'}</p>

      <div className="flex items-center justify-between text-xs">
        {session.project_id ? (
          <button
            onClick={handleProjectClick}
            className="text-brand hover:underline"
          >
            View Project →
          </button>
        ) : (
          <span className="text-low">No project</span>
        )}
        {session.memories_created !== null && session.memories_created > 0 && (
          <span className="text-low">
            {session.memories_created} memory{session.memories_created !== 1 ? 'ies' : 'y'}
          </span>
        )}
      </div>
    </div>
  );
}
