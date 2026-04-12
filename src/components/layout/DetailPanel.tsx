import { useEffect } from 'react';
import { XIcon } from '@phosphor-icons/react';
import { useUIStore } from '../../store/ui';

export function DetailPanel({ children }: { children?: React.ReactNode }) {
  const { isPanelOpen, togglePanel } = useUIStore();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPanelOpen) {
        togglePanel();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isPanelOpen, togglePanel]);

  if (!isPanelOpen) return null;

  return (
    <div className="h-full bg-muted border-l border-border flex flex-col w-[440px] min-w-[360px] max-w-[600px]">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="text-normal font-medium">Details</span>
        <button
          onClick={togglePanel}
          className="p-1 rounded text-low hover:text-normal hover:bg-elevated transition-colors"
        >
          <XIcon size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>
    </div>
  );
}
