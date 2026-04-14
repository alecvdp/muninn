import { useToolsStore } from '../../store/tools';
import { useUIStore } from '../../store/ui';
import { isWithin30Days } from '../../lib/dates';
import type { ToolRow } from '../../types';
import {
  Desktop,
  Globe,
  DeviceMobile,
  AppleLogo,
  LinuxLogo,
} from '@phosphor-icons/react';

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

export function ToolCard({ tool }: ToolCardProps) {
  const selectedToolId = useToolsStore((s) => s.selectedToolId);
  const selectTool = useToolsStore((s) => s.selectTool);
  const openPanel = useUIStore((s) => s.openPanel);
  const isSelected = selectedToolId === tool.id;
  const isRenewingSoon = isWithin30Days(tool.renewal_date);

  const formatCost = (): string => {
    if (!tool.active_subscription) return '';
    if (!tool.cost || tool.cost === 0) return 'Free';
    const cycle =
      tool.billing_cycle === 'monthly'
        ? '/mo'
        : tool.billing_cycle === 'annual'
          ? '/yr'
          : '';
    return `$${tool.cost}${cycle}`;
  };

  const categoryBadge = (): { label: string; className: string } => {
    switch (tool.category) {
      case 'using':
        return { label: 'Using', className: 'bg-category-using/20 text-category-using' };
      case 'to-check-out':
        return { label: 'To Check Out', className: 'bg-category-to-check-out/20 text-category-to-check-out' };
      case 'not-using':
        return { label: 'Not Using', className: 'bg-category-not-using/20 text-category-not-using' };
      case 'watching':
        return { label: 'Watching', className: 'bg-category-watching/20 text-category-watching' };
      default:
        return { label: tool.category, className: 'bg-category-watching/20 text-category-watching' };
    }
  };

  const badge = categoryBadge();
  const costDisplay = formatCost();

  return (
    <div
      onClick={() => { selectTool(tool.id); openPanel(); }}
      className={`
        bg-surface border border-border rounded-lg p-4 cursor-pointer
        transition-colors hover:bg-elevated
        ${isSelected ? 'ring-2 ring-brand ring-inset' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-normal font-medium">{tool.name}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        {costDisplay && <span className="text-brand font-medium">{costDisplay}</span>}
        {tool.active_subscription && tool.renewal_date && (
          <span className={`text-xs ${isRenewingSoon ? 'text-warning' : 'text-low'}`}>
            Renews {new Date(tool.renewal_date).toLocaleDateString()}
            {isRenewingSoon && (
              <>
                {' '}<span aria-hidden="true">{'\u26A0\uFE0F'}</span>
                <span className="sr-only"> (renewing soon)</span>
              </>
            )}
          </span>
        )}
      </div>

      {tool.platform && tool.platform.length > 0 && (
        <div className="flex gap-1 mb-2">
          {tool.platform.map((platform) => {
            const Icon = platformIcons[platform] || Desktop;
            return (
              <span key={platform} className="text-low" title={platform} role="img" aria-label={platform}>
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
            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-low">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
