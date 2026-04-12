import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  selectedProjectId: string | null;
  selectedToolId: string | null;
  isPanelOpen: boolean;
  activeView: 'board' | 'tools' | 'agents' | 'settings';
  theme: 'dark' | 'light';
  selectProject: (id: string | null) => void;
  selectTool: (id: string | null) => void;
  togglePanel: () => void;
  setView: (view: UIState['activeView']) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
  devtools((set) => ({
    selectedProjectId: null,
    selectedToolId: null,
    isPanelOpen: false,
    activeView: 'board',
    theme: 'dark',
    selectProject: (id) => set({ selectedProjectId: id, isPanelOpen: id !== null }, false, 'ui/selectProject'),
    selectTool: (id) => set({ selectedToolId: id, isPanelOpen: id !== null }, false, 'ui/selectTool'),
    togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen }), false, 'ui/togglePanel'),
    setView: (view) => set({ activeView: view }, false, 'ui/setView'),
    toggleTheme: () =>
      set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' }), false, 'ui/toggleTheme'),
  }), { name: 'ui-store' }),
);
