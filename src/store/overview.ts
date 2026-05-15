import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type {
  ProfileRow,
  ProjectRow,
  SessionRow,
  MemoryRow,
  InsightRow,
} from '../types';

interface OverviewState {
  profile: ProfileRow | null;
  activeProjects: ProjectRow[];
  recentSessions: SessionRow[];
  recentMemories: MemoryRow[];
  recentInsights: InsightRow[];
  // Health signals
  lastMemoryAt: string | null;
  lastSessionAt: string | null;
  totalMemories: number;
  totalSessions: number;
  staleProjectIds: string[];
  isLoading: boolean;
  error: string | null;
  loadedAt: number | null;
  fetchOverview: () => Promise<void>;
  clearError: () => void;
}

const STALE_PROJECT_DAYS = 60;

export const useOverviewStore = create<OverviewState>()(
  devtools((set) => ({
    profile: null,
    activeProjects: [],
    recentSessions: [],
    recentMemories: [],
    recentInsights: [],
    lastMemoryAt: null,
    lastSessionAt: null,
    totalMemories: 0,
    totalSessions: 0,
    staleProjectIds: [],
    isLoading: false,
    error: null,
    loadedAt: null,

    fetchOverview: async () => {
      set({ isLoading: true, error: null }, false, 'overview/fetch:start');

      const [
        profileRes,
        projectsRes,
        sessionsRes,
        memoriesRes,
        insightsRes,
        memCountRes,
        sessCountRes,
      ] = await Promise.all([
        supabase.from('profile').select('*').limit(1).maybeSingle(),
        supabase
          .from('projects')
          .select('*')
          .is('archived_at', null)
          .in('status', ['active', 'idea', 'paused'])
          .order('updated_at', { ascending: false })
          .limit(20),
        supabase
          .from('agent_sessions')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(8),
        supabase
          .from('memories')
          .select('*')
          .is('superseded_by', null)
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('derived_insights')
          .select('*')
          .is('superseded_by', null)
          .order('created_at', { ascending: false })
          .limit(6),
        supabase.from('memories').select('id', { count: 'exact', head: true }),
        supabase.from('agent_sessions').select('id', { count: 'exact', head: true }),
      ]);

      const firstError =
        projectsRes.error ||
        sessionsRes.error ||
        memoriesRes.error ||
        insightsRes.error;

      if (firstError) {
        set({ isLoading: false, error: firstError.message }, false, 'overview/fetch:error');
        return;
      }

      const projects = (projectsRes.data ?? []) as ProjectRow[];
      const now = Date.now();
      const staleCutoff = STALE_PROJECT_DAYS * 24 * 60 * 60 * 1000;
      const staleProjectIds = projects
        .filter((p) => {
          const t = p.updated_at ? new Date(p.updated_at).getTime() : 0;
          return p.status === 'active' && now - t > staleCutoff;
        })
        .map((p) => p.id);

      const memories = (memoriesRes.data ?? []) as MemoryRow[];
      const sessions = (sessionsRes.data ?? []) as SessionRow[];

      set({
        profile: (profileRes.data ?? null) as ProfileRow | null,
        activeProjects: projects,
        recentSessions: sessions,
        recentMemories: memories,
        recentInsights: (insightsRes.data ?? []) as InsightRow[],
        lastMemoryAt: memories[0]?.created_at ?? null,
        lastSessionAt: sessions[0]?.started_at ?? null,
        totalMemories: memCountRes.count ?? 0,
        totalSessions: sessCountRes.count ?? 0,
        staleProjectIds,
        isLoading: false,
        loadedAt: Date.now(),
      }, false, 'overview/fetch:success');
    },

    clearError: () => set({ error: null }, false, 'overview/clearError'),
  }), { name: 'overview-store' }),
);
