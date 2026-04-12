import { useState, useCallback, useRef, useEffect } from 'react';
import {
  LinkSimple,
  FolderOpen,
  ClockCounterClockwise,
  Brain,
  Tag,
  Lightning,
} from '@phosphor-icons/react';
import { useProjectsStore } from '../../store/projects';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../database.types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type SessionRow = Database['public']['Tables']['agent_sessions']['Row'];
type MemoryRow = Database['public']['Tables']['memories']['Row'];

const STATUS_OPTIONS = ['idea', 'todo', 'in-progress', 'paused', 'done'] as const;

const STATUS_COLORS: Record<string, string> = {
  idea: 'text-info',
  todo: 'text-brand',
  'in-progress': 'text-brand-hover',
  paused: 'text-low',
  done: 'text-success',
};

// ── Shared primitives ──────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium text-low uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

function InlineInput({
  value,
  onSave,
  className = '',
  placeholder,
  multiline = false,
}: {
  value: string;
  onSave: (val: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const commit = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (local.trim() !== value.trim()) onSave(local.trim());
  }, [local, value, onSave]);

  const scheduleCommit = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(commit, 600);
  }, [commit]);

  const shared = {
    value: local,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setLocal(e.target.value);
      scheduleCommit();
    },
    onBlur: commit,
    placeholder,
    className: `w-full bg-transparent border border-border rounded px-2 py-1.5 text-sm text-normal
      placeholder:text-low/40 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20
      transition-colors ${className}`,
  };

  return multiline ? (
    <textarea {...shared} rows={3} />
  ) : (
    <input {...shared} />
  );
}

// ── Sub-sections ───────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-medium ${STATUS_COLORS[status] ?? 'text-low'}`}>
      {status.replace('-', ' ')}
    </span>
  );
}

function SessionsList({ sessions }: { sessions: SessionRow[] }) {
  if (sessions.length === 0) {
    return <p className="text-xs text-low italic">No sessions yet</p>;
  }

  return (
    <ul className="space-y-2">
      {sessions.map((s) => (
        <li key={s.id} className="text-xs border border-border rounded-md p-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-normal font-medium">{s.interface}</span>
            <span className="text-low">
              {s.started_at
                ? new Date(s.started_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                : '—'}
            </span>
          </div>
          {s.summary && (
            <p className="text-low line-clamp-2">{s.summary}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

function MemoriesList({ memories }: { memories: MemoryRow[] }) {
  if (memories.length === 0) {
    return <p className="text-xs text-low italic">No memories yet</p>;
  }

  return (
    <ul className="space-y-2">
      {memories.map((m) => (
        <li key={m.id} className="text-xs border border-border rounded-md p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="px-1 py-0.5 bg-panel rounded text-low text-[10px]">{m.category}</span>
            {m.confidence && (
              <span className="text-[10px] text-low">{m.confidence}</span>
            )}
          </div>
          <p className="text-low line-clamp-3">{m.content}</p>
        </li>
      ))}
    </ul>
  );
}

// ── Tech stack tags editor ─────────────────────────────────────

function TechStackEditor({
  tags,
  onSave,
}: {
  tags: string[];
  onSave: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState(tags.join(', '));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(tags.join(', '));
  }, [tags]);

  const commit = () => {
    const next = draft
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (JSON.stringify(next) !== JSON.stringify(tags)) onSave(next);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-panel border border-border rounded-full text-low"
          >
            <Tag size={10} />
            {tag}
          </span>
        ))}
      </div>
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
        }}
        placeholder="react, typescript, …"
        className="w-full bg-transparent border border-border rounded px-2 py-1 text-xs text-normal
          placeholder:text-low/40 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20
          transition-colors"
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────

export function ProjectDetail() {
  const selectedProject = useProjectsStore((s) => s.selectedProject);
  const updateProject = useProjectsStore((s) => s.updateProject);

  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [memories, setMemories] = useState<MemoryRow[]>([]);

  useEffect(() => {
    if (!selectedProject) {
      setSessions([]);
      setMemories([]);
      return;
    }

    const fetchRelated = async () => {
      const [sessRes, memRes] = await Promise.all([
        supabase
          .from('agent_sessions')
          .select('*')
          .eq('project_id', selectedProject.id)
          .order('started_at', { ascending: false })
          .limit(5),
        supabase
          .from('memories')
          .select('*')
          .eq('project_id', selectedProject.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);
      setSessions((sessRes.data as SessionRow[] | null) ?? []);
      setMemories((memRes.data as MemoryRow[] | null) ?? []);
    };

    void fetchRelated();
  }, [selectedProject]);

  const handleSave = useCallback(
    (field: keyof ProjectRow, value: unknown) => {
      if (!selectedProject) return;
      void updateProject(selectedProject.id, { [field]: value });
    },
    [selectedProject, updateProject],
  );

  if (!selectedProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-low gap-2">
        <FolderOpen size={32} />
        <p className="text-sm">Select a project to view details</p>
      </div>
    );
  }

  const p = selectedProject;
  const techStack = p.tech_stack ?? [];

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────── */}
      <div>
        <InlineInput
          value={p.name}
          onSave={(v) => handleSave('name', v)}
          className="text-base font-semibold text-high"
          placeholder="Project name"
        />
      </div>

      {/* ── Status + Priority row ──────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Status</FieldLabel>
          <div className="relative">
            <select
              value={p.status}
              onChange={(e) => handleSave('status', e.target.value)}
              className="w-full appearance-none bg-transparent border border-border rounded px-2 py-1.5 text-sm text-normal
                focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-colors cursor-pointer"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-secondary text-normal">
                  {s.replace('-', ' ')}
                </option>
              ))}
            </select>
            <StatusBadge status={p.status} />
          </div>
        </div>
        <div>
          <FieldLabel>Priority</FieldLabel>
          <input
            type="number"
            min={0}
            max={5}
            value={p.priority ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : Number(e.target.value);
              handleSave('priority', val);
            }}
            onBlur={() => {}}
            placeholder="0–5"
            className="w-full bg-transparent border border-border rounded px-2 py-1.5 text-sm text-normal
              placeholder:text-low/40 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20
              transition-colors"
          />
        </div>
      </div>

      {/* ── Description ────────────────────────────────── */}
      <div>
        <FieldLabel>Description</FieldLabel>
        <InlineInput
          value={p.description ?? ''}
          onSave={(v) => handleSave('description', v || null)}
          multiline
          placeholder="What is this project about?"
        />
      </div>

      {/* ── Tech stack ─────────────────────────────────── */}
      <div>
        <FieldLabel>Tech Stack</FieldLabel>
        <TechStackEditor
          tags={techStack}
          onSave={(tags) => handleSave('tech_stack', tags.length > 0 ? tags : null)}
        />
      </div>

      {/* ── Links row ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Repo URL</FieldLabel>
          {p.repo_url ? (
            <a
              href={p.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-brand hover:text-brand-hover transition-colors"
            >
              <LinkSimple size={14} />
              <span className="truncate">{p.repo_url.replace(/^https?:\/\//, '')}</span>
            </a>
          ) : (
            <span className="text-xs text-low">—</span>
          )}
        </div>
        <div>
          <FieldLabel>Local Path</FieldLabel>
          <span className="text-xs text-low font-mono">{p.local_path ?? '—'}</span>
        </div>
      </div>

      {/* ── Context ────────────────────────────────────── */}
      {p.context && (
        <div>
          <FieldLabel>Context</FieldLabel>
          <p className="text-xs text-low leading-relaxed">{p.context}</p>
        </div>
      )}

      {/* ── Sessions ───────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Lightning size={14} className="text-low" />
          <FieldLabel>Recent Sessions</FieldLabel>
        </div>
        <SessionsList sessions={sessions} />
      </div>

      {/* ── Memories ───────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Brain size={14} className="text-low" />
          <FieldLabel>Recent Memories</FieldLabel>
        </div>
        <MemoriesList memories={memories} />
      </div>

      {/* ── Timestamps ─────────────────────────────────── */}
      <div className="flex items-center justify-between text-[11px] text-low pt-3 border-t border-border">
        <div className="flex items-center gap-1">
          <ClockCounterClockwise size={12} />
          <span>Created {formatDate(p.created_at)}</span>
        </div>
        <span>Updated {formatDate(p.updated_at)}</span>
      </div>
    </div>
  );
}
