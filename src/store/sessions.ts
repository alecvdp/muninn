import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { SessionRow } from '../types';

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
  subscribeToSessions: () => () => void;
  clearError: () => void;
  setFilterInterface: (filter: string | null) => void;
  setFilterMachine: (filter: string | null) => void;
  setFilterProject: (filter: string | null) => void;
}

interface RealtimeSubscriptionState {
  channel: RealtimeChannel | null;
  subscriberCount: number;
}

type RealtimeRegistry = Record<string, RealtimeSubscriptionState>;
type GlobalRealtimeRegistry = typeof globalThis & {
  __muninnRealtimeRegistry__?: RealtimeRegistry;
};

const getRealtimeRegistry = (): RealtimeRegistry => {
  const globalRef = globalThis as GlobalRealtimeRegistry;
  if (!globalRef.__muninnRealtimeRegistry__) {
    globalRef.__muninnRealtimeRegistry__ = {};
  }
  return globalRef.__muninnRealtimeRegistry__;
};

const getSessionsSubscriptionState = (): RealtimeSubscriptionState => {
  const registry = getRealtimeRegistry();
  if (!registry.sessions) {
    registry.sessions = {
      channel: null,
      subscriberCount: 0,
    };
  }
  return registry.sessions;
};

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
      const { data } = await supabase.rpc('get_session_filter_options');
      if (!data) return;
      const interfaces: string[] = [];
      const machines: string[] = [];
      for (const row of data) {
        if (row.kind === 'interface') interfaces.push(row.value);
        else if (row.kind === 'machine') machines.push(row.value);
      }
      set({ availableInterfaces: interfaces.sort(), availableMachines: machines.sort() }, false, 'sessions/filterOptions');
    },

    subscribeToSessions: () => {
      const subscription = getSessionsSubscriptionState();
      subscription.subscriberCount += 1;

      if (!subscription.channel) {
        subscription.channel = supabase
          .channel('muninn-sessions')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_sessions' }, () => {
            void get().fetchSessions();
            void get().fetchFilterOptions();
          })
          .subscribe();
      }

      let hasCleanedUp = false;
      return () => {
        if (hasCleanedUp) return;
        hasCleanedUp = true;

        const currentSubscription = getSessionsSubscriptionState();
        currentSubscription.subscriberCount = Math.max(0, currentSubscription.subscriberCount - 1);

        if (currentSubscription.subscriberCount > 0 || !currentSubscription.channel) return;

        const channel = currentSubscription.channel;
        currentSubscription.channel = null;
        void supabase.removeChannel(channel);
      };
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
