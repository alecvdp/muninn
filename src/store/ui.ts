import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type ActiveView =
  | 'overview'
  | 'memories'
  | 'sessions'
  | 'projects'
  | 'insights'
  | 'tools'
  | 'settings';

interface UIState {
  isPanelOpen: boolean;
  activeView: ActiveView;
  theme: 'dark' | 'light';
  openPanel: () => void;
  closePanel: () => void;
  setView: (view: UIState['activeView']) => void;
  toggleTheme: () => void;
}

const applyTheme = (theme: 'dark' | 'light') => {
  document.documentElement.setAttribute('data-theme', theme);
};

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        isPanelOpen: false,
        activeView: 'overview',
        theme: 'dark',
        openPanel: () => set({ isPanelOpen: true }, false, 'ui/openPanel'),
        closePanel: () => set({ isPanelOpen: false }, false, 'ui/closePanel'),
        setView: (view) => set({ activeView: view }, false, 'ui/setView'),
        toggleTheme: () =>
          set((state) => {
            const next = state.theme === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            return { theme: next };
          }, false, 'ui/toggleTheme'),
      }),
      {
        name: 'muninn-ui',
        partialize: (state) => ({ theme: state.theme }),
      },
    ),
    { name: 'ui-store' },
  ),
);

// Apply persisted theme on load
applyTheme(useUIStore.getState().theme);
useUIStore.subscribe((state) => applyTheme(state.theme));
