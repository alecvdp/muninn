import { useCallback, useEffect } from 'react';
import { X } from '@phosphor-icons/react';
import { useUIStore } from '../../store/ui';
import { useProjectsStore } from '../../store/projects';
import { useToolsStore } from '../../store/tools';

export function DetailPanel({ children }: { children?: React.ReactNode }) {
  const isPanelOpen = useUIStore((s) => s.isPanelOpen);
  const closePanel = useUIStore((s) => s.closePanel);
  const selectProject = useProjectsStore((s) => s.selectProject);
  const selectTool = useToolsStore((s) => s.selectTool);

  const handleClose = useCallback(() => {
    closePanel();
    selectProject(null);
    selectTool(null);
  }, [closePanel, selectProject, selectTool]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPanelOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isPanelOpen, handleClose]);

  if (!isPanelOpen) return null;

  return (
    <div className="h-full bg-muted border-l border-border flex flex-col w-[440px] min-w-[360px] max-w-[600px]">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="text-normal font-medium">Details</span>
        <button
          onClick={handleClose}
          className="p-1 rounded text-low hover:text-normal hover:bg-elevated transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>
    </div>
  );
}
