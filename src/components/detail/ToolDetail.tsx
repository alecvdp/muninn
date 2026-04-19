import { useMemo, useState } from 'react';
import { useToolsStore } from '../../store/tools';
import { useUIStore } from '../../store/ui';
import { X, Check, Trash } from '@phosphor-icons/react';

const platforms = ['mac', 'linux', 'windows', 'web', 'ios', 'android'];

type ToolFormData = {
  name: string;
  category: 'using' | 'to-check-out' | 'not-using' | 'watching' | 'trial';
  active_subscription: boolean;
  cost: number;
  billing_cycle: 'monthly' | 'annual' | 'one-time';
  bill_day: number | null;
  renewal_date: string;
  platform: string[];
  url: string;
  tags: string[];
  notes: string;
};

function deriveFormData(tool: { name: string | null; category: string | null; active_subscription?: boolean | null; cost: number | null; billing_cycle: string | null; bill_day?: number | null; renewal_date: string | null; platform: string[] | null; url: string | null; tags: string[] | null; notes: string | null } | null): ToolFormData {
  if (!tool) {
    return {
      name: '',
      category: 'to-check-out',
      active_subscription: false,
      cost: 0,
      billing_cycle: 'monthly',
      bill_day: null,
      renewal_date: '',
      platform: [],
      url: '',
      tags: [],
      notes: '',
    };
  }
  return {
    name: tool.name || '',
    category: (tool.category as ToolFormData['category']) || 'to-check-out',
    active_subscription: tool.active_subscription ?? false,
    cost: tool.cost || 0,
    billing_cycle: (tool.billing_cycle as 'monthly' | 'annual' | 'one-time') || 'monthly',
    bill_day: tool.bill_day ?? null,
    renewal_date: tool.renewal_date || '',
    platform: tool.platform || [],
    url: tool.url || '',
    tags: tool.tags || [],
    notes: tool.notes || '',
  };
}

export function ToolDetail() {
  const { selectedTool, selectedToolId, updateTool, createTool, deleteTool, selectTool } = useToolsStore();
  const closePanel = useUIStore((s) => s.closePanel);
  const isNew = selectedToolId === 'new';

  const initialFormData = useMemo(
    () => deriveFormData(isNew ? null : selectedTool),
    [selectedTool, isNew],
  );

  const [formData, setFormData] = useState<ToolFormData>(initialFormData);
  const [tagsDraft, setTagsDraft] = useState(initialFormData.tags.join(', '));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});

  const validate = (): boolean => {
    const next: { name?: string; url?: string } = {};
    if (!formData.name.trim()) next.name = 'Tool name is required';
    if (formData.url.trim()) {
      try {
        new URL(formData.url.trim());
      } catch {
        next.url = 'Enter a valid URL (e.g. https://example.com)';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    const payload = {
      ...formData,
      renewal_date: formData.renewal_date || null,
      bill_day: formData.bill_day || null,
    };
    let result;
    if (isNew) {
      result = await createTool(payload as Parameters<typeof createTool>[0]);
    } else if (selectedToolId) {
      result = await updateTool(selectedToolId, payload as Parameters<typeof updateTool>[1]);
    }
    setIsSaving(false);
    if (result) {
      selectTool(null);
      closePanel();
    }
  };

  const handleDelete = async () => {
    if (selectedToolId && !isNew) {
      const success = await deleteTool(selectedToolId);
      if (success) {
        selectTool(null);
        closePanel();
      }
    }
  };

  const handleClose = () => {
    selectTool(null);
    closePanel();
  };

  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platform: prev.platform.includes(platform)
        ? prev.platform.filter((p) => p !== platform)
        : [...prev.platform, platform],
    }));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-normal font-medium">{isNew ? 'New Tool' : 'Edit Tool'}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => void handleSave()}
            aria-label="Save tool"
            disabled={isSaving}
            className="p-2 bg-brand text-white rounded-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={18} />
          </button>
          <button
            onClick={handleClose}
            aria-label="Close panel"
            className="p-2 text-low hover:text-normal hover:bg-elevated rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="tool-name" className="text-low text-xs block mb-1">Name *</label>
        <input
          id="tool-name"
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          aria-invalid={!!errors.name}
          className={`w-full bg-muted border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 ${
            errors.name
              ? 'border-error focus:ring-error/20'
              : 'border-border focus:ring-brand'
          }`}
          placeholder="Tool name"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-error">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="tool-category" className="text-low text-xs block mb-1">Category</label>
        <select
          id="tool-category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as ToolFormData['category'] })}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="using">Using</option>
          <option value="trial">Trial</option>
          <option value="to-check-out">To Check Out</option>
          <option value="not-using">Not Using</option>
          <option value="watching">Watching</option>
        </select>
      </div>

      {formData.category === 'trial' && (
        <div>
          <label htmlFor="tool-trial-end" className="text-low text-xs block mb-1">Trial End Date</label>
          <input
            id="tool-trial-end"
            type="date"
            value={formData.renewal_date}
            onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <p className="mt-1 text-[11px] text-low">When the trial period ends (billing may start)</p>
        </div>
      )}

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.active_subscription}
            onChange={(e) => setFormData({ ...formData, active_subscription: e.target.checked })}
            className="rounded border-border text-brand focus:ring-brand"
          />
          <span className="text-normal text-sm">Active Subscription</span>
        </label>
      </div>

      <div className={`grid grid-cols-2 gap-2 ${!formData.active_subscription ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div>
          <label htmlFor="tool-cost" className="text-low text-xs block mb-1">Cost</label>
          <input
            id="tool-cost"
            type="number"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
            disabled={!formData.active_subscription}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label htmlFor="tool-billing" className="text-low text-xs block mb-1">Billing</label>
          <select
            id="tool-billing"
            value={formData.billing_cycle}
            onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value as ToolFormData['billing_cycle'] })}
            disabled={!formData.active_subscription}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed"
          >
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
            <option value="one-time">One-time</option>
          </select>
        </div>
      </div>

      {formData.billing_cycle === 'monthly' ? (
        <div className={!formData.active_subscription ? 'opacity-50 cursor-not-allowed' : ''}>
          <label htmlFor="tool-bill-day" className="text-low text-xs block mb-1">Bill Day (1–31)</label>
          <input
            id="tool-bill-day"
            type="number"
            min={1}
            max={31}
            value={formData.bill_day ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : Math.min(31, Math.max(1, parseInt(e.target.value, 10)));
              setFormData({ ...formData, bill_day: val });
            }}
            disabled={!formData.active_subscription}
            placeholder="e.g. 17"
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-[11px] text-low">Renewal auto-advances each month</p>
        </div>
      ) : (
        <div className={!formData.active_subscription ? 'opacity-50 cursor-not-allowed' : ''}>
          <label htmlFor="tool-renewal-date" className="text-low text-xs block mb-1">Renewal Date</label>
          <input
            id="tool-renewal-date"
            type="date"
            value={formData.renewal_date}
            onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
            disabled={!formData.active_subscription}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed"
          />
        </div>
      )}

      <div>
        <span id="tool-platforms-label" className="text-low text-xs block mb-2">Platforms</span>
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby="tool-platforms-label">
          {platforms.map((platform) => (
            <button
              key={platform}
              onClick={() => togglePlatform(platform)}
              aria-pressed={formData.platform.includes(platform)}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors ${
                formData.platform.includes(platform)
                  ? 'bg-brand text-white'
                  : 'bg-muted text-low hover:bg-elevated'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="tool-url" className="text-low text-xs block mb-1">URL</label>
        <input
          id="tool-url"
          type="url"
          value={formData.url}
          onChange={(e) => {
            setFormData({ ...formData, url: e.target.value });
            if (errors.url) setErrors((prev) => ({ ...prev, url: undefined }));
          }}
          aria-invalid={!!errors.url}
          className={`w-full bg-muted border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 ${
            errors.url
              ? 'border-error focus:ring-error/20'
              : 'border-border focus:ring-brand'
          }`}
          placeholder="https://..."
        />
        {errors.url && (
          <p className="mt-1 text-xs text-error">{errors.url}</p>
        )}
      </div>

      <div>
        <label htmlFor="tool-tags" className="text-low text-xs block mb-1">Tags (comma-separated)</label>
        <input
          id="tool-tags"
          type="text"
          value={tagsDraft}
          onChange={(e) => setTagsDraft(e.target.value)}
          onBlur={() => setFormData({ ...formData, tags: tagsDraft.split(',').map((t) => t.trim()).filter(Boolean) })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setFormData({ ...formData, tags: tagsDraft.split(',').map((t) => t.trim()).filter(Boolean) });
          }}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          placeholder="AI, productivity, writing"
        />
      </div>

      <div>
        <label htmlFor="tool-notes" className="text-low text-xs block mb-1">Notes</label>
        <textarea
          id="tool-notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 focus:ring-brand h-24 resize-none"
          placeholder="Notes about this tool..."
        />
      </div>

      {!isNew && (
        <div className="pt-3 border-t border-border">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-error">Delete this tool?</span>
              <button
                onClick={() => void handleDelete()}
                className="px-3 py-1 text-xs bg-error text-white rounded hover:opacity-90 transition-opacity"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1 text-xs text-low hover:text-normal transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-xs text-low hover:text-error transition-colors"
            >
              <Trash size={14} />
              Delete tool
            </button>
          )}
        </div>
      )}
    </div>
  );
}
