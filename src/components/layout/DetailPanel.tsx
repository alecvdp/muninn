import { useCallback, useEffect, useRef } from 'react';
import { X } from '@phosphor-icons/react';
import { useUIStore } from '../../store/ui';
import { useProjectsStore } from '../../store/projects';
import { useToolsStore } from '../../store/tools';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function DetailPanel({ children }: { children?: React.ReactNode }) {
  const isPanelOpen = useUIStore((s) => s.isPanelOpen);
  const closePanel = useUIStore((s) => s.closePanel);
  const selectProject = useProjectsStore((s) => s.selectProject);
  const selectTool = useToolsStore((s) => s.selectTool);
  const panelRef = useRef<HTMLElement>(null);

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

  // Focus trap: keep Tab cycling within the panel
  useEffect(() => {
    if (!isPanelOpen) return;

    const panel = panelRef.current;
    if (!panel) return;

    // Focus the close button when the panel opens
    const closeBtn = panel.querySelector<HTMLElement>('button[aria-label="Close panel"]');
    closeBtn?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    panel.addEventListener('keydown', handleTab);
    return () => panel.removeEventListener('keydown', handleTab);
  }, [isPanelOpen]);

  if (!isPanelOpen) return null;

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-label="Details"
      className="h-full bg-muted border-l border-border flex flex-col w-[440px] min-w-[360px] max-w-[600px]"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="text-normal font-medium">Details</span>
        <button
          onClick={handleClose}
          aria-label="Close panel"
          className="p-1 rounded text-low hover:text-normal hover:bg-elevated transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>
    </aside>
  );
}
