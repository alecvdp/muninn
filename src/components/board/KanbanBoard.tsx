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
  const { projects, filteredProjects, updateProject, fetchProjects } = useProjectsStore();

  const visibleProjects = filteredProjects();

  const getProjectsForColumn = (columnId: string) =>
    visibleProjects
      .filter((p) => p.board_status === columnId)
      .sort((a, b) => (a.board_position || 0) - (b.board_position || 0));

  const getAllProjectsForColumn = (columnId: string) =>
    projects
      .filter((p) => p.board_status === columnId)
      .sort((a, b) => (a.board_position || 0) - (b.board_position || 0));

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // destination.index is relative to the rendered (filtered) list, so use
    // the filtered list to identify the intended neighbor projects.
    const visibleColumn = getProjectsForColumn(destination.droppableId);
    // The full unfiltered column is used to find a safe position that doesn't
    // collide with hidden items between the two visible neighbors.
    const allColumn = getAllProjectsForColumn(destination.droppableId);

    // Fractional positioning: interpolate between siblings for stable reorder
    let newPosition: number;
    if (visibleColumn.length === 0) {
      // Empty visible column — place after all (including hidden) items
      if (allColumn.length === 0) {
        newPosition = 1000;
      } else {
        newPosition = (allColumn[allColumn.length - 1]?.board_position || 0) + 1000;
      }
    } else if (destination.index === 0) {
      // Before the first visible item — place before all items up to that point
      const firstVisible = visibleColumn[0];
      const firstVisibleIdx = allColumn.findIndex((p) => p.id === firstVisible.id);
      if (firstVisibleIdx <= 0) {
        newPosition = (firstVisible.board_position || 0) - 1000;
      } else {
        const prevHidden = allColumn[firstVisibleIdx - 1];
        newPosition = ((prevHidden?.board_position || 0) + (firstVisible.board_position || 0)) / 2;
      }
    } else if (destination.index >= visibleColumn.length) {
      // After the last visible item — place after all items in the full list
      const lastVisible = visibleColumn[visibleColumn.length - 1];
      const lastVisibleIdx = allColumn.findIndex((p) => p.id === lastVisible.id);
      if (lastVisibleIdx >= allColumn.length - 1) {
        newPosition = (lastVisible.board_position || 0) + 1000;
      } else {
        const nextHidden = allColumn[lastVisibleIdx + 1];
        newPosition = ((lastVisible.board_position || 0) + (nextHidden?.board_position || 0)) / 2;
      }
    } else {
      // Between two visible items — find a gap in the full list that avoids hidden items
      const prev = visibleColumn[destination.index - 1];
      const next = visibleColumn[destination.index];
      const prevIdx = allColumn.findIndex((p) => p.id === prev.id);
      const nextIdx = allColumn.findIndex((p) => p.id === next.id);
      if (nextIdx - prevIdx === 1) {
        // Adjacent in full list, simple midpoint
        newPosition = ((prev?.board_position || 0) + (next?.board_position || 0)) / 2;
      } else {
        // Hidden items exist between them; place just after the prev item
        const afterPrev = allColumn[prevIdx + 1];
        newPosition = ((prev?.board_position || 0) + (afterPrev?.board_position || 0)) / 2;
      }
    }

    const updates: { board_status?: string; board_position: number } = {
      board_position: Math.round(newPosition),
    };
    if (source.droppableId !== destination.droppableId) {
      updates.board_status = destination.droppableId;
    }

    await updateProject(draggableId, updates);

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
