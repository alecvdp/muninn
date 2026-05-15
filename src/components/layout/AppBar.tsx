import { House, Brain, Lightning, FolderOpen, Sparkle, Robot, Gear } from '@phosphor-icons/react';
import { useNavigate, useLocation } from 'react-router';
import { useEffect } from 'react';
import { useUIStore, type ActiveView } from '../../store/ui';

const navItems: { id: ActiveView; path: string; icon: React.ComponentType<{ size?: number; weight?: 'regular' | 'fill' }>; label: string }[] = [
  { id: 'overview', path: '/', icon: House, label: 'Overview' },
  { id: 'memories', path: '/memories', icon: Brain, label: 'Memories' },
  { id: 'sessions', path: '/sessions', icon: Lightning, label: 'Sessions' },
  { id: 'projects', path: '/projects', icon: FolderOpen, label: 'Projects' },
  { id: 'insights', path: '/insights', icon: Sparkle, label: 'Insights' },
  { id: 'tools', path: '/tools', icon: Robot, label: 'Tools' },
  { id: 'settings', path: '/settings', icon: Gear, label: 'Settings' },
];

const pathToView: Record<string, ActiveView> = {
  '/': 'overview',
  '/memories': 'memories',
  '/sessions': 'sessions',
  '/projects': 'projects',
  '/insights': 'insights',
  '/tools': 'tools',
  '/settings': 'settings',
};

export function AppBar() {
  const activeView = useUIStore((s) => s.activeView);
  const setView = useUIStore((s) => s.setView);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const view = pathToView[location.pathname];
    if (view && view !== activeView) {
      setView(view);
    }
  }, [location.pathname, activeView, setView]);

  return (
    <nav aria-label="Main navigation" className="w-12 h-screen bg-muted flex flex-col items-center py-4 border-r border-border">
      <div className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                setView(item.id);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-brand bg-elevated'
                  : 'text-low hover:text-normal hover:bg-elevated'
              }`}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
            </button>
          );
        })}
      </div>
      <div className="text-[10px] text-low mt-auto">Muninn</div>
    </nav>
  );
}
