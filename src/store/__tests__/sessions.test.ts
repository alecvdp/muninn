import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionsStore } from '../sessions';
import { setMockResult, resetMockResult, supabaseMock } from '../../test/setup';
import type { SessionRow } from '../../types';

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
      isFetchingMore: false,
      error: null,
      hasMore: true,
      filterInterface: null,
      filterMachine: null,
      filterProject: null,
      availableInterfaces: [],
      availableMachines: [],
    });
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  it('has correct initial state', () => {
    const state = useSessionsStore.getState();
    expect(state.sessions).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.isFetchingMore).toBe(false);
    expect(state.error).toBeNull();
    expect(state.hasMore).toBe(true);
    expect(state.filterInterface).toBeNull();
    expect(state.filterMachine).toBeNull();
    expect(state.filterProject).toBeNull();
    expect(state.availableInterfaces).toEqual([]);
    expect(state.availableMachines).toEqual([]);
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

    it('sets hasMore to false when fewer than page size returned', async () => {
      const sessions = [makeSession()];
      setMockResult({ data: sessions });

      await useSessionsStore.getState().fetchSessions();

      expect(useSessionsStore.getState().hasMore).toBe(false);
    });

    it('sets hasMore to true when page size rows returned', async () => {
      const sessions = Array.from({ length: 25 }, (_, i) =>
        makeSession({ id: `sess-${i}` }),
      );
      setMockResult({ data: sessions });

      await useSessionsStore.getState().fetchSessions();

      expect(useSessionsStore.getState().hasMore).toBe(true);
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

    it('clears existing sessions on new fetch', async () => {
      useSessionsStore.setState({ sessions: [makeSession()] });
      setMockResult({ data: [makeSession({ id: 'sess-new' })] });

      await useSessionsStore.getState().fetchSessions();

      expect(useSessionsStore.getState().sessions).toHaveLength(1);
      expect(useSessionsStore.getState().sessions[0].id).toBe('sess-new');
    });
  });

  // ── fetchMoreSessions ──────────────────────────────────────────────────────

  describe('fetchMoreSessions', () => {
    it('appends sessions to existing list', async () => {
      useSessionsStore.setState({
        sessions: [makeSession({ id: 'existing' })],
        hasMore: true,
      });
      setMockResult({ data: [makeSession({ id: 'new-1' })] });

      await useSessionsStore.getState().fetchMoreSessions();

      const state = useSessionsStore.getState();
      expect(state.sessions).toHaveLength(2);
      expect(state.sessions[0].id).toBe('existing');
      expect(state.sessions[1].id).toBe('new-1');
    });

    it('does nothing when hasMore is false', async () => {
      useSessionsStore.setState({ hasMore: false });
      setMockResult({ data: [makeSession()] });

      await useSessionsStore.getState().fetchMoreSessions();

      expect(useSessionsStore.getState().sessions).toEqual([]);
    });

    it('does nothing when already fetching more', async () => {
      useSessionsStore.setState({ isFetchingMore: true, hasMore: true });
      setMockResult({ data: [makeSession()] });

      await useSessionsStore.getState().fetchMoreSessions();

      expect(useSessionsStore.getState().sessions).toEqual([]);
    });

    it('sets hasMore to false when fewer than page size returned', async () => {
      useSessionsStore.setState({
        sessions: [makeSession({ id: 'existing' })],
        hasMore: true,
      });
      setMockResult({ data: [makeSession({ id: 'last' })] });

      await useSessionsStore.getState().fetchMoreSessions();

      expect(useSessionsStore.getState().hasMore).toBe(false);
    });
  });

  // ── fetchFilterOptions ─────────────────────────────────────────────────────

  describe('fetchFilterOptions', () => {
    it('extracts unique interface and machine values from RPC', async () => {
      setMockResult({
        data: [
          { kind: 'interface', value: 'claude-code' },
          { kind: 'interface', value: 'claude.ai' },
          { kind: 'machine', value: 'midgard' },
          { kind: 'machine', value: 'yggdrasil' },
        ],
      });

      await useSessionsStore.getState().fetchFilterOptions();

      const state = useSessionsStore.getState();
      expect(state.availableInterfaces).toEqual(['claude-code', 'claude.ai']);
      expect(state.availableMachines).toEqual(['midgard', 'yggdrasil']);
    });

    it('handles null data gracefully', async () => {
      setMockResult({ data: null });

      await useSessionsStore.getState().fetchFilterOptions();

      expect(useSessionsStore.getState().availableInterfaces).toEqual([]);
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

  // ── clearError ─────────────────────────────────────────────────────────────

  describe('clearError', () => {
    it('resets error to null', () => {
      useSessionsStore.setState({ error: 'something broke' });

      useSessionsStore.getState().clearError();

      expect(useSessionsStore.getState().error).toBeNull();
    });
  });
});
