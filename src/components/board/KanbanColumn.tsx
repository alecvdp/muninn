import { Droppable } from '@hello-pangea/dnd';
import type { ReactNode } from 'react';
import type { Database } from '../../database.types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  projects: ProjectRow[];
  children?: ReactNode;
}

const columnColors: Record<string, string> = {
  idea: 'bg-blue-500',
  todo: 'bg-yellow-500',
  'in-progress': 'bg-orange-500',
  paused: 'bg-gray-500',
  done: 'bg-green-500',
};

export function KanbanColumn({ id, title, projects, children }: KanbanColumnProps) {
  return (
    <div className="flex-1 min-w-[280px] max-w-[400px] flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className={`w-2 h-2 rounded-full ${columnColors[id]}`} />
        <span className="text-normal font-medium text-sm">{title}</span>
        <span className="text-low text-xs ml-auto">{projects.length}</span>
      </div>
      <Droppable droppableId={id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 bg-muted/50 rounded-lg p-2 min-h-[200px]"
          >
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
