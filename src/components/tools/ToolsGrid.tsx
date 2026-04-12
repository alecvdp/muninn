import { ToolCard } from './ToolCard';
import type { Database } from '../../database.types';

type ToolRow = Database['public']['Tables']['tools']['Row'];

interface ToolsGridProps {
  tools: ToolRow[];
}

export function ToolsGrid({ tools }: ToolsGridProps) {
  if (tools.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-low mb-2">No tools yet</div>
          <div className="text-low text-sm">Add your first AI tool subscription</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
