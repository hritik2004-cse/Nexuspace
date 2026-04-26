"use client";

import { useState, useEffect } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import KanbanColumn from "./KanbanColumn";

import api from "@/services/api";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useSocket } from "@/context/SocketContext";

const STATUS_COLUMNS = {
  "todo": { id: "todo", title: "To Do" },
  "doing": { id: "doing", title: "In Progress" },
  "done": { id: "done", title: "Done" },
};
const COLUMN_ORDER = ["todo", "doing", "done"];

export default function KanbanBoard() {
  const { activeWorkspace } = useWorkspace();
  const { socket } = useSocket();
  const [tasks, setTasks] = useState({});
  const [columns, setColumns] = useState({
    todo: { id: "todo", title: "To Do", taskIds: [] },
    doing: { id: "doing", title: "In Progress", taskIds: [] },
    done: { id: "done", title: "Done", taskIds: [] }
  });
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!activeWorkspace) return;
      try {
        const res = await api.get(`/tasks/${activeWorkspace._id}`);
        // Restructure response into DnD readable maps
        const taskMap = {};
        const colMap = {
          todo: { id: "todo", title: "To Do", taskIds: [] },
          doing: { id: "doing", title: "In Progress", taskIds: [] },
          done: { id: "done", title: "Done", taskIds: [] }
        };
        
        res.data.forEach(task => {
           taskMap[task._id] = {
             id: task._id,
             title: task.title,
             description: task.description,
             status: task.status,
             // Map standard labels for ui
             date: task.dueDate || "",
             assignee: task.assignee?.name || "Unassigned"
           };
           if (colMap[task.status]) {
             colMap[task.status].taskIds.push(task._id);
           } else {
             colMap['todo'].taskIds.push(task._id);
           }
        });

        setTasks(taskMap);
        setColumns(colMap);
      } catch (err) {
        console.error("Failed to fetch Kanbans", err);
      }
    };
    fetchTasks();
  }, [activeWorkspace]);

  const updateTaskStatusBackend = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
    } catch(err) {
      console.error(err);
    }
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const startColumn = columns[source.droppableId];
    const finishColumn = columns[destination.droppableId];

    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      setColumns({
        ...columns,
        [startColumn.id]: { ...startColumn, taskIds: newTaskIds },
      });
      return;
    }

    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);

    setColumns({
      ...columns,
      [startColumn.id]: { ...startColumn, taskIds: startTaskIds },
      [finishColumn.id]: { ...finishColumn, taskIds: finishTaskIds }
    });

    updateTaskStatusBackend(draggableId, finishColumn.id);
  };

  if (!isBrowser)
    return <div className="p-8 text-slate-400">Loading Board...</div>;

  return (
    <div className="h-full flex flex-col pt-6 pb-2 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold font-sans text-white tracking-tight">
            Sprint Planning
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage tasks and workflow across the team.
          </p>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {COLUMN_ORDER.map((columnId) => {
            const column = columns[columnId];
            const colTasks = column.taskIds.map((taskId) => tasks[taskId]).filter(Boolean);
            return (
              <KanbanColumn key={column.id} column={column} tasks={colTasks} />
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
