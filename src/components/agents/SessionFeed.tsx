import { SessionCard } from './SessionCard';
import { useSessionsStore } from '../../store/sessions';

export function SessionFeed() {
  const { sessions, isLoading, isFetchingMore, hasMore, fetchMoreSessions } = useSessionsStore();

  const grouped = sessions.reduce((acc, session) => {
    const date = session.started_at
      ? new Date(session.started_at).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })
      : 'Unknown';
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {} as Record<string, typeof sessions>);

  if (isLoading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-low">Loading sessions...</div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-low mb-2">No sessions yet</div>
          <div className="text-low text-sm">Agent activity will appear here</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {Object.entries(grouped).map(([date, dateSessions]) => (
        <div key={date}>
          <h3 className="text-low text-sm font-medium mb-3 sticky top-0 bg-surface py-2">
            {date}
          </h3>
          <div className="space-y-3">
            {dateSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="flex justify-center py-4">
          <button
            onClick={() => void fetchMoreSessions()}
            disabled={isFetchingMore}
            className="px-4 py-2 text-sm rounded-lg border border-border text-low hover:text-normal hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
