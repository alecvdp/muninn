import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { isWithin30Days } from '../lib/dates';
import type { Database } from '../database.types';

type ToolRow = Database['public']['Tables']['tools']['Row'];
type ToolInsert = Database['public']['Tables']['tools']['Insert'];
type ToolUpdate = Database['public']['Tables']['tools']['Update'];

interface ToolsState {
  tools: ToolRow[];
  selectedToolId: string | null;
  selectedTool: ToolRow | null;
  isLoading: boolean;
  error: string | null;
  fetchTools: () => Promise<void>;
  subscribeToTools: () => Promise<() => Promise<void> | void>;
  createTool: (tool: ToolInsert) => Promise<ToolRow | null>;
  updateTool: (id: string, updates: ToolUpdate) => Promise<ToolRow | null>;
  deleteTool: (id: string) => Promise<boolean>;
  selectTool: (id: string | null) => void;
  clearError: () => void;
  totalMonthlyCost: () => number;
  totalAnnualCost: () => number;
  activeToolCount: () => number;
  renewingWithin30Days: () => number;
}

let toolsChannel: RealtimeChannel | null = null;

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

      subscribeToTools: async () => {
        if (toolsChannel) {
          await supabase.removeChannel(toolsChannel);
          toolsChannel = null;
        }

        toolsChannel = supabase
          .channel('muninn-tools')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tools' }, () => {
            void get().fetchTools();
          })
          .subscribe();

        return async () => {
          if (!toolsChannel) return;
          await supabase.removeChannel(toolsChannel);
          toolsChannel = null;
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
