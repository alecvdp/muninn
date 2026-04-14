import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionsStore } from '../sessions';
import { setMockResult, resetMockResult, supabaseMock } from '../../test/setup';
import type { Database } from '../../database.types';

type SessionRow = Database['public']['Tables']['agent_sessions']['Row'];

const makeSession = (overrides: Partial<SessionRow> = {}): SessionRow => ({
  id: 'sess-1',
  agent_id: null,
  interface: 'claude-code',
  machine: 'midgard',
  project_id: null,
  started_at: '2026-04-13T00:00:00Z',
  ended_at: null,
  summary: null,
  memories_created: null,
  tables_touched: null,
  ...overrides,
});

describe('useSessionsStore', () => {
  beforeEach(() => {
    resetMockResult();
    useSessionsStore.setState({
      sessions: [],
      isLoading: false,
      error: null,
      filterInterface: null,
      filterMachine: null,
      filterProject: null,
    });
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  it('has correct initial state', () => {
    const state = useSessionsStore.getState();
    expect(state.sessions).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.filterInterface).toBeNull();
    expect(state.filterMachine).toBeNull();
    expect(state.filterProject).toBeNull();
  });

  // ── fetchSessions ──────────────────────────────────────────────────────────

  describe('fetchSessions', () => {
    it('loads sessions from Supabase', async () => {
      const sessions = [makeSession(), makeSession({ id: 'sess-2' })];
      setMockResult({ data: sessions });

      await useSessionsStore.getState().fetchSessions();

      const state = useSessionsStore.getState();
      expect(state.sessions).toEqual(sessions);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(supabaseMock.from).toHaveBeenCalledWith('agent_sessions');
    });

    it('sets error on failure', async () => {
      setMockResult({ data: null, error: { message: 'Fetch failed' } });

      await useSessionsStore.getState().fetchSessions();

      const state = useSessionsStore.getState();
      expect(state.sessions).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Fetch failed');
    });

    it('handles null data gracefully', async () => {
      setMockResult({ data: null, error: null });

      await useSessionsStore.getState().fetchSessions();

      expect(useSessionsStore.getState().sessions).toEqual([]);
    });
  });

  // ── Filters ────────────────────────────────────────────────────────────────

  describe('filter setters', () => {
    it('sets interface filter', () => {
      useSessionsStore.getState().setFilterInterface('claude.ai');
      expect(useSessionsStore.getState().filterInterface).toBe('claude.ai');
    });

    it('sets machine filter', () => {
      useSessionsStore.getState().setFilterMachine('yggdrasil');
      expect(useSessionsStore.getState().filterMachine).toBe('yggdrasil');
    });

    it('sets project filter', () => {
      useSessionsStore.getState().setFilterProject('proj-1');
      expect(useSessionsStore.getState().filterProject).toBe('proj-1');
    });

    it('clears filter with null', () => {
      useSessionsStore.getState().setFilterInterface('claude.ai');
      useSessionsStore.getState().setFilterInterface(null);
      expect(useSessionsStore.getState().filterInterface).toBeNull();
    });
  });

  // ── filteredSessions ───────────────────────────────────────────────────────

  describe('filteredSessions', () => {
    const sessions: SessionRow[] = [
      makeSession({ id: 's1', interface: 'claude-code', machine: 'midgard', project_id: 'proj-a' }),
      makeSession({ id: 's2', interface: 'claude.ai', machine: 'midgard', project_id: 'proj-a' }),
      makeSession({ id: 's3', interface: 'claude-code', machine: 'yggdrasil', project_id: 'proj-b' }),
      makeSession({ id: 's4', interface: 'claude.ai', machine: 'yggdrasil', project_id: null }),
    ];

    beforeEach(() => {
      useSessionsStore.setState({ sessions });
    });

    it('returns all sessions when no filters are set', () => {
      expect(useSessionsStore.getState().filteredSessions()).toHaveLength(4);
    });

    it('filters by interface', () => {
      useSessionsStore.getState().setFilterInterface('claude-code');
      const result = useSessionsStore.getState().filteredSessions();
      expect(result).toHaveLength(2);
      expect(result.every((s) => s.interface === 'claude-code')).toBe(true);
    });

    it('filters by machine', () => {
      useSessionsStore.getState().setFilterMachine('yggdrasil');
      const result = useSessionsStore.getState().filteredSessions();
      expect(result).toHaveLength(2);
      expect(result.every((s) => s.machine === 'yggdrasil')).toBe(true);
    });

    it('filters by project', () => {
      useSessionsStore.getState().setFilterProject('proj-a');
      const result = useSessionsStore.getState().filteredSessions();
      expect(result).toHaveLength(2);
      expect(result.every((s) => s.project_id === 'proj-a')).toBe(true);
    });

    it('applies multiple filters with AND logic', () => {
      useSessionsStore.getState().setFilterInterface('claude-code');
      useSessionsStore.getState().setFilterMachine('midgard');
      const result = useSessionsStore.getState().filteredSessions();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('s1');
    });

    it('returns empty when no sessions match all filters', () => {
      useSessionsStore.getState().setFilterInterface('claude.ai');
      useSessionsStore.getState().setFilterMachine('midgard');
      useSessionsStore.getState().setFilterProject('proj-b');
      expect(useSessionsStore.getState().filteredSessions()).toHaveLength(0);
    });
  });

  // ── clearError ─────────────────────────────────────────────────────────────

  describe('clearError', () => {
    it('resets error to null', () => {
      useSessionsStore.setState({ error: 'something broke' });

      useSessionsStore.getState().clearError();

      expect(useSessionsStore.getState().error).toBeNull();
    });
  });
});
