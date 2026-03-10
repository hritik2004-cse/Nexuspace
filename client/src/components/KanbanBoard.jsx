"use client";

import { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import KanbanColumn from './KanbanColumn';

// Mock initial data
const initialData = {
  tasks: {
    'task-1': { id: 'task-1', title: 'Design Database Schema', assignee: 'Lavkesh', tags: [{ name: 'Backend', color: 'indigo' }], date: 'Oct 24' },
    'task-2': { id: 'task-2', title: 'Implement Kanban UI', assignee: 'Ash', tags: [{ name: 'Frontend', color: 'purple' }], date: 'Oct 25' },
    'task-3': { id: 'task-3', title: 'Setup Socket.io Server', assignee: 'Lavkesh', tags: [{ name: 'Sockets', color: 'blue' }], date: 'Oct 26' },
  },
  columns: {
    'col-1': { id: 'col-1', title: 'To Do', taskIds: ['task-3'] },
    'col-2': { id: 'col-2', title: 'In Progress', taskIds: ['task-1', 'task-2'] },
    'col-3': { id: 'col-3', title: 'Review', taskIds: [] },
    'col-4': { id: 'col-4', title: 'Done', taskIds: [] },
  },
  columnOrder: ['col-1', 'col-2', 'col-3', 'col-4'],
};

export default function KanbanBoard() {
  const [data, setData] = useState(initialData);
  const [isBrowser, setIsBrowser] = useState(false);

  // Fix for React beautiful dnd + Next.js SSR mismatch
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    // Moving within the same column
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startColumn, taskIds: newTaskIds };
      setData({ ...data, columns: { ...data.columns, [newColumn.id]: newColumn } });
      return;
    }

    // Moving between columns
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...startColumn, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finishColumn, taskIds: finishTaskIds };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    });
  };

  if (!isBrowser) return <div className="p-8 text-slate-400">Loading Board...</div>;

  return (
    <div className="h-full flex flex-col pt-6 pb-2 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold font-sans text-white tracking-tight">Sprint Planning</h2>
          <p className="text-sm text-slate-400 mt-1">Manage tasks and workflow across the team.</p>
        </div>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);
            return <KanbanColumn key={column.id} column={column} tasks={tasks} />;
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
