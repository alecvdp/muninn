import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { InsightRow } from '../types';

const PAGE_SIZE = 25;

interface InsightsState {
  insights: InsightRow[];
  isLoading: boolean;
  isFetchingMore: boolean;
  error: string | null;
  hasMore: boolean;
  filterType: string | null;
  filterConfidence: string | null;
  selectedInsightId: string | null;
  fetchInsights: () => Promise<void>;
  fetchMoreInsights: () => Promise<void>;
  setFilterType: (t: string | null) => void;
  setFilterConfidence: (c: string | null) => void;
  selectInsight: (id: string | null) => void;
  clearError: () => void;
}

function buildBaseQuery(state: Pick<InsightsState, 'filterType' | 'filterConfidence'>) {
  let q = supabase
    .from('derived_insights')
    .select('*')
    .is('superseded_by', null)
    .order('created_at', { ascending: false });
  if (state.filterType) q = q.eq('insight_type', state.filterType);
  if (state.filterConfidence) q = q.eq('confidence', state.filterConfidence);
  return q;
}

export const useInsightsStore = create<InsightsState>()(
  devtools((set, get) => ({
    insights: [],
    isLoading: false,
    isFetchingMore: false,
    error: null,
    hasMore: true,
    filterType: null,
    filterConfidence: null,
    selectedInsightId: null,

    fetchInsights: async () => {
      set({ isLoading: true, error: null, insights: [], hasMore: true }, false, 'insights/fetch:start');
      const q = buildBaseQuery(get()).limit(PAGE_SIZE);
      const { data, error } = await q;
      if (error) {
        set({ isLoading: false, error: error.message }, false, 'insights/fetch:error');
        return;
      }
      const rows = (data ?? []) as InsightRow[];
      set({
        insights: rows,
        isLoading: false,
        hasMore: rows.length >= PAGE_SIZE,
      }, false, 'insights/fetch:success');
    },

    fetchMoreInsights: async () => {
      const { insights, isFetchingMore, hasMore } = get();
      if (isFetchingMore || !hasMore) return;
      set({ isFetchingMore: true }, false, 'insights/fetchMore:start');
      const offset = insights.length;
      const q = buildBaseQuery(get()).range(offset, offset + PAGE_SIZE - 1);
      const { data, error } = await q;
      if (error) {
        set({ isFetchingMore: false, error: error.message }, false, 'insights/fetchMore:error');
        return;
      }
      const rows = (data ?? []) as InsightRow[];
      set({
        insights: [...get().insights, ...rows],
        isFetchingMore: false,
        hasMore: rows.length >= PAGE_SIZE,
      }, false, 'insights/fetchMore:success');
    },

    setFilterType: (t) => {
      set({ filterType: t }, false, 'insights/filter:type');
      void get().fetchInsights();
    },
    setFilterConfidence: (c) => {
      set({ filterConfidence: c }, false, 'insights/filter:confidence');
      void get().fetchInsights();
    },
    selectInsight: (id) => set({ selectedInsightId: id }, false, 'insights/select'),
    clearError: () => set({ error: null }, false, 'insights/clearError'),
  }), { name: 'insights-store' }),
);
