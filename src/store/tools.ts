import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { isWithin30Days } from '../lib/dates';
import type { ToolRow, ToolInsert, ToolUpdate } from '../types';

interface ToolsState {
  tools: ToolRow[];
  selectedToolId: string | null;
  selectedTool: ToolRow | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filterCategory: string | null;
  filterPlatform: string | null;
  fetchTools: () => Promise<void>;
  subscribeToTools: () => () => void;
  createTool: (tool: ToolInsert) => Promise<ToolRow | null>;
  updateTool: (id: string, updates: ToolUpdate) => Promise<ToolRow | null>;
  deleteTool: (id: string) => Promise<boolean>;
  selectTool: (id: string | null) => void;
  clearError: () => void;
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: string | null) => void;
  setFilterPlatform: (platform: string | null) => void;
  filteredTools: () => ToolRow[];
  totalMonthlyCost: () => number;
  totalAnnualCost: () => number;
  activeToolCount: () => number;
  renewingWithin30Days: () => number;
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

const getToolsSubscriptionState = (): RealtimeSubscriptionState => {
  const registry = getRealtimeRegistry();
  if (!registry.tools) {
    registry.tools = {
      channel: null,
      subscriberCount: 0,
    };
  }
  return registry.tools;
};

const syncSelectedTool = (state: ToolsState, selectedToolId = state.selectedToolId) =>
  state.tools.find((tool) => tool.id === selectedToolId) ?? null;

export const useToolsStore = create<ToolsState>()(
  devtools(
    (set, get) => ({
      tools: [],
      selectedToolId: null,
      selectedTool: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      filterCategory: null,
      filterPlatform: null,

      fetchTools: async () => {
        set({ isLoading: true, error: null }, false, 'tools/fetchTools:start');

        const { data, error } = await supabase.from('tools').select('*').order('name');

        if (error) {
          set({ isLoading: false, error: error.message }, false, 'tools/fetchTools:error');
          return;
        }

        const nextTools = data ?? [];
        set(
          (state) => ({
            tools: nextTools,
            selectedTool: syncSelectedTool({ ...state, tools: nextTools }),
            isLoading: false,
            error: null,
          }),
          false,
          'tools/fetchTools:success',
        );
      },

      subscribeToTools: () => {
        const subscription = getToolsSubscriptionState();
        subscription.subscriberCount += 1;

        if (!subscription.channel) {
          subscription.channel = supabase
            .channel('muninn-tools')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tools' }, () => {
              void get().fetchTools();
            })
            .subscribe();
        }

        let hasCleanedUp = false;
        return () => {
          if (hasCleanedUp) return;
          hasCleanedUp = true;

          const currentSubscription = getToolsSubscriptionState();
          currentSubscription.subscriberCount = Math.max(0, currentSubscription.subscriberCount - 1);

          if (currentSubscription.subscriberCount > 0 || !currentSubscription.channel) return;

          const channel = currentSubscription.channel;
          currentSubscription.channel = null;
          void supabase.removeChannel(channel);
        };
      },

      createTool: async (tool) => {
        const { data, error } = await supabase.from('tools').insert(tool).select('*').single();

        if (error) {
          set({ error: error.message }, false, 'tools/createTool:error');
          return null;
        }

        set((state) => {
          const tools = [...state.tools, data];
          return {
            tools,
            selectedTool: syncSelectedTool({ ...state, tools }),
            error: null,
          };
        }, false, 'tools/createTool:success');

        return data;
      },

      updateTool: async (id, updates) => {
        const { data, error } = await supabase.from('tools').update(updates).eq('id', id).select('*').single();

        if (error) {
          set({ error: error.message }, false, 'tools/updateTool:error');
          return null;
        }

        set((state) => {
          const tools = state.tools.map((tool) => (tool.id === id ? data : tool));
          return {
            tools,
            selectedToolId: state.selectedToolId === id ? id : state.selectedToolId,
            selectedTool: syncSelectedTool({ ...state, tools }, state.selectedToolId === id ? id : state.selectedToolId),
            error: null,
          };
        }, false, 'tools/updateTool:success');

        return data;
      },

      deleteTool: async (id) => {
        const { error } = await supabase.from('tools').delete().eq('id', id);

        if (error) {
          set({ error: error.message }, false, 'tools/deleteTool:error');
          return false;
        }

        set((state) => {
          const tools = state.tools.filter((tool) => tool.id !== id);
          const selectedToolId = state.selectedToolId === id ? null : state.selectedToolId;

          return {
            tools,
            selectedToolId,
            selectedTool: syncSelectedTool({ ...state, tools, selectedToolId }),
            error: null,
          };
        }, false, 'tools/deleteTool:success');

        return true;
      },

      selectTool: (id) =>
        set(
          (state) => ({
            selectedToolId: id,
            selectedTool: syncSelectedTool({ ...state, selectedToolId: id }),
          }),
          false,
          'tools/selectTool',
        ),

      clearError: () => set({ error: null }, false, 'tools/clearError'),

      setSearchQuery: (query) => set({ searchQuery: query }, false, 'tools/setSearchQuery'),

      setFilterCategory: (category) => set({ filterCategory: category }, false, 'tools/setFilterCategory'),

      setFilterPlatform: (platform) => set({ filterPlatform: platform }, false, 'tools/setFilterPlatform'),

      filteredTools: () => {
        const { tools, searchQuery, filterCategory, filterPlatform } = get();
        let filtered = tools;

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter((t) => t.name.toLowerCase().includes(q));
        }

        if (filterCategory) {
          filtered = filtered.filter((t) => t.category === filterCategory);
        }

        if (filterPlatform) {
          filtered = filtered.filter((t) => t.platform?.includes(filterPlatform));
        }

        return filtered;
      },

      totalMonthlyCost: () =>
        get()
          .tools.filter((tool) => tool.billing_cycle === 'monthly' && tool.cost)
          .reduce((sum, tool) => sum + (tool.cost ?? 0), 0),

      totalAnnualCost: () =>
        get()
          .tools.filter((tool) => tool.billing_cycle === 'annual' && tool.cost)
          .reduce((sum, tool) => sum + (tool.cost ?? 0), 0),

      activeToolCount: () => get().tools.filter((tool) => tool.category === 'using').length,

      renewingWithin30Days: () => get().tools.filter((tool) => isWithin30Days(tool.renewal_date)).length,
    }),
    { name: 'tools-store' },
  ),
);
