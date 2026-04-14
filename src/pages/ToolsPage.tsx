import { useEffect } from 'react';
import { Plus } from '@phosphor-icons/react';
import { ToolsGrid } from '../components/tools/ToolsGrid';
import { useToolsStore } from '../store/tools';
import { useUIStore } from '../store/ui';

export default function ToolsPage() {
  const { tools, fetchTools, subscribeToTools, isLoading, totalMonthlyCost, totalAnnualCost, activeToolCount, renewingWithin30Days, selectTool } = useToolsStore();
  const openPanel = useUIStore((s) => s.openPanel);

  useEffect(() => {
    void fetchTools();
    const cleanup = subscribeToTools();
    return cleanup;
  }, [fetchTools, subscribeToTools]);

  return (
    <div className="h-full flex flex-col">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 py-4 border-b border-border">
        <div className="bg-muted rounded-lg p-3">
          <div className="text-low text-xs mb-1">Monthly Cost</div>
          <div className="text-normal font-medium">${totalMonthlyCost().toFixed(0)}</div>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <div className="text-low text-xs mb-1">Annual Cost</div>
          <div className="text-normal font-medium">${totalAnnualCost().toFixed(0)}</div>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <div className="text-low text-xs mb-1">Active Tools</div>
          <div className="text-normal font-medium">{activeToolCount()}</div>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <div className="text-low text-xs mb-1">Renewing Soon</div>
          <div className={`font-medium ${renewingWithin30Days() > 0 ? 'text-orange-400' : 'text-normal'}`}>
            {renewingWithin30Days()}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-normal font-medium">AI Tools</h2>
        <button
          onClick={() => { selectTool('new'); openPanel(); }}
          className="flex items-center gap-2 px-3 py-1.5 bg-brand text-white rounded-lg text-sm hover:bg-brand-hover transition-colors"
        >
          <Plus size={16} />
          Add Tool
        </button>
      </div>

      {/* Tools Grid */}
      {isLoading && tools.length === 0 ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-low">Loading tools...</div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <ToolsGrid tools={tools} />
        </div>
      )}
    </div>
  );
}
