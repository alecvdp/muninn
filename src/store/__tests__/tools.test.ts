import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useToolsStore } from '../tools';
import { setMockResult, resetMockResult, supabaseMock } from '../../test/setup';
import type { Database } from '../../database.types';

type ToolRow = Database['public']['Tables']['tools']['Row'];

const makeTool = (overrides: Partial<ToolRow> = {}): ToolRow => ({
  id: 'tool-1',
  name: 'Claude Pro',
  category: 'using',
  billing_cycle: 'monthly',
  cost: 20,
  renewal_date: null,
  url: null,
  notes: null,
  platform: null,
  tags: null,
  created_at: '2026-04-01T00:00:00Z',
  updated_at: '2026-04-01T00:00:00Z',
  ...overrides,
});

describe('useToolsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockResult();
    useToolsStore.setState({
      tools: [],
      selectedToolId: null,
      selectedTool: null,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  it('has correct initial state', () => {
    const state = useToolsStore.getState();
    expect(state.tools).toEqual([]);
    expect(state.selectedToolId).toBeNull();
    expect(state.selectedTool).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  // ── fetchTools ─────────────────────────────────────────────────────────────

  describe('fetchTools', () => {
    it('loads tools from Supabase', async () => {
      const tools = [makeTool(), makeTool({ id: 'tool-2', name: 'Cursor' })];
      setMockResult({ data: tools });

      await useToolsStore.getState().fetchTools();

      const state = useToolsStore.getState();
      expect(state.tools).toEqual(tools);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(supabaseMock.from).toHaveBeenCalledWith('tools');
    });

    it('sets error on failure', async () => {
      setMockResult({ data: null, error: { message: 'Fetch failed' } });

      await useToolsStore.getState().fetchTools();

      expect(useToolsStore.getState().error).toBe('Fetch failed');
      expect(useToolsStore.getState().isLoading).toBe(false);
    });

    it('syncs selectedTool after fetch', async () => {
      useToolsStore.setState({ selectedToolId: 'tool-1' });
      const tool = makeTool({ id: 'tool-1', name: 'Updated' });
      setMockResult({ data: [tool] });

      await useToolsStore.getState().fetchTools();

      expect(useToolsStore.getState().selectedTool).toEqual(tool);
    });
  });

  // ── createTool ─────────────────────────────────────────────────────────────

  describe('createTool', () => {
    it('appends the new tool to the list', async () => {
      const existing = makeTool({ id: 'tool-1' });
      useToolsStore.setState({ tools: [existing] });

      const created = makeTool({ id: 'tool-new', name: 'New Tool' });
      setMockResult({ data: created });

      const result = await useToolsStore.getState().createTool({ name: 'New Tool', category: 'using' });

      expect(result).toEqual(created);
      const state = useToolsStore.getState();
      expect(state.tools).toHaveLength(2);
      expect(state.tools[1]).toEqual(created); // appended, not prepended
    });

    it('returns null and sets error on failure', async () => {
      setMockResult({ data: null, error: { message: 'Insert failed' } });

      const result = await useToolsStore.getState().createTool({ name: 'Fail', category: 'using' });

      expect(result).toBeNull();
      expect(useToolsStore.getState().error).toBe('Insert failed');
    });
  });

  // ── updateTool ─────────────────────────────────────────────────────────────

  describe('updateTool', () => {
    it('replaces the updated tool in the list', async () => {
      useToolsStore.setState({ tools: [makeTool({ id: 'tool-1', name: 'Old' })] });
      const updated = makeTool({ id: 'tool-1', name: 'New' });
      setMockResult({ data: updated });

      const result = await useToolsStore.getState().updateTool('tool-1', { name: 'New' });

      expect(result).toEqual(updated);
      expect(useToolsStore.getState().tools[0].name).toBe('New');
    });

    it('syncs selectedTool if the updated tool is selected', async () => {
      const original = makeTool({ id: 'tool-1', name: 'Old' });
      useToolsStore.setState({
        tools: [original],
        selectedToolId: 'tool-1',
        selectedTool: original,
      });
      const updated = makeTool({ id: 'tool-1', name: 'New' });
      setMockResult({ data: updated });

      await useToolsStore.getState().updateTool('tool-1', { name: 'New' });

      expect(useToolsStore.getState().selectedTool?.name).toBe('New');
    });

    it('returns null and sets error on failure', async () => {
      setMockResult({ data: null, error: { message: 'Update failed' } });

      const result = await useToolsStore.getState().updateTool('tool-1', { name: 'Fail' });

      expect(result).toBeNull();
      expect(useToolsStore.getState().error).toBe('Update failed');
    });
  });

  // ── deleteTool ─────────────────────────────────────────────────────────────

  describe('deleteTool', () => {
    it('removes the tool from the list', async () => {
      useToolsStore.setState({ tools: [makeTool({ id: 'tool-1' }), makeTool({ id: 'tool-2' })] });
      setMockResult({ data: null, error: null });

      const result = await useToolsStore.getState().deleteTool('tool-1');

      expect(result).toBe(true);
      expect(useToolsStore.getState().tools).toHaveLength(1);
      expect(useToolsStore.getState().tools[0].id).toBe('tool-2');
    });

    it('clears selection when the selected tool is deleted', async () => {
      useToolsStore.setState({
        tools: [makeTool({ id: 'tool-1' })],
        selectedToolId: 'tool-1',
        selectedTool: makeTool({ id: 'tool-1' }),
      });
      setMockResult({ data: null, error: null });

      await useToolsStore.getState().deleteTool('tool-1');

      expect(useToolsStore.getState().selectedToolId).toBeNull();
      expect(useToolsStore.getState().selectedTool).toBeNull();
    });

    it('preserves selection of a different tool', async () => {
      useToolsStore.setState({
        tools: [makeTool({ id: 'tool-1' }), makeTool({ id: 'tool-2' })],
        selectedToolId: 'tool-2',
        selectedTool: makeTool({ id: 'tool-2' }),
      });
      setMockResult({ data: null, error: null });

      await useToolsStore.getState().deleteTool('tool-1');

      expect(useToolsStore.getState().selectedToolId).toBe('tool-2');
    });

    it('returns false and sets error on failure', async () => {
      setMockResult({ data: null, error: { message: 'Delete failed' } });

      const result = await useToolsStore.getState().deleteTool('tool-1');

      expect(result).toBe(false);
      expect(useToolsStore.getState().error).toBe('Delete failed');
    });
  });

  // ── selectTool ─────────────────────────────────────────────────────────────

  describe('selectTool', () => {
    it('sets selected tool by ID', () => {
      const tool = makeTool({ id: 'tool-1' });
      useToolsStore.setState({ tools: [tool] });

      useToolsStore.getState().selectTool('tool-1');

      expect(useToolsStore.getState().selectedToolId).toBe('tool-1');
      expect(useToolsStore.getState().selectedTool).toEqual(tool);
    });

    it('clears selection when passed null', () => {
      useToolsStore.setState({
        tools: [makeTool()],
        selectedToolId: 'tool-1',
        selectedTool: makeTool(),
      });

      useToolsStore.getState().selectTool(null);

      expect(useToolsStore.getState().selectedToolId).toBeNull();
      expect(useToolsStore.getState().selectedTool).toBeNull();
    });
  });

  // ── Computed selectors ─────────────────────────────────────────────────────

  describe('totalMonthlyCost', () => {
    it('sums cost of monthly-billed tools', () => {
      useToolsStore.setState({
        tools: [
          makeTool({ id: 't1', billing_cycle: 'monthly', cost: 20 }),
          makeTool({ id: 't2', billing_cycle: 'monthly', cost: 10 }),
          makeTool({ id: 't3', billing_cycle: 'annual', cost: 100 }),
        ],
      });

      expect(useToolsStore.getState().totalMonthlyCost()).toBe(30);
    });

    it('returns 0 when no monthly tools exist', () => {
      useToolsStore.setState({
        tools: [makeTool({ billing_cycle: 'annual', cost: 100 })],
      });

      expect(useToolsStore.getState().totalMonthlyCost()).toBe(0);
    });

    it('skips tools with null cost', () => {
      useToolsStore.setState({
        tools: [
          makeTool({ id: 't1', billing_cycle: 'monthly', cost: 20 }),
          makeTool({ id: 't2', billing_cycle: 'monthly', cost: null }),
        ],
      });

      expect(useToolsStore.getState().totalMonthlyCost()).toBe(20);
    });
  });

  describe('totalAnnualCost', () => {
    it('sums cost of annual-billed tools', () => {
      useToolsStore.setState({
        tools: [
          makeTool({ id: 't1', billing_cycle: 'annual', cost: 100 }),
          makeTool({ id: 't2', billing_cycle: 'annual', cost: 50 }),
          makeTool({ id: 't3', billing_cycle: 'monthly', cost: 20 }),
        ],
      });

      expect(useToolsStore.getState().totalAnnualCost()).toBe(150);
    });
  });

  describe('activeToolCount', () => {
    it('counts tools with category "using"', () => {
      useToolsStore.setState({
        tools: [
          makeTool({ id: 't1', category: 'using' }),
          makeTool({ id: 't2', category: 'using' }),
          makeTool({ id: 't3', category: 'retired' }),
          makeTool({ id: 't4', category: 'evaluating' }),
        ],
      });

      expect(useToolsStore.getState().activeToolCount()).toBe(2);
    });

    it('returns 0 when no tools are active', () => {
      useToolsStore.setState({
        tools: [makeTool({ category: 'retired' })],
      });

      expect(useToolsStore.getState().activeToolCount()).toBe(0);
    });
  });

  describe('renewingWithin30Days', () => {
    it('counts tools renewing within 30 days', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-04-13'));

      useToolsStore.setState({
        tools: [
          makeTool({ id: 't1', renewal_date: '2026-04-20' }),   // 7 days away ✓
          makeTool({ id: 't2', renewal_date: '2026-05-12' }),   // 29 days away ✓
          makeTool({ id: 't3', renewal_date: '2026-06-01' }),   // 49 days away ✗
          makeTool({ id: 't4', renewal_date: null }),             // no date ✗
          makeTool({ id: 't5', renewal_date: '2026-04-01' }),   // past ✗
        ],
      });

      expect(useToolsStore.getState().renewingWithin30Days()).toBe(2);
    });
  });

  // ── clearError ─────────────────────────────────────────────────────────────

  describe('clearError', () => {
    it('resets error to null', () => {
      useToolsStore.setState({ error: 'something broke' });

      useToolsStore.getState().clearError();

      expect(useToolsStore.getState().error).toBeNull();
    });
  });

  // ── subscribeToTools ───────────────────────────────────────────────────────

  describe('subscribeToTools', () => {
    it('sets up a realtime channel and returns unsubscribe function', () => {
      const unsubscribe = useToolsStore.getState().subscribeToTools();

      expect(supabaseMock.channel).toHaveBeenCalledWith('muninn-tools');
      expect(supabaseMock.__channelMock.on).toHaveBeenCalled();
      expect(supabaseMock.__channelMock.subscribe).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
      expect(supabaseMock.removeChannel).toHaveBeenCalledTimes(1);
    });

    it('keeps one shared channel until all subscribers unsubscribe', () => {
      const unsubscribeFirst = useToolsStore.getState().subscribeToTools();
      const unsubscribeSecond = useToolsStore.getState().subscribeToTools();

      expect(supabaseMock.channel).toHaveBeenCalledTimes(1);
      expect(supabaseMock.__channelMock.subscribe).toHaveBeenCalledTimes(1);

      unsubscribeFirst();
      expect(supabaseMock.removeChannel).not.toHaveBeenCalled();

      unsubscribeSecond();
      expect(supabaseMock.removeChannel).toHaveBeenCalledTimes(1);
    });

    it('allows cleanup to be called more than once safely', () => {
      const unsubscribe = useToolsStore.getState().subscribeToTools();

      unsubscribe();
      unsubscribe();

      expect(supabaseMock.removeChannel).toHaveBeenCalledTimes(1);
    });
  });
});
