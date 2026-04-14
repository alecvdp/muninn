import { useEffect } from 'react';
import { SessionFeed } from '../components/agents/SessionFeed';
import { useSessionsStore } from '../store/sessions';

export default function AgentsPage() {
  const {
    fetchSessions,
    fetchFilterOptions,
    availableInterfaces,
    availableMachines,
    filterInterface,
    filterMachine,
    setFilterInterface,
    setFilterMachine,
  } = useSessionsStore();

  useEffect(() => {
    void fetchSessions();
    void fetchFilterOptions();
  }, [fetchSessions, fetchFilterOptions]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <label className="text-low text-xs">Interface:</label>
          <select
            value={filterInterface || ''}
            onChange={(e) => setFilterInterface(e.target.value || null)}
            className="bg-muted border border-border rounded-lg px-3 py-1 text-xs text-normal focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="">All</option>
            {availableInterfaces.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-low text-xs">Machine:</label>
          <select
            value={filterMachine || ''}
            onChange={(e) => setFilterMachine(e.target.value || null)}
            className="bg-muted border border-border rounded-lg px-3 py-1 text-xs text-normal focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="">All</option>
            {availableMachines.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <SessionFeed />
      </div>
    </div>
  );
}
