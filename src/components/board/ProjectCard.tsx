import { Draggable } from '@hello-pangea/dnd';
import { Archive } from '@phosphor-icons/react';
import { useProjectsStore } from '../../store/projects';
import { useUIStore } from '../../store/ui';
import type { ProjectRow } from '../../types';

interface ProjectCardProps {
  project: ProjectRow;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId);
  const selectProject = useProjectsStore((s) => s.selectProject);
  const openPanel = useUIStore((s) => s.openPanel);
  const isSelected = selectedProjectId === project.id;
  const isArchived = !!project.archived_at;

  return (
    <Draggable draggableId={project.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => { selectProject(project.id); openPanel(); }}
          className={`
            bg-surface border border-border rounded-lg p-3 mb-2
            cursor-pointer transition-colors
            hover:bg-elevated
            ${isSelected ? 'ring-2 ring-brand ring-inset' : ''}
            ${snapshot.isDragging ? 'opacity-50' : ''}
            ${isArchived ? 'opacity-60' : ''}
          `}
          style={{
            ...provided.draggableProps.style,
            marginTop: '-1px',
            marginLeft: '-1px',
            marginRight: '-1px',
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            {isArchived && <Archive size={12} className="text-low shrink-0" />}
            <h3 className="text-normal font-medium text-sm">
              {project.name}
            </h3>
          </div>
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
                    className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-low"
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
