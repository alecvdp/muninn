import { useEffect, useRef } from 'react';
import { X } from '@phosphor-icons/react';
import { useProjectsStore } from '../../store/projects';
import { useToolsStore } from '../../store/tools';
import { useSessionsStore } from '../../store/sessions';

export function ErrorToast() {
  const projectError = useProjectsStore((s) => s.error);
  const toolError = useToolsStore((s) => s.error);
  const sessionError = useSessionsStore((s) => s.error);
  const clearProjectError = useProjectsStore((s) => s.clearError);
  const clearToolError = useToolsStore((s) => s.clearError);
  const clearSessionError = useSessionsStore((s) => s.clearError);

  const error = projectError ?? toolError ?? sessionError ?? null;
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (!error) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      clearProjectError();
      clearToolError();
      clearSessionError();
    }, 6000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [error, clearProjectError, clearToolError, clearSessionError]);

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    clearProjectError();
    clearToolError();
    clearSessionError();
  };

  if (!error) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
      <div className="bg-error/90 text-white rounded-lg shadow-lg px-4 py-3 flex items-start gap-3">
        <p className="text-sm flex-1">{error}</p>
        <button
          onClick={handleDismiss}
          className="p-0.5 hover:bg-white/20 rounded transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
