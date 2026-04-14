import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { useProjectsStore } from '../../store/projects';
import { KanbanColumn } from './KanbanColumn';
import { ProjectCard } from './ProjectCard';

const columns = [
  { id: 'idea', title: 'Idea' },
  { id: 'todo', title: 'Todo' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'paused', title: 'Paused' },
  { id: 'done', title: 'Done' },
];

export function KanbanBoard() {
  const { projects, filteredProjects, updateBoardStatus, updateBoardPosition, fetchProjects } = useProjectsStore();

  const visibleProjects = filteredProjects();

  const getProjectsForColumn = (columnId: string, source = visibleProjects) =>
    source
      .filter((p) => p.board_status === columnId)
      .sort((a, b) => (a.board_position || 0) - (b.board_position || 0));

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Use ALL projects (not filtered) so positions don't collide with hidden items
    const columnProjects = getProjectsForColumn(destination.droppableId, projects);

    // Fractional positioning: interpolate between siblings for stable reorder
    let newPosition: number;
    if (columnProjects.length === 0) {
      newPosition = 1000;
    } else if (destination.index === 0) {
      newPosition = (columnProjects[0]?.board_position || 0) - 1000;
    } else if (destination.index >= columnProjects.length) {
      newPosition = (columnProjects[columnProjects.length - 1]?.board_position || 0) + 1000;
    } else {
      const prev = columnProjects[destination.index - 1];
      const next = columnProjects[destination.index];
      newPosition = ((prev?.board_position || 0) + (next?.board_position || 0)) / 2;
    }

    if (source.droppableId !== destination.droppableId) {
      await updateBoardStatus(draggableId, destination.droppableId);
    }

    await updateBoardPosition(draggableId, Math.round(newPosition));

    await fetchProjects();
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 h-full overflow-x-auto p-4">
        {columns.map((column) => {
          const columnProjects = getProjectsForColumn(column.id);
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              projects={columnProjects}
            >
              {columnProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </KanbanColumn>
          );
        })}
      </div>
    </DragDropContext>
  );
}
