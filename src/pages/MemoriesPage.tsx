import { useEffect } from 'react';
import { useMemoriesStore } from '../store/memories';
import type { MemoryRow } from '../types';
import { MagnifyingGlass, CaretDown, CaretRight } from '@phosphor-icons/react';

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

export default function MemoriesPage() {
  const {
    memories,
    isLoading,
    isFetchingMore,
    hasMore,
    error,
    search,
    filterCategory,
    filterConfidence,
    filterTag,
    availableCategories,
    availableTags,
    selectedMemoryId,
    fetchMemories,
    fetchMoreMemories,
    fetchFilterOptions,
    setSearch,
    setFilterCategory,
    setFilterConfidence,
    setFilterTag,
    selectMemory,
  } = useMemoriesStore();

  useEffect(() => {
    void fetchMemories();
    void fetchFilterOptions();
  }, [fetchMemories, fetchFilterOptions]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <MagnifyingGlass
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-low pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memory content…"
            className="w-full bg-muted border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm text-normal focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <FilterSelect
          label="Category"
          value={filterCategory}
          onChange={setFilterCategory}
          options={availableCategories}
        />
        <FilterSelect
          label="Confidence"
          value={filterConfidence}
          onChange={setFilterConfidence}
          options={['high', 'medium', 'low']}
        />
        <FilterSelect
          label="Tag"
          value={filterTag}
          onChange={setFilterTag}
          options={availableTags}
        />
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-2">
        {error && (
          <div className="bg-error/10 border border-error/30 text-error rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        {isLoading && memories.length === 0 && (
          <div className="text-low text-sm">Loading memories…</div>
        )}

        {!isLoading && memories.length === 0 && (
          <div className="text-low text-sm italic">No memories match the current filters.</div>
        )}

        {memories.map((m) => (
          <MemoryRowItem
            key={m.id}
            memory={m}
            isOpen={selectedMemoryId === m.id}
            onToggle={() => selectMemory(selectedMemoryId === m.id ? null : m.id)}
          />
        ))}

        {hasMore && memories.length > 0 && (
          <div className="flex justify-center py-4">
            <button
              onClick={() => void fetchMoreMemories()}
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

function MemoryRowItem({
  memory,
  isOpen,
  onToggle,
}: {
  memory: MemoryRow;
  isOpen: boolean;
  onToggle: () => void;
}) {
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
            <span className="px-1.5 py-0.5 bg-elevated rounded text-normal">{memory.category}</span>
            {memory.confidence && <span>conf: {memory.confidence}</span>}
            {memory.source && <span>via {memory.source}</span>}
            <span>· {formatDate(memory.created_at)}</span>
            {memory.superseded_by && (
              <span className="text-warning">superseded</span>
            )}
          </div>
          <div className={isOpen ? 'text-normal text-sm whitespace-pre-wrap' : 'text-normal text-sm line-clamp-2'}>
            {memory.content}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 pl-9 space-y-2 text-xs">
          {memory.tags && memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {memory.tags.map((t) => (
                <span key={t} className="px-1.5 py-0.5 bg-elevated rounded text-low">
                  #{t}
                </span>
              ))}
            </div>
          )}
          <div className="text-low font-mono text-[10px]">id: {memory.id}</div>
          {memory.project_id && (
            <div className="text-low font-mono text-[10px]">project_id: {memory.project_id}</div>
          )}
          {memory.updated_at && memory.updated_at !== memory.created_at && (
            <div className="text-low">updated {formatDate(memory.updated_at)}</div>
          )}
        </div>
      )}
    </div>
  );
}
