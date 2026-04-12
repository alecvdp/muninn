import { useUIStore } from '../store/ui';

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]">
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8Z" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <ellipse cx="12" cy="5" rx="7" ry="3" />
      <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </svg>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useUIStore();

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-normal font-medium text-lg mb-6">Settings</h2>

      <div className="bg-secondary rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <div>
            <div className="text-normal font-medium">Supabase Connected</div>
            <div className="text-low text-sm">Firmament database is reachable</div>
          </div>
          <DatabaseIcon aria-hidden="true" />
        </div>
      </div>

      <div className="bg-secondary rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-normal font-medium">Theme</div>
            <div className="text-low text-sm">
              {theme === 'dark' ? 'Dark mode is enabled' : 'Light mode is enabled'}
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 bg-panel rounded-lg text-low hover:text-normal transition-colors"
          >
            {theme === 'dark' ? <MoonIcon aria-hidden="true" /> : <SunIcon aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="text-low text-sm mt-8">
        <p>Muninn v1.0.0</p>
        <p className="mt-1">Personal project workbench for solo vibe coding.</p>
      </div>
    </div>
  );
}
