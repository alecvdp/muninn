import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../ui';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      isPanelOpen: false,
      activeView: 'overview',
      theme: 'dark',
      projectsViewMode: 'list',
    });
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  it('has correct initial state', () => {
    const state = useUIStore.getState();
    expect(state.isPanelOpen).toBe(false);
    expect(state.activeView).toBe('overview');
    expect(state.theme).toBe('dark');
    expect(state.projectsViewMode).toBe('list');
  });

  // ── Panel ──────────────────────────────────────────────────────────────────

  describe('panel', () => {
    it('opens the panel', () => {
      useUIStore.getState().openPanel();
      expect(useUIStore.getState().isPanelOpen).toBe(true);
    });

    it('closes the panel', () => {
      useUIStore.setState({ isPanelOpen: true });
      useUIStore.getState().closePanel();
      expect(useUIStore.getState().isPanelOpen).toBe(false);
    });
  });

  // ── View ───────────────────────────────────────────────────────────────────

  describe('setView', () => {
    it('changes the active view', () => {
      useUIStore.getState().setView('tools');
      expect(useUIStore.getState().activeView).toBe('tools');
    });

    it('cycles through all views', () => {
      const views = ['overview', 'memories', 'sessions', 'projects', 'insights', 'tools', 'settings'] as const;
      for (const view of views) {
        useUIStore.getState().setView(view);
        expect(useUIStore.getState().activeView).toBe(view);
      }
    });
  });

  // ── Projects view mode ─────────────────────────────────────────────────────

  describe('setProjectsViewMode', () => {
    it('switches to kanban', () => {
      useUIStore.getState().setProjectsViewMode('kanban');
      expect(useUIStore.getState().projectsViewMode).toBe('kanban');
    });

    it('switches back to list', () => {
      useUIStore.setState({ projectsViewMode: 'kanban' });
      useUIStore.getState().setProjectsViewMode('list');
      expect(useUIStore.getState().projectsViewMode).toBe('list');
    });
  });

  // ── Theme ──────────────────────────────────────────────────────────────────

  describe('toggleTheme', () => {
    it('toggles from dark to light', () => {
      useUIStore.getState().toggleTheme();
      expect(useUIStore.getState().theme).toBe('light');
    });

    it('toggles from light to dark', () => {
      useUIStore.setState({ theme: 'light' });
      useUIStore.getState().toggleTheme();
      expect(useUIStore.getState().theme).toBe('dark');
    });

    it('applies theme to document element', () => {
      useUIStore.getState().toggleTheme();
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });
});
