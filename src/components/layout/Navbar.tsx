import { Sun, Moon } from '@phosphor-icons/react';
import { useUIStore } from '../../store/ui';

const viewTitles: Record<string, string> = {
  board: 'Board',
  tools: 'Tools',
  agents: 'Agents',
  settings: 'Settings',
};

export function Navbar() {
  const { activeView, theme, toggleTheme } = useUIStore();

  return (
    <header className="h-12 bg-muted border-b border-border flex items-center justify-between px-4">
      <h1 className="text-normal font-medium">{viewTitles[activeView]}</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-low hover:text-normal hover:bg-elevated transition-colors"
          title="Toggle theme"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
