import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { Database } from '../database.types';

type SessionRow = Database['public']['Tables']['agent_sessions']['Row'];

const PAGE_SIZE = 25;

interface SessionsState {
  sessions: SessionRow[];
  isLoading: boolean;
  isFetchingMore: boolean;
  error: string | null;
  hasMore: boolean;
  filterInterface: string | null;
  filterMachine: string | null;
  filterProject: string | null;
  availableInterfaces: string[];
  availableMachines: string[];
  fetchSessions: () => Promise<void>;
  fetchMoreSessions: () => Promise<void>;
  fetchFilterOptions: () => Promise<void>;
  clearError: () => void;
  setFilterInterface: (filter: string | null) => void;
  setFilterMachine: (filter: string | null) => void;
  setFilterProject: (filter: string | null) => void;
}

export const useSessionsStore = create<SessionsState>()(
  devtools((set, get) => ({
    sessions: [],
    isLoading: false,
    isFetchingMore: false,
    error: null,
    hasMore: true,
    filterInterface: null,
    filterMachine: null,
    filterProject: null,
    availableInterfaces: [],
    availableMachines: [],

    fetchSessions: async () => {
      set({ isLoading: true, error: null, sessions: [], hasMore: true }, false, 'sessions/fetch:start');
      const { filterInterface, filterMachine, filterProject } = get();
      let query = supabase
        .from('agent_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(PAGE_SIZE);
      if (filterInterface) query = query.eq('interface', filterInterface);
      if (filterMachine) query = query.eq('machine', filterMachine);
      if (filterProject) query = query.eq('project_id', filterProject);
      const { data, error } = await query;
      if (error) {
        set({ isLoading: false, error: error.message }, false, 'sessions/fetch:error');
        return;
      }
      const rows = data ?? [];
      set({
        sessions: rows,
        isLoading: false,
        error: null,
        hasMore: rows.length >= PAGE_SIZE,
      }, false, 'sessions/fetch:success');
    },

    fetchMoreSessions: async () => {
      const { sessions, isFetchingMore, hasMore, filterInterface, filterMachine, filterProject } = get();
      if (isFetchingMore || !hasMore) return;
      set({ isFetchingMore: true, error: null }, false, 'sessions/fetchMore:start');
      const offset = sessions.length;
      let query = supabase
        .from('agent_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);
      if (filterInterface) query = query.eq('interface', filterInterface);
      if (filterMachine) query = query.eq('machine', filterMachine);
      if (filterProject) query = query.eq('project_id', filterProject);
      const { data, error } = await query;
      if (error) {
        set({ isFetchingMore: false, error: error.message }, false, 'sessions/fetchMore:error');
        return;
      }
      const rows = data ?? [];
      set({
        sessions: [...get().sessions, ...rows],
        isFetchingMore: false,
        error: null,
        hasMore: rows.length >= PAGE_SIZE,
      }, false, 'sessions/fetchMore:success');
    },

    fetchFilterOptions: async () => {
      const { data } = await supabase
        .from('agent_sessions')
        .select('interface, machine');
      if (!data) return;
      const interfaces = [...new Set(data.map((r) => r.interface).filter(Boolean))] as string[];
      const machines = [...new Set(data.map((r) => r.machine).filter(Boolean))] as string[];
      set({ availableInterfaces: interfaces.sort(), availableMachines: machines.sort() }, false, 'sessions/filterOptions');
    },

    clearError: () => set({ error: null }, false, 'sessions/clearError'),

    setFilterInterface: (filter) => {
      set({ filterInterface: filter }, false, 'sessions/filter:interface');
      void get().fetchSessions();
    },
    setFilterMachine: (filter) => {
      set({ filterMachine: filter }, false, 'sessions/filter:machine');
      void get().fetchSessions();
    },
    setFilterProject: (filter) => {
      set({ filterProject: filter }, false, 'sessions/filter:project');
      void get().fetchSessions();
    },
  }), { name: 'sessions-store' }),
);
