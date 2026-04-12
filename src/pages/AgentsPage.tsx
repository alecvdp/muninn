import { useEffect } from 'react';
import { SessionFeed } from '../components/agents/SessionFeed';
import { useSessionsStore } from '../store/sessions';

export default function AgentsPage() {
  const { fetchSessions, sessions, filterInterface, filterMachine, setFilterInterface, setFilterMachine } = useSessionsStore();

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const interfaces: string[] = [...new Set(sessions.map((s) => s.interface).filter((value): value is string => Boolean(value)))];
  const machines: string[] = [...new Set(sessions.map((s) => s.machine).filter((value): value is string => Boolean(value)))];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <label className="text-low text-xs">Interface:</label>
          <select
            value={filterInterface || ''}
            onChange={(e) => setFilterInterface(e.target.value || null)}
            className="bg-secondary border border-border rounded-lg px-3 py-1 text-xs text-normal focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="">All</option>
            {interfaces.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-low text-xs">Machine:</label>
          <select
            value={filterMachine || ''}
            onChange={(e) => setFilterMachine(e.target.value || null)}
            className="bg-secondary border border-border rounded-lg px-3 py-1 text-xs text-normal focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="">All</option>
            {machines.map((m) => (
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
