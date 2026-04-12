import { Draggable } from '@hello-pangea/dnd';
import { useUIStore } from '../../store/ui';
import type { Database } from '../../database.types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];

interface ProjectCardProps {
  project: ProjectRow;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const { selectedProjectId, selectProject } = useUIStore();
  const isSelected = selectedProjectId === project.id;

  return (
    <Draggable draggableId={project.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => selectProject(project.id)}
          className={`
            bg-primary border border-border rounded-lg p-3 mb-2
            cursor-pointer transition-colors
            hover:bg-panel
            ${isSelected ? 'ring-2 ring-brand ring-inset' : ''}
            ${snapshot.isDragging ? 'opacity-50' : ''}
          `}
          style={{
            ...provided.draggableProps.style,
            marginTop: '-1px',
            marginLeft: '-1px',
            marginRight: '-1px',
          }}
        >
          <h3 className="text-normal font-medium text-sm mb-1">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-low text-xs line-clamp-2 mb-2">
              {project.description}
            </p>
          )}
          <div className="flex items-center gap-2">
            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {project.tech_stack.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-low"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
            {project.priority && (
              <span className="ml-auto text-[10px] text-low">
                P{project.priority}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
