import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { Database } from '../database.types';

type SessionRow = Database['public']['Tables']['agent_sessions']['Row'];

interface SessionsState {
  sessions: SessionRow[];
  isLoading: boolean;
  error: string | null;
  filterInterface: string | null;
  filterMachine: string | null;
  filterProject: string | null;
  fetchSessions: () => Promise<void>;
  clearError: () => void;
  setFilterInterface: (filter: string | null) => void;
  setFilterMachine: (filter: string | null) => void;
  setFilterProject: (filter: string | null) => void;
  filteredSessions: () => SessionRow[];
}

export const useSessionsStore = create<SessionsState>()(
  devtools((set, get) => ({
    sessions: [],
    isLoading: false,
    error: null,
    filterInterface: null,
    filterMachine: null,
    filterProject: null,

    fetchSessions: async () => {
      set({ isLoading: true, error: null }, false, 'sessions/fetch:start');
      const { data, error } = await supabase
        .from('agent_sessions')
        .select('*')
        .order('started_at', { ascending: false });
      if (error) {
        set({ isLoading: false, error: error.message }, false, 'sessions/fetch:error');
        return;
      }
      set({ sessions: data ?? [], isLoading: false, error: null }, false, 'sessions/fetch:success');
    },

    clearError: () => set({ error: null }, false, 'sessions/clearError'),

    setFilterInterface: (filter) => set({ filterInterface: filter }, false, 'sessions/filter:interface'),
    setFilterMachine: (filter) => set({ filterMachine: filter }, false, 'sessions/filter:machine'),
    setFilterProject: (filter) => set({ filterProject: filter }, false, 'sessions/filter:project'),

    filteredSessions: () => {
      const { sessions, filterInterface, filterMachine, filterProject } = get();
      return sessions.filter((s) => {
        if (filterInterface && s.interface !== filterInterface) return false;
        if (filterMachine && s.machine !== filterMachine) return false;
        if (filterProject && s.project_id !== filterProject) return false;
        return true;
      });
    },
  }), { name: 'sessions-store' }),
);
