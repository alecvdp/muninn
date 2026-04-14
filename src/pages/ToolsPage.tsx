import { useEffect, useMemo } from 'react';
import { Plus, MagnifyingGlass } from '@phosphor-icons/react';
import { ToolsGrid } from '../components/tools/ToolsGrid';
import { useToolsStore } from '../store/tools';
import { useUIStore } from '../store/ui';

const categories = ['using', 'to-check-out'];

export default function ToolsPage() {
  const {
    tools, fetchTools, subscribeToTools, isLoading,
    totalMonthlyCost, totalAnnualCost, activeToolCount, renewingWithin30Days,
    selectTool, filteredTools,
    searchQuery, setSearchQuery,
    filterCategory, setFilterCategory,
    filterPlatform, setFilterPlatform,
  } = useToolsStore();
  const openPanel = useUIStore((s) => s.openPanel);

  useEffect(() => {
    void fetchTools();
    const cleanup = subscribeToTools();
    return cleanup;
  }, [fetchTools, subscribeToTools]);

  const availablePlatforms = useMemo(() => {
    const platforms = new Set<string>();
    tools.forEach((t) => t.platform?.forEach((p) => platforms.add(p)));
    return Array.from(platforms).sort();
  }, [tools]);

  const visibleTools = filteredTools();

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

      {/* Header with search and filters */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-normal font-medium">AI Tools</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-low" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted border border-border rounded-lg pl-8 pr-3 py-1 text-xs text-normal placeholder:text-low focus:outline-none focus:ring-1 focus:ring-brand w-48"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-low text-xs">Category:</label>
            <select
              value={filterCategory || ''}
              onChange={(e) => setFilterCategory(e.target.value || null)}
              className="bg-muted border border-border rounded-lg px-3 py-1 text-xs text-normal focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-low text-xs">Platform:</label>
            <select
              value={filterPlatform || ''}
              onChange={(e) => setFilterPlatform(e.target.value || null)}
              className="bg-muted border border-border rounded-lg px-3 py-1 text-xs text-normal focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">All</option>
              {availablePlatforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { selectTool('new'); openPanel(); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand text-white rounded-lg text-sm hover:bg-brand-hover transition-colors"
          >
            <Plus size={16} />
            Add Tool
          </button>
        </div>
      </div>

      {/* Tools Grid */}
      {isLoading && tools.length === 0 ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-low">Loading tools...</div>
        </div>
      ) : tools.length > 0 && visibleTools.length === 0 ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-low">No matching tools</div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <ToolsGrid tools={visibleTools} />
        </div>
      )}
    </div>
  );
}
