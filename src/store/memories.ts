import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { MemoryRow } from '../types';

const PAGE_SIZE = 25;

interface MemoriesState {
  memories: MemoryRow[];
  isLoading: boolean;
  isFetchingMore: boolean;
  error: string | null;
  hasMore: boolean;
  search: string;
  filterCategory: string | null;
  filterConfidence: string | null;
  filterTag: string | null;
  availableCategories: string[];
  availableTags: string[];
  selectedMemoryId: string | null;
  fetchMemories: () => Promise<void>;
  fetchMoreMemories: () => Promise<void>;
  fetchFilterOptions: () => Promise<void>;
  setSearch: (s: string) => void;
  setFilterCategory: (c: string | null) => void;
  setFilterConfidence: (c: string | null) => void;
  setFilterTag: (t: string | null) => void;
  selectMemory: (id: string | null) => void;
  clearError: () => void;
}

function buildBaseQuery(state: Pick<MemoriesState, 'search' | 'filterCategory' | 'filterConfidence' | 'filterTag'>) {
  let q = supabase
    .from('memories')
    .select('*')
    .order('created_at', { ascending: false });
  if (state.search.trim()) {
    q = q.ilike('content', `%${state.search.trim()}%`);
  }
  if (state.filterCategory) q = q.eq('category', state.filterCategory);
  if (state.filterConfidence) q = q.eq('confidence', state.filterConfidence);
  if (state.filterTag) q = q.contains('tags', [state.filterTag]);
  return q;
}

export const useMemoriesStore = create<MemoriesState>()(
  devtools((set, get) => ({
    memories: [],
    isLoading: false,
    isFetchingMore: false,
    error: null,
    hasMore: true,
    search: '',
    filterCategory: null,
    filterConfidence: null,
    filterTag: null,
    availableCategories: [],
    availableTags: [],
    selectedMemoryId: null,

    fetchMemories: async () => {
      set({ isLoading: true, error: null, memories: [], hasMore: true }, false, 'memories/fetch:start');
      const q = buildBaseQuery(get()).limit(PAGE_SIZE);
      const { data, error } = await q;
      if (error) {
        set({ isLoading: false, error: error.message }, false, 'memories/fetch:error');
        return;
      }
      const rows = (data ?? []) as MemoryRow[];
      set({
        memories: rows,
        isLoading: false,
        hasMore: rows.length >= PAGE_SIZE,
      }, false, 'memories/fetch:success');
    },

    fetchMoreMemories: async () => {
      const { memories, isFetchingMore, hasMore } = get();
      if (isFetchingMore || !hasMore) return;
      set({ isFetchingMore: true }, false, 'memories/fetchMore:start');
      const offset = memories.length;
      const q = buildBaseQuery(get()).range(offset, offset + PAGE_SIZE - 1);
      const { data, error } = await q;
      if (error) {
        set({ isFetchingMore: false, error: error.message }, false, 'memories/fetchMore:error');
        return;
      }
      const rows = (data ?? []) as MemoryRow[];
      set({
        memories: [...get().memories, ...rows],
        isFetchingMore: false,
        hasMore: rows.length >= PAGE_SIZE,
      }, false, 'memories/fetchMore:success');
    },

    fetchFilterOptions: async () => {
      const { data } = await supabase.from('memories').select('category, tags');
      if (!data) return;
      const cats = [...new Set(data.map((r) => r.category).filter(Boolean))] as string[];
      const tags = [...new Set(data.flatMap((r) => r.tags ?? []).filter(Boolean))] as string[];
      set({
        availableCategories: cats.sort(),
        availableTags: tags.sort(),
      }, false, 'memories/filterOptions');
    },

    setSearch: (s) => {
      set({ search: s }, false, 'memories/search');
      void get().fetchMemories();
    },
    setFilterCategory: (c) => {
      set({ filterCategory: c }, false, 'memories/filter:category');
      void get().fetchMemories();
    },
    setFilterConfidence: (c) => {
      set({ filterConfidence: c }, false, 'memories/filter:confidence');
      void get().fetchMemories();
    },
    setFilterTag: (t) => {
      set({ filterTag: t }, false, 'memories/filter:tag');
      void get().fetchMemories();
    },
    selectMemory: (id) => set({ selectedMemoryId: id }, false, 'memories/select'),
    clearError: () => set({ error: null }, false, 'memories/clearError'),
  }), { name: 'memories-store' }),
);
