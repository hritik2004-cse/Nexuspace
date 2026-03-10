"use client";

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FiClock, FiUser, FiPlus, FiTrash2, FiEdit2, FiX } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const initialBoardState = {
  columns: {
    'todo': { id: 'todo', title: 'To Do', taskIds: [] },
    'doing': { id: 'doing', title: 'In Progress', taskIds: [] },
    'done': { id: 'done', title: 'Done', taskIds: [] },
  },
  columnOrder: ['todo', 'doing', 'done'],
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [boardData, setBoardData] = useState(initialBoardState);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const socket = useSocket();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDesc, setEditTaskDesc] = useState('');
  const [editTaskDueDate, setEditTaskDueDate] = useState('');

  const boardId = 'main_workspace'; // Mock workspace ID for now

  useEffect(() => {
    setMounted(true);
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!socket || !mounted) return;

    // Join the board room
    socket.emit('join_channel', boardId);

    const handleBoardUpdate = (data) => {
      if (data.action === 'create') {
        setTasks(prev => [data.task, ...prev]);
      } else if (data.action === 'update') {
        setTasks(prev => prev.map(t => t._id === data.task._id ? data.task : t));
      } else if (data.action === 'delete') {
        setTasks(prev => prev.filter(t => t._id !== data.taskId));
      }
    };

    socket.on('receive_board_update', handleBoardUpdate);

    return () => {
      socket.off('receive_board_update', handleBoardUpdate);
      socket.emit('leave_channel', boardId);
    };
  }, [socket, mounted]);

  // Rebuild the react-beautiful-dnd board structure anytime `tasks` change
  useEffect(() => {
    const newBoard = {
      ...initialBoardState,
      columns: {
        'todo': { id: 'todo', title: 'To Do', taskIds: [] },
        'doing': { id: 'doing', title: 'In Progress', taskIds: [] },
        'done': { id: 'done', title: 'Done', taskIds: [] },
      }
    };

    tasks.forEach(task => {
      if (newBoard.columns[task.status]) {
        newBoard.columns[task.status].taskIds.push(task._id);
      } else {
        newBoard.columns['todo'].taskIds.push(task._id); // fallback
      }
    });

    setBoardData(newBoard);
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('nexuspace_token');
      const res = await axios.get(`${API_URL}/tasks/workspace/${boardId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const token = localStorage.getItem('nexuspace_token');
      const res = await axios.post(`${API_URL}/tasks`, {
        title: newTaskTitle,
        description: newTaskDesc,
        status: 'todo',
        assignee: user?.username || user?.name || 'Unassigned',
        dueDate: newTaskDueDate || 'No limit',
        boardId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // State is updated via socket, but we can do an optimistic append too.
      // setTasks(prev => [res.data, ...prev]);
      setIsModalOpen(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskDueDate('');
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('nexuspace_token');
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // setTasks(prev => prev.filter(t => t._id !== taskId)); // Managed by socket
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditSubmit = async (taskId) => {
    try {
      const token = localStorage.getItem('nexuspace_token');
      await axios.put(`${API_URL}/tasks/${taskId}`, {
        title: editTaskTitle,
        description: editTaskDesc,
        dueDate: editTaskDueDate
      }, { headers: { Authorization: `Bearer ${token}` } });
      setEditingTaskId(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const startEdit = (task) => {
    setEditingTaskId(task._id);
    setEditTaskTitle(task.title);
    setEditTaskDesc(task.description);
    setEditTaskDueDate(task.dueDate || '');
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

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
      const token = localStorage.getItem('nexuspace_token');
      await axios.put(`${API_URL}/tasks/${draggableId}`, { status: destination.droppableId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      // Revert state on failure
      fetchTasks();
    }
  };

  if (!mounted) return <div className="p-8 text-slate-400">Loading board...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-900 absolute inset-0">
      <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/95 sticky top-0 z-10 backdrop-blur">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          Project Tasks
        </h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
          <FiPlus /> New Task
        </button>
      </div>

      <div className="flex-1 overflow-x-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full items-start min-w-max pb-4">
            {boardData.columnOrder.map((columnId) => {
              const column = boardData.columns[columnId];
              // map to actual task objects
              const colTasks = column.taskIds.map(taskId => tasks.find(t => t._id === taskId)).filter(Boolean);

              return (
                <div key={column.id} className="w-80 flex flex-col shrink-0">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="font-semibold text-slate-200 flex items-center gap-2 uppercase tracking-wide text-xs">
                      {column.title}
                      <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">{colTasks.length}</span>
                    </h3>
                  </div>
                  
                  <Droppable droppableId={column.id} isDropDisabled={false}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 min-h-[150px] p-3 rounded-xl transition-colors shadow-inner ${snapshot.isDraggingOver ? 'bg-slate-800/80 ring-2 ring-indigo-500/50' : 'bg-slate-950 border border-slate-800/50'}`}
                      >
                        {colTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index} isDragDisabled={false}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 mb-3 rounded-xl shadow-md border transition-all group ${snapshot.isDragging ? 'bg-indigo-900/40 border-indigo-500 shadow-xl opacity-90 scale-105 z-50' : 'bg-slate-900 border-slate-700/50 hover:border-slate-600'}`}
                              >
                                <div className="flex justify-between items-start gap-2 mb-1">
                                  {editingTaskId === task._id ? (
                                    <input 
                                      value={editTaskTitle}
                                      onChange={(e) => setEditTaskTitle(e.target.value)}
                                      className="w-full text-sm font-semibold bg-slate-950/50 border border-slate-700/50 text-slate-100 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                      autoFocus
                                    />
                                  ) : (
                                    <h4 className="text-sm font-semibold text-slate-100">{task.title}</h4>
                                  )}
                                  <div className="flex gap-1">
                                    {editingTaskId === task._id ? (
                                      <>
                                        <button onClick={() => setEditingTaskId(null)} className="text-slate-400 hover:text-white p-0.5"><FiX className="w-4 h-4" /></button>
                                      </>
                                    ) : (
                                      <>
                                        <button onClick={() => startEdit(task)} className="text-slate-500 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5">
                                          <FiEdit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleDeleteTask(task._id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5">
                                          <FiTrash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {editingTaskId === task._id ? (
                                  <textarea 
                                    value={editTaskDesc}
                                    onChange={(e) => setEditTaskDesc(e.target.value)}
                                    className="w-full text-xs bg-slate-950/50 border border-slate-700/50 text-slate-300 rounded px-2 py-1 mt-1 mb-2 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none"
                                    rows={2}
                                  />
                                ) : (
                                  <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
                                )}
                                
                                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 mt-2">
                                  {editingTaskId === task._id ? (
                                    <>
                                      <input 
                                        value={editTaskDueDate}
                                        onChange={(e) => setEditTaskDueDate(e.target.value)}
                                        placeholder="Due Date"
                                        className="w-20 text-[10px] bg-slate-950/50 border border-slate-700/50 text-slate-300 rounded px-1.5 py-0.5 focus:outline-none"
                                      />
                                      <button onClick={() => handleEditSubmit(task._id)} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded">Save</button>
                                    </>
                                  ) : (
                                    <>
                                      <div className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded bg-slate-800/60 ${task.dueDate?.toLowerCase() === 'today' || task.dueDate?.toLowerCase() === 'asap' ? 'text-rose-400' : 'text-slate-400'}`}>
                                        <FiClock className="w-3.5 h-3.5" />
                                        <span>{task.dueDate}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 bg-indigo-500/10 px-2.5 py-1 rounded text-xs text-indigo-300 border border-indigo-500/20">
                                        <FiUser className="w-3.5 h-3.5" />
                                        <span className="font-medium tracking-wide">
                                          {typeof task.assignee === 'object' ? task.assignee.username : task.assignee}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-slate-800">
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
                <label className="block font-medium text-slate-400 mb-1">Task Title <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="E.g. Fix login UI"
                  className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block font-medium text-slate-400 mb-1">Description</label>
                <textarea 
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Task details and scope..."
                  className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block font-medium text-slate-400 mb-1">Due Date</label>
                <input 
                  type="text" 
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  placeholder="E.g. Oct 24 or ASAP"
                  className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              
              <div className="pt-3 flex justify-end gap-3 text-sm">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-medium text-slate-300 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={!newTaskTitle.trim()} className="px-5 py-2 font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/20">
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
