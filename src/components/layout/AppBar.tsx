import { Kanban, Robot, Lightning, Gear } from '@phosphor-icons/react';
import { useNavigate } from 'react-router';
import { useUIStore } from '../../store/ui';

const navItems = [
  { id: 'board' as const, path: '/', icon: Kanban, label: 'Board' },
  { id: 'tools' as const, path: '/tools', icon: Robot, label: 'Tools' },
  { id: 'agents' as const, path: '/agents', icon: Lightning, label: 'Agents' },
  { id: 'settings' as const, path: '/settings', icon: Gear, label: 'Settings' },
];

export function AppBar() {
  const activeView = useUIStore((s) => s.activeView);
  const setView = useUIStore((s) => s.setView);
  const navigate = useNavigate();

  return (
    <div className="w-12 h-screen bg-muted flex flex-col items-center py-4 border-r border-border">
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
            >
              <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
            </button>
          );
        })}
      </div>
      <div className="text-[10px] text-low mt-auto">Muninn</div>
    </div>
  );
}
