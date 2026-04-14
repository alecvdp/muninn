import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProjectsStore } from '../projects';
import { setMockResult, resetMockResult, supabaseMock } from '../../test/setup';
import type { ProjectRow } from '../../types';

const makeProject = (overrides: Partial<ProjectRow> = {}): ProjectRow => ({
  id: 'proj-1',
  name: 'Test Project',
  status: 'active',
  board_status: 'todo',
  board_position: 0,
  description: null,
  priority: null,
  context: null,
  last_agent_context: null,
  repo_url: null,
  local_path: null,
  tech_stack: null,
  archived_at: null,
  created_at: '2026-04-01T00:00:00Z',
  updated_at: '2026-04-01T00:00:00Z',
  ...overrides,
});

describe('useProjectsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockResult();
    useProjectsStore.setState({
      projects: [],
      selectedProjectId: null,
      selectedProject: null,
      isLoading: false,
      error: null,
    });
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  it('has correct initial state', () => {
    const state = useProjectsStore.getState();
    expect(state.projects).toEqual([]);
    expect(state.selectedProjectId).toBeNull();
    expect(state.selectedProject).toBeNull();
    expect(state.boardColumns).toEqual(['idea', 'todo', 'in-progress', 'paused', 'done']);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  // ── fetchProjects ──────────────────────────────────────────────────────────

  describe('fetchProjects', () => {
    it('loads projects from Supabase', async () => {
      const projects = [makeProject(), makeProject({ id: 'proj-2', name: 'Second' })];
      setMockResult({ data: projects });

      await useProjectsStore.getState().fetchProjects();

      const state = useProjectsStore.getState();
      expect(state.projects).toEqual(projects);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(supabaseMock.from).toHaveBeenCalledWith('projects');
    });

    it('sets error on failure', async () => {
      setMockResult({ data: null, error: { message: 'Network error' } });

      await useProjectsStore.getState().fetchProjects();

      const state = useProjectsStore.getState();
      expect(state.projects).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network error');
    });

    it('sets isLoading during fetch', async () => {
      setMockResult({ data: [] });
      const promise = useProjectsStore.getState().fetchProjects();
      // isLoading is set synchronously before the await
      expect(useProjectsStore.getState().isLoading).toBe(true);
      await promise;
      expect(useProjectsStore.getState().isLoading).toBe(false);
    });

    it('syncs selectedProject after fetch', async () => {
      const project = makeProject({ id: 'proj-1', name: 'Updated Name' });
      useProjectsStore.setState({ selectedProjectId: 'proj-1' });
      setMockResult({ data: [project] });

      await useProjectsStore.getState().fetchProjects();

      expect(useProjectsStore.getState().selectedProject).toEqual(project);
    });

    it('clears selectedProject if project no longer exists after fetch', async () => {
      useProjectsStore.setState({
        selectedProjectId: 'proj-deleted',
        selectedProject: makeProject({ id: 'proj-deleted' }),
      });
      setMockResult({ data: [makeProject({ id: 'proj-1' })] });

      await useProjectsStore.getState().fetchProjects();

      expect(useProjectsStore.getState().selectedProject).toBeNull();
    });
  });

  // ── createProject ──────────────────────────────────────────────────────────

  describe('createProject', () => {
    it('prepends the new project to the list', async () => {
      const existing = makeProject({ id: 'proj-1' });
      useProjectsStore.setState({ projects: [existing] });

      const created = makeProject({ id: 'proj-new', name: 'New' });
      setMockResult({ data: created });

      const result = await useProjectsStore.getState().createProject({ name: 'New', status: 'active' });

      expect(result).toEqual(created);
      const state = useProjectsStore.getState();
      expect(state.projects[0]).toEqual(created);
      expect(state.projects).toHaveLength(2);
    });

    it('returns null and sets error on failure', async () => {
      setMockResult({ data: null, error: { message: 'Insert failed' } });

      const result = await useProjectsStore.getState().createProject({ name: 'Fail', status: 'active' });

      expect(result).toBeNull();
      expect(useProjectsStore.getState().error).toBe('Insert failed');
    });
  });

  // ── updateProject ──────────────────────────────────────────────────────────

  describe('updateProject', () => {
    it('replaces the updated project in the list', async () => {
      const original = makeProject({ id: 'proj-1', name: 'Original' });
      useProjectsStore.setState({ projects: [original] });

      const updated = makeProject({ id: 'proj-1', name: 'Renamed' });
      setMockResult({ data: updated });

      const result = await useProjectsStore.getState().updateProject('proj-1', { name: 'Renamed' });

      expect(result).toEqual(updated);
      expect(useProjectsStore.getState().projects[0].name).toBe('Renamed');
    });

    it('syncs selectedProject if the updated project is selected', async () => {
      const original = makeProject({ id: 'proj-1', name: 'Original' });
      useProjectsStore.setState({
        projects: [original],
        selectedProjectId: 'proj-1',
        selectedProject: original,
      });

      const updated = makeProject({ id: 'proj-1', name: 'Renamed' });
      setMockResult({ data: updated });

      await useProjectsStore.getState().updateProject('proj-1', { name: 'Renamed' });

      expect(useProjectsStore.getState().selectedProject?.name).toBe('Renamed');
    });

    it('returns null and sets error on failure', async () => {
      setMockResult({ data: null, error: { message: 'Update failed' } });

      const result = await useProjectsStore.getState().updateProject('proj-1', { name: 'Fail' });

      expect(result).toBeNull();
      expect(useProjectsStore.getState().error).toBe('Update failed');
    });
  });

  // ── deleteProject ──────────────────────────────────────────────────────────

  describe('deleteProject', () => {
    it('removes the project from the list', async () => {
      useProjectsStore.setState({ projects: [makeProject({ id: 'proj-1' }), makeProject({ id: 'proj-2' })] });
      setMockResult({ data: null, error: null });

      const result = await useProjectsStore.getState().deleteProject('proj-1');

      expect(result).toBe(true);
      expect(useProjectsStore.getState().projects).toHaveLength(1);
      expect(useProjectsStore.getState().projects[0].id).toBe('proj-2');
    });

    it('clears selection when the selected project is deleted', async () => {
      useProjectsStore.setState({
        projects: [makeProject({ id: 'proj-1' })],
        selectedProjectId: 'proj-1',
        selectedProject: makeProject({ id: 'proj-1' }),
      });
      setMockResult({ data: null, error: null });

      await useProjectsStore.getState().deleteProject('proj-1');

      expect(useProjectsStore.getState().selectedProjectId).toBeNull();
      expect(useProjectsStore.getState().selectedProject).toBeNull();
    });

    it('preserves selection of a different project', async () => {
      useProjectsStore.setState({
        projects: [makeProject({ id: 'proj-1' }), makeProject({ id: 'proj-2' })],
        selectedProjectId: 'proj-2',
        selectedProject: makeProject({ id: 'proj-2' }),
      });
      setMockResult({ data: null, error: null });

      await useProjectsStore.getState().deleteProject('proj-1');

      expect(useProjectsStore.getState().selectedProjectId).toBe('proj-2');
    });

    it('returns false and sets error on failure', async () => {
      setMockResult({ data: null, error: { message: 'Delete failed' } });

      const result = await useProjectsStore.getState().deleteProject('proj-1');

      expect(result).toBe(false);
      expect(useProjectsStore.getState().error).toBe('Delete failed');
    });
  });

  // ── selectProject ──────────────────────────────────────────────────────────

  describe('selectProject', () => {
    it('sets selected project by ID', () => {
      const project = makeProject({ id: 'proj-1' });
      useProjectsStore.setState({ projects: [project] });

      useProjectsStore.getState().selectProject('proj-1');

      expect(useProjectsStore.getState().selectedProjectId).toBe('proj-1');
      expect(useProjectsStore.getState().selectedProject).toEqual(project);
    });

    it('clears selection when passed null', () => {
      useProjectsStore.setState({
        projects: [makeProject()],
        selectedProjectId: 'proj-1',
        selectedProject: makeProject(),
      });

      useProjectsStore.getState().selectProject(null);

      expect(useProjectsStore.getState().selectedProjectId).toBeNull();
      expect(useProjectsStore.getState().selectedProject).toBeNull();
    });

    it('sets selectedProject to null for a nonexistent ID', () => {
      useProjectsStore.setState({ projects: [makeProject({ id: 'proj-1' })] });

      useProjectsStore.getState().selectProject('nonexistent');

      expect(useProjectsStore.getState().selectedProjectId).toBe('nonexistent');
      expect(useProjectsStore.getState().selectedProject).toBeNull();
    });
  });

  // ── filteredProjects ───────────────────────────────────────────────────────

  describe('filteredProjects', () => {
    const projectA = makeProject({ id: 'p1', name: 'Alpha', description: 'First project', priority: 1 });
    const projectB = makeProject({ id: 'p2', name: 'Beta', description: 'Second project', priority: 2 });
    const projectC = makeProject({ id: 'p3', name: 'Gamma', description: 'Alpha related', priority: 1 });

    beforeEach(() => {
      useProjectsStore.setState({ projects: [projectA, projectB, projectC], searchQuery: '', filterPriority: null });
    });

    it('returns all projects when no filters are set', () => {
      const result = useProjectsStore.getState().filteredProjects();
      expect(result).toEqual([projectA, projectB, projectC]);
    });

    it('filters by search query matching name', () => {
      useProjectsStore.setState({ searchQuery: 'beta' });
      const result = useProjectsStore.getState().filteredProjects();
      expect(result).toEqual([projectB]);
    });

    it('filters by search query matching description', () => {
      useProjectsStore.setState({ searchQuery: 'second' });
      const result = useProjectsStore.getState().filteredProjects();
      expect(result).toEqual([projectB]);
    });

    it('search is case-insensitive', () => {
      useProjectsStore.setState({ searchQuery: 'BETA' });
      const result = useProjectsStore.getState().filteredProjects();
      expect(result).toEqual([projectB]);
    });

    it('filters by priority', () => {
      useProjectsStore.setState({ filterPriority: 1 });
      const result = useProjectsStore.getState().filteredProjects();
      expect(result).toEqual([projectA, projectC]);
    });

    it('composes search and priority filters', () => {
      useProjectsStore.setState({ searchQuery: 'gamma', filterPriority: 1 });
      const result = useProjectsStore.getState().filteredProjects();
      expect(result).toEqual([projectC]);
    });

    it('returns empty array when nothing matches', () => {
      useProjectsStore.setState({ searchQuery: 'nonexistent' });
      const result = useProjectsStore.getState().filteredProjects();
      expect(result).toEqual([]);
    });

    it('returns all projects when filterPriority is null', () => {
      useProjectsStore.setState({ filterPriority: null });
      const result = useProjectsStore.getState().filteredProjects();
      expect(result).toEqual([projectA, projectB, projectC]);
    });

    it('skips projects with null description during search', () => {
      const noDesc = makeProject({ id: 'p4', name: 'Delta', description: null, priority: 3 });
      useProjectsStore.setState({ projects: [projectA, noDesc], searchQuery: 'first' });
      const result = useProjectsStore.getState().filteredProjects();
      expect(result).toEqual([projectA]);
    });
  });

  // ── archiveProject ─────────────────────────────────────────────────────────

  describe('archiveProject', () => {
    it('sets archived_at on the project', async () => {
      const project = makeProject({ id: 'proj-1' });
      useProjectsStore.setState({ projects: [project] });

      const archived = makeProject({ id: 'proj-1', archived_at: '2026-04-15T00:00:00Z' });
      setMockResult({ data: archived });

      const result = await useProjectsStore.getState().archiveProject('proj-1');

      expect(result).toEqual(archived);
      expect(useProjectsStore.getState().projects[0].archived_at).toBe('2026-04-15T00:00:00Z');
    });

    it('returns null on failure', async () => {
      setMockResult({ data: null, error: { message: 'Archive failed' } });

      const result = await useProjectsStore.getState().archiveProject('proj-1');

      expect(result).toBeNull();
      expect(useProjectsStore.getState().error).toBe('Archive failed');
    });
  });

  // ── unarchiveProject ───────────────────────────────────────────────────────

  describe('unarchiveProject', () => {
    it('clears archived_at on the project', async () => {
      const project = makeProject({ id: 'proj-1', archived_at: '2026-04-15T00:00:00Z' });
      useProjectsStore.setState({ projects: [project] });

      const unarchived = makeProject({ id: 'proj-1', archived_at: null });
      setMockResult({ data: unarchived });

      const result = await useProjectsStore.getState().unarchiveProject('proj-1');

      expect(result).toEqual(unarchived);
      expect(useProjectsStore.getState().projects[0].archived_at).toBeNull();
    });
  });

  // ── showArchived filter ────────────────────────────────────────────────────

  describe('showArchived', () => {
    const active = makeProject({ id: 'p1', name: 'Active' });
    const archived = makeProject({ id: 'p2', name: 'Archived', archived_at: '2026-04-15T00:00:00Z' });

    beforeEach(() => {
      useProjectsStore.setState({ projects: [active, archived], showArchived: false, searchQuery: '', filterPriority: null });
    });

    it('filters out archived projects by default', () => {
      const result = useProjectsStore.getState().filteredProjects();
      expect(result).toEqual([active]);
    });

    it('includes archived projects when showArchived is true', () => {
      useProjectsStore.getState().setShowArchived(true);
      const result = useProjectsStore.getState().filteredProjects();
      expect(result).toEqual([active, archived]);
    });

    it('composes with search filter', () => {
      useProjectsStore.getState().setShowArchived(true);
      useProjectsStore.setState({ searchQuery: 'archived' });
      const result = useProjectsStore.getState().filteredProjects();
      expect(result).toEqual([archived]);
    });
  });

  // ── clearError ─────────────────────────────────────────────────────────────

  describe('clearError', () => {
    it('resets error to null', () => {
      useProjectsStore.setState({ error: 'something broke' });

      useProjectsStore.getState().clearError();

      expect(useProjectsStore.getState().error).toBeNull();
    });
  });

  // ── subscribeToProjects ────────────────────────────────────────────────────

  describe('subscribeToProjects', () => {
    it('sets up a realtime channel and returns unsubscribe function', () => {
      const unsubscribe = useProjectsStore.getState().subscribeToProjects();

      expect(supabaseMock.channel).toHaveBeenCalledWith('muninn-projects');
      expect(supabaseMock.__channelMock.on).toHaveBeenCalled();
      expect(supabaseMock.__channelMock.subscribe).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
      expect(supabaseMock.removeChannel).toHaveBeenCalledTimes(1);
    });

    it('keeps one shared channel until the last subscriber unsubscribes', () => {
      const unsubscribeFirst = useProjectsStore.getState().subscribeToProjects();
      const unsubscribeSecond = useProjectsStore.getState().subscribeToProjects();

      expect(supabaseMock.channel).toHaveBeenCalledTimes(1);
      expect(supabaseMock.__channelMock.subscribe).toHaveBeenCalledTimes(1);

      unsubscribeFirst();
      expect(supabaseMock.removeChannel).not.toHaveBeenCalled();

      unsubscribeSecond();
      expect(supabaseMock.removeChannel).toHaveBeenCalledTimes(1);
    });

    it('allows cleanup to be called more than once safely', () => {
      const unsubscribe = useProjectsStore.getState().subscribeToProjects();

      unsubscribe();
      unsubscribe();

      expect(supabaseMock.removeChannel).toHaveBeenCalledTimes(1);
    });
  });
});
