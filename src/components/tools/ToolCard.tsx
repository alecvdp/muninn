import { useUIStore } from '../../store/ui';
import type { Database } from '../../database.types';
import {
  Desktop,
  Globe,
  DeviceMobile,
  AppleLogo,
  LinuxLogo,
} from '@phosphor-icons/react';

type ToolRow = Database['public']['Tables']['tools']['Row'];

interface ToolCardProps {
  tool: ToolRow;
}

const platformIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  mac: AppleLogo,
  linux: LinuxLogo,
  windows: Desktop,
  web: Globe,
  ios: DeviceMobile,
  android: DeviceMobile,
};

const isWithin30Days = (date: string | null): boolean => {
  if (!date) return false;
  const renewal = new Date(date);
  const now = new Date();
  const diffTime = renewal.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 30;
};

export function ToolCard({ tool }: ToolCardProps) {
  const { selectedToolId, selectTool } = useUIStore();
  const isSelected = selectedToolId === tool.id;
  const isRenewingSoon = isWithin30Days(tool.renewal_date);

  const formatCost = (): string => {
    if (!tool.cost || tool.cost === 0) return 'Free';
    const cycle =
      tool.billing_cycle === 'monthly'
        ? '/mo'
        : tool.billing_cycle === 'annual'
          ? '/yr'
          : '';
    return `$${tool.cost}${cycle}`;
  };

  return (
    <div
      onClick={() => selectTool(tool.id)}
      className={`
        bg-primary border border-border rounded-lg p-4 cursor-pointer
        transition-colors hover:bg-panel
        ${isSelected ? 'ring-2 ring-brand ring-inset' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-normal font-medium">{tool.name}</h3>
        <span
          className={`
            text-xs px-2 py-0.5 rounded-full
            ${tool.category === 'using' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}
          `}
        >
          {tool.category === 'using' ? 'Using' : 'To Check Out'}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-brand font-medium">{formatCost()}</span>
        {tool.renewal_date && (
          <span className={`text-xs ${isRenewingSoon ? 'text-orange-400' : 'text-low'}`}>
            Renews {new Date(tool.renewal_date).toLocaleDateString()}
            {isRenewingSoon && ' \u26A0\uFE0F'}
          </span>
        )}
      </div>

      {tool.platform && tool.platform.length > 0 && (
        <div className="flex gap-1 mb-2">
          {tool.platform.map((platform) => {
            const Icon = platformIcons[platform] || Desktop;
            return (
              <span key={platform} className="text-low" title={platform}>
                <Icon size={14} />
              </span>
            );
          })}
        </div>
      )}

      {tool.notes && <p className="text-low text-xs line-clamp-2">{tool.notes}</p>}

      {tool.tags && tool.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-2">
          {tool.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-low">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
