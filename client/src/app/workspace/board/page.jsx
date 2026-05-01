"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  FiClock,
  FiUser,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiX,
} from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { taskApi } from "@/services/endpoints";
import { toast } from "react-toastify";

const initialBoardState = {
  columns: {
    todo: { id: "todo", title: "To Do", taskIds: [] },
    doing: { id: "doing", title: "In Progress", taskIds: [] },
    done: { id: "done", title: "Done", taskIds: [] },
  },
  columnOrder: ["todo", "doing", "done"],
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [boardData, setBoardData] = useState(initialBoardState);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const { socket } = useSocket();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDesc, setEditTaskDesc] = useState("");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");

  const boardId = "660d2b4f9e31d4b68c34f2a1"; // Standardized to an ObjectId string for testing or dynamic logic

  useEffect(() => {
    setMounted(true);
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!socket || !mounted) return;

    // Join the workspace room (sync with backend workspaceSocket.js)
    socket.emit("join_workspace", boardId);

    const handleBoardUpdate = (data) => {
      if (data.action === "create") {
        setTasks((prev) => {
          if (prev.some((t) => t._id === data.task._id)) return prev;
          return [data.task, ...prev];
        });
      } else if (data.action === "update") {
        setTasks((prev) =>
          prev.map((t) => (t._id === data.task._id ? data.task : t)),
        );
      } else if (data.action === "delete") {
        setTasks((prev) => prev.filter((t) => t._id !== data.taskId));
      }
    };

    socket.on("receive_board_update", handleBoardUpdate);

    return () => {
      socket.off("receive_board_update", handleBoardUpdate);
      socket.emit("leave_workspace", boardId);
    };
  }, [socket, mounted]);

  // Rebuild the drag-and-drop board structure anytime `tasks` change
  useEffect(() => {
    const newBoard = {
      ...initialBoardState,
      columns: {
        todo: { id: "todo", title: "To Do", taskIds: [] },
        doing: { id: "doing", title: "In Progress", taskIds: [] },
        done: { id: "done", title: "Done", taskIds: [] },
      },
    };

    tasks.forEach((task) => {
      if (newBoard.columns[task.status]) {
        newBoard.columns[task.status].taskIds.push(task._id);
      } else {
        newBoard.columns["todo"].taskIds.push(task._id); // fallback
      }
    });

    setBoardData(newBoard);
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const res = await taskApi.getByBoard(boardId);
      setTasks(res.data);
    } catch (error) {
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await taskApi.create({
        title: newTaskTitle,
        description: newTaskDesc,
        status: "todo",
        assignee: user?._id || user?.id, // Send the ACTUAL ObjectId/ID string
        dueDate: newTaskDueDate || "No limit",
        boardId,
      });

      setTasks((prev) => {
        if (prev.some((t) => t._id === res.data._id)) return prev;
        return [res.data, ...prev];
      });
      setIsModalOpen(false);
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskDueDate("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskApi.remove(taskId);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting task");
    }
  };

  const handleEditSubmit = async (taskId) => {
    try {
      const res = await taskApi.update(taskId, {
        title: editTaskTitle,
        description: editTaskDesc,
        dueDate: editTaskDueDate,
      });
      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? res.data : task)),
      );
      setEditingTaskId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating task");
    }
  };

  const startEdit = (task) => {
    setEditingTaskId(task._id);
    setEditTaskTitle(task.title);
    setEditTaskDesc(task.description);
    setEditTaskDueDate(task.dueDate || "");
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const startColumn = boardData.columns[source.droppableId];
    const finishColumn = boardData.columns[destination.droppableId];

    // Moving tasks within the same column
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startColumn, taskIds: newTaskIds };
      setBoardData({
        ...boardData,
        columns: { ...boardData.columns, [newColumn.id]: newColumn },
      });
      return;
    }

    // Moving tasks between different columns
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStartColumn = { ...startColumn, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinishColumn = { ...finishColumn, taskIds: finishTaskIds };

    setBoardData({
      ...boardData,
      columns: {
        ...boardData.columns,
        [newStartColumn.id]: newStartColumn,
        [newFinishColumn.id]: newFinishColumn,
      },
    });

    // Fire API update to server
    try {
      await taskApi.update(draggableId, { status: destination.droppableId });
    } catch (error) {
      // Revert state on failure
      fetchTasks();
    }
  };

  const [activeTab, setActiveTab] = useState("todo");

  if (!mounted)
    return <div className="p-8 text-slate-400">Loading board...</div>;

  return (
    <div className="flex flex-col h-full bg-background absolute inset-0">
      <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/95 sticky top-0 z-20 backdrop-blur">
        <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
          Project Tasks
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all shadow-lg shadow-primary/20"
        >
          <FiPlus /> <span className="hidden xs:inline">New Task</span>
        </button>
      </div>

      {/* Mobile Tabs */}
      <div className="flex lg:hidden bg-surface border-b border-border p-1 sticky top-[61px] z-20">
        {boardData.columnOrder.map((colId) => (
          <button
            key={colId}
            onClick={() => setActiveTab(colId)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${activeTab === colId ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
          >
            {boardData.columns[colId].title}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-x-auto lg:overflow-x-hidden p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex lg:grid lg:grid-cols-3 gap-6 h-full items-start pb-4">
            {boardData.columnOrder.map((columnId) => {
              const column = boardData.columns[columnId];
              // map to actual task objects
              const colTasks = column.taskIds
                .map((taskId) => tasks.find((t) => t._id === taskId))
                .filter(Boolean);

              return (
                <div key={column.id} className={`w-80 md:w-full lg:w-auto flex flex-col shrink-0 lg:shrink ${activeTab === columnId ? 'flex' : 'hidden lg:flex'}`}>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="font-semibold text-slate-200 flex items-center gap-2 uppercase tracking-wide text-xs">
                      {column.title}
                      <span className="bg-surface text-slate-400 px-2 py-0.5 rounded-full font-bold border border-border/50">
                        {colTasks.length}
                      </span>
                    </h3>
                  </div>

                  <Droppable droppableId={column.id} isDropDisabled={false}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 min-h-37.5 p-3 rounded-xl transition-colors shadow-inner ${snapshot.isDraggingOver ? "bg-primary/5 ring-2 ring-primary/20" : "bg-surface/50 border border-border"}`}
                      >
                        {colTasks.map((task, index) => (
                          <Draggable
                            key={task._id}
                            draggableId={task._id}
                            index={index}
                            isDragDisabled={false}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 mb-3 rounded-xl shadow-md border transition-all group ${snapshot.isDragging ? "bg-primary/20 border-primary shadow-xl opacity-90 scale-105 z-50" : "bg-surface border-border/50 hover:border-primary/30"}`}
                              >
                                <div className="flex justify-between items-start gap-2 mb-1">
                                  {editingTaskId === task._id ? (
                                    <input
                                      value={editTaskTitle}
                                      onChange={(e) =>
                                        setEditTaskTitle(e.target.value)
                                      }
                                      className="w-full text-sm font-semibold bg-background/50 border border-border text-slate-100 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                      autoFocus
                                    />
                                  ) : (
                                    <h4 className="text-sm font-semibold text-slate-100">
                                      {task.title}
                                    </h4>
                                  )}
                                  <div className="flex gap-1">
                                    {editingTaskId === task._id ? (
                                      <>
                                        <button
                                          onClick={() => setEditingTaskId(null)}
                                          className="text-slate-400 hover:text-white p-0.5"
                                        >
                                          <FiX className="w-4 h-4" />
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => startEdit(task)}
                                          className="text-slate-500 hover:text-primary transition-opacity p-0.5"
                                        >
                                          <FiEdit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteTask(task._id)
                                          }
                                          className="text-slate-500 hover:text-red-400 transition-opacity p-0.5"
                                        >
                                          <FiTrash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {editingTaskId === task._id ? (
                                  <textarea
                                    value={editTaskDesc}
                                    onChange={(e) =>
                                      setEditTaskDesc(e.target.value)
                                    }
                                    className="w-full text-xs bg-background/50 border border-border text-slate-300 rounded px-2 py-1 mt-1 mb-2 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                                    rows={2}
                                  />
                                ) : (
                                  <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                                    {task.description}
                                  </p>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
                                  {editingTaskId === task._id ? (
                                    <>
                                      <input
                                        value={editTaskDueDate}
                                        onChange={(e) =>
                                          setEditTaskDueDate(e.target.value)
                                        }
                                        placeholder="Due Date"
                                        className="w-20 text-[10px] bg-background/50 border border-border text-slate-300 rounded px-1.5 py-0.5 focus:outline-none"
                                      />
                                      <button
                                        onClick={() =>
                                          handleEditSubmit(task._id)
                                        }
                                        className="text-xs bg-primary hover:opacity-90 text-white px-2 py-1 rounded"
                                      >
                                        Save
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <div
                                        className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded bg-surface/50 ${task.dueDate?.toLowerCase() === "today" || task.dueDate?.toLowerCase() === "asap" ? "text-rose-400" : "text-slate-400"}`}
                                      >
                                        <FiClock className="w-3.5 h-3.5" />
                                        <span>{task.dueDate}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded text-xs text-primary/80 border border-primary/20">
                                        <FiUser className="w-3.5 h-3.5" />
                                        <span className="font-medium tracking-wide">
                                          {typeof task.assignee === "object"
                                            ? task.assignee.username
                                            : task.assignee}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Task Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div
            className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-border">
              <h2 className="text-lg font-bold text-white">Create New Task</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-5 space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-400 mb-1">
                  Task Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="E.g. Fix login UI"
                  className="w-full bg-background/50 border border-border text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block font-medium text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Task details and scope..."
                  className="w-full bg-background/50 border border-border text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block font-medium text-slate-400 mb-1">
                  Due Date
                </label>
                <input
                  type="text"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  placeholder="E.g. Oct 24 or ASAP"
                  className="w-full bg-background/50 border border-border text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-5 py-2 font-medium bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
