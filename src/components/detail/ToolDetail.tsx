import { useEffect, useState } from 'react';
import { useToolsStore } from '../../store/tools';
import { useUIStore } from '../../store/ui';
import { X, Check } from '@phosphor-icons/react';

const platforms = ['mac', 'linux', 'windows', 'web', 'ios', 'android'];

type ToolFormData = {
  name: string;
  category: 'using' | 'to-check-out';
  cost: number;
  billing_cycle: 'monthly' | 'annual' | 'one-time';
  renewal_date: string;
  platform: string[];
  url: string;
  tags: string[];
  notes: string;
};

export function ToolDetail() {
  const { selectedTool, selectedToolId, updateTool, createTool } = useToolsStore();
  const { togglePanel } = useUIStore();
  const isNew = selectedToolId === 'new';

  const [formData, setFormData] = useState<ToolFormData>({
    name: '',
    category: 'to-check-out' as ToolFormData['category'],
    cost: 0,
    billing_cycle: 'monthly' as ToolFormData['billing_cycle'],
    renewal_date: '',
    platform: [] as ToolFormData['platform'],
    url: '',
    tags: [] as ToolFormData['tags'],
    notes: '',
  });

  useEffect(() => {
    if (selectedTool && !isNew) {
      setFormData({
        name: selectedTool.name || '',
        category: (selectedTool.category as 'using' | 'to-check-out') || 'to-check-out',
        cost: selectedTool.cost || 0,
        billing_cycle: (selectedTool.billing_cycle as 'monthly' | 'annual' | 'one-time') || 'monthly',
        renewal_date: selectedTool.renewal_date || '',
        platform: selectedTool.platform || [],
        url: selectedTool.url || '',
        tags: selectedTool.tags || [],
        notes: selectedTool.notes || '',
      });
    }
  }, [selectedTool, isNew]);

  const handleSave = async () => {
    if (isNew) {
      await createTool(formData as Parameters<typeof createTool>[0]);
    } else if (selectedToolId) {
      await updateTool(selectedToolId, formData as Parameters<typeof updateTool>[1]);
    }
    togglePanel();
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
            onClick={handleSave}
            className="p-2 bg-brand text-white rounded-lg hover:bg-brand-hover"
          >
            <Check size={18} />
          </button>
          <button
            onClick={togglePanel}
            className="p-2 text-low hover:text-normal hover:bg-panel rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div>
        <label className="text-low text-xs block mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          placeholder="Tool name"
        />
      </div>

      <div>
        <label className="text-low text-xs block mb-1">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as ToolFormData['category'] })}
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="using">Using</option>
          <option value="to-check-out">To Check Out</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-low text-xs block mb-1">Cost</label>
          <input
            type="number"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label className="text-low text-xs block mb-1">Billing</label>
          <select
            value={formData.billing_cycle}
            onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value as ToolFormData['billing_cycle'] })}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
            <option value="one-time">One-time</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-low text-xs block mb-1">Renewal Date</label>
        <input
          type="date"
          value={formData.renewal_date}
          onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div>
        <label className="text-low text-xs block mb-2">Platforms</label>
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => (
            <button
              key={platform}
              onClick={() => togglePlatform(platform)}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors ${
                formData.platform.includes(platform)
                  ? 'bg-brand text-white'
                  : 'bg-secondary text-low hover:bg-panel'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-low text-xs block mb-1">URL</label>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="text-low text-xs block mb-1">Tags (comma-separated)</label>
        <input
          type="text"
          value={formData.tags.join(', ')}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          placeholder="AI, productivity, writing"
        />
      </div>

      <div>
        <label className="text-low text-xs block mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-normal text-sm focus:outline-none focus:ring-1 focus:ring-brand h-24 resize-none"
          placeholder="Notes about this tool..."
        />
      </div>
    </div>
  );
}
