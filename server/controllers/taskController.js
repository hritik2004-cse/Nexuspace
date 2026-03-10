const { asyncHandler } = require('../middleware/errorMiddleware');
const taskService = require('../services/taskService');

const getWorkspaceTasks = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const tasks = await taskService.getTasksByWorkspaceService(boardId);
  res.status(200).json(tasks);
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, assignee, dueDate, boardId } = req.body;

  if (!title || !boardId) {
    res.status(400);
    throw new Error('Title and boardId are required');
  }

  const taskData = {
    title,
    description: description || '',
    status: status || 'todo',
    assignee, // Client must pass ObjectId
    dueDate: dueDate || '',
    boardId
  };

  const task = await taskService.createTaskService(taskData);

  // Emit Real-Time update inside the controller to keep the service purely decoupled from IO
  if (req.io) {
    req.io.to(boardId).emit('receive_board_update', { action: 'create', task });
  }

  res.status(201).json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const updatedTask = await taskService.updateTaskService(id, req.body);

  if (req.io) {
    req.io.to(updatedTask.boardId.toString()).emit('receive_board_update', { action: 'update', task: updatedTask });
  }

  res.status(200).json(updatedTask);
});

const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedTask = await taskService.deleteTaskService(id);

  if (req.io) {
    req.io.to(deletedTask.boardId.toString()).emit('receive_board_update', { action: 'delete', taskId: id });
  }

  res.status(200).json({ message: 'Task removed successfully' });
});

module.exports = {
  getWorkspaceTasks,
  createTask,
  updateTask,
  deleteTask
};
