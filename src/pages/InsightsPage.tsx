import { useEffect } from 'react';
import { useInsightsStore } from '../store/insights';
import type { InsightRow } from '../types';
import { CaretDown, CaretRight } from '@phosphor-icons/react';

const INSIGHT_TYPES = ['pattern', 'trend', 'prediction', 'connection'];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function InsightsPage() {
  const {
    insights,
    isLoading,
    isFetchingMore,
    hasMore,
    error,
    filterType,
    filterConfidence,
    selectedInsightId,
    fetchInsights,
    fetchMoreInsights,
    setFilterType,
    setFilterConfidence,
    selectInsight,
  } = useInsightsStore();

  useEffect(() => {
    void fetchInsights();
  }, [fetchInsights]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border">
        <FilterSelect
          label="Type"
          value={filterType}
          onChange={setFilterType}
          options={INSIGHT_TYPES}
        />
        <FilterSelect
          label="Confidence"
          value={filterConfidence}
          onChange={setFilterConfidence}
          options={['high', 'medium', 'low']}
        />
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-2">
        {error && (
          <div className="bg-error/10 border border-error/30 text-error rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        {isLoading && insights.length === 0 && (
          <div className="text-low text-sm">Loading insights…</div>
        )}

        {!isLoading && insights.length === 0 && (
          <div className="text-low text-sm italic">No derived insights yet.</div>
        )}

        {insights.map((i) => (
          <InsightRowItem
            key={i.id}
            insight={i}
            isOpen={selectedInsightId === i.id}
            onToggle={() => selectInsight(selectedInsightId === i.id ? null : i.id)}
          />
        ))}

        {hasMore && insights.length > 0 && (
          <div className="flex justify-center py-4">
            <button
              onClick={() => void fetchMoreInsights()}
              disabled={isFetchingMore}
              className="px-4 py-2 text-sm rounded-lg border border-border text-low hover:text-normal hover:bg-muted transition-colors disabled:opacity-50"
            >
              {isFetchingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  options: string[];
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-low text-xs">{label}:</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="bg-muted border border-border rounded-lg px-3 py-1 text-xs text-normal focus:outline-none focus:ring-1 focus:ring-brand"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function InsightRowItem({
  insight,
  isOpen,
  onToggle,
}: {
  insight: InsightRow;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const sourceMemoryCount = insight.source_memory_ids?.length ?? 0;
  const sourceSessionCount = insight.source_session_ids?.length ?? 0;

  return (
    <div className="bg-muted border border-border rounded-lg">
      <button
        onClick={onToggle}
        className="w-full text-left p-3 flex items-start gap-3 hover:bg-elevated transition-colors rounded-lg"
        aria-expanded={isOpen}
      >
        <span className="text-low mt-0.5">
          {isOpen ? <CaretDown size={12} /> : <CaretRight size={12} />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-low mb-1 flex-wrap">
            <span className="px-1.5 py-0.5 bg-elevated rounded text-normal">{insight.insight_type}</span>
            {insight.confidence && <span>conf: {insight.confidence}</span>}
            <span>· {formatDate(insight.created_at)}</span>
            {(sourceMemoryCount > 0 || sourceSessionCount > 0) && (
              <span>
                from {sourceMemoryCount} mem · {sourceSessionCount} sess
              </span>
            )}
          </div>
          <div className={isOpen ? 'text-normal text-sm whitespace-pre-wrap' : 'text-normal text-sm line-clamp-2'}>
            {insight.content}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 pl-9 space-y-1 text-xs text-low">
          <div className="font-mono text-[10px]">id: {insight.id}</div>
          {sourceMemoryCount > 0 && (
            <div>
              <span className="font-medium">source memories:</span> {sourceMemoryCount}
            </div>
          )}
          {sourceSessionCount > 0 && (
            <div>
              <span className="font-medium">source sessions:</span> {sourceSessionCount}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
