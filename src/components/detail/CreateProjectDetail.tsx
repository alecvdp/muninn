import { useState } from 'react';
import { FolderPlus } from '@phosphor-icons/react';
import { useProjectsStore } from '../../store/projects';
import { useUIStore } from '../../store/ui';

const STATUS_OPTIONS = ['idea', 'todo', 'in-progress', 'paused', 'done'] as const;

export function CreateProjectDetail() {
  const createProject = useProjectsStore((s) => s.createProject);
  const selectProject = useProjectsStore((s) => s.selectProject);
  const closePanel = useUIStore((s) => s.closePanel);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('idea');
  const [priority, setPriority] = useState('');
  const [techStack, setTechStack] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsSaving(true);

    const tags = techStack
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const project = await createProject({
        name: name.trim(),
        description: description.trim() || null,
        status,
        board_status: status,
        board_position: 0,
        priority: priority ? Number(priority) : null,
        tech_stack: tags.length > 0 ? tags : null,
      });

      if (project) {
        selectProject(project.id);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    selectProject(null);
    closePanel();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-normal">
        <FolderPlus size={20} />
        <h3 className="font-medium">New Project</h3>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-low uppercase tracking-wider mb-1.5">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          autoFocus
          className="w-full bg-transparent border border-border rounded px-2 py-1.5 text-sm text-normal
            placeholder:text-low/40 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20
            transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-low uppercase tracking-wider mb-1.5">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full appearance-none bg-transparent border border-border rounded px-2 py-1.5 text-sm text-normal
              focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-colors cursor-pointer"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-muted text-normal">
                {s.replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-low uppercase tracking-wider mb-1.5">
            Priority
          </label>
          <input
            type="number"
            min={0}
            max={5}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            placeholder="0–5"
            className="w-full bg-transparent border border-border rounded px-2 py-1.5 text-sm text-normal
              placeholder:text-low/40 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20
              transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-low uppercase tracking-wider mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this project about?"
          rows={3}
          className="w-full bg-transparent border border-border rounded px-2 py-1.5 text-sm text-normal
            placeholder:text-low/40 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20
            transition-colors"
        />
      </div>

      <div>
        <label className="block text-[11px] font-medium text-low uppercase tracking-wider mb-1.5">
          Tech Stack
        </label>
        <input
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          placeholder="react, typescript, …"
          className="w-full bg-transparent border border-border rounded px-2 py-1.5 text-xs text-normal
            placeholder:text-low/40 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20
            transition-colors"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => void handleCreate()}
          disabled={!name.trim() || isSaving}
          className="flex-1 px-3 py-2 bg-brand text-white rounded-lg text-sm font-medium
            hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Creating…' : 'Create Project'}
        </button>
        <button
          onClick={handleCancel}
          className="px-3 py-2 text-low hover:text-normal text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
