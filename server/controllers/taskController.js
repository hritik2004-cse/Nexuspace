const { asyncHandler } = require('../middleware/errorMiddleware');
const taskService = require('../services/taskService');

/**
 * @desc    Get all tasks for a workspace board
 * @route   GET /api/tasks/workspace/:workspaceId
 */
const getWorkspaceTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getTasksByWorkspaceService(req.params.workspaceId);
  res.status(200).json(tasks);
});

/**
 * @desc    Get task by ID
 * @route   GET /api/tasks/:id
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskByIdService(req.params.id);
  res.status(200).json(task);
});

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 */
const createTask = asyncHandler(async (req, res) => {
  const { title, boardId } = req.body;
  if (!title || !boardId) {
    res.status(400);
    throw new Error('Title and boardId are required');
  }

  const task = await taskService.createTaskService(req.body);
  
  if (req.io) {
    req.io.to(boardId).emit('receive_board_update', { action: 'create', task });
  }

  res.status(201).json(task);
});

/**
 * @desc    Update a task (content, description, etc.)
 * @route   PUT /api/tasks/:id
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTaskService(req.params.id, req.body);
  
  if (req.io) {
    req.io.to(task.boardId.toString()).emit('receive_board_update', { action: 'update', task });
  }

  res.status(200).json(task);
});

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await taskService.deleteTaskService(req.params.id);
  
  if (req.io) {
    req.io.to(task.boardId.toString()).emit('receive_board_update', { action: 'delete', taskId: req.params.id });
  }

  res.status(200).json({ success: true, message: 'Task deleted' });
});

/**
 * @desc    Update task status (Kanban column move)
 * @route   PUT /api/tasks/:id/status
 */
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const task = await taskService.updateTaskStatusService(req.params.id, status);
  
  if (req.io) {
    req.io.to(task.boardId.toString()).emit('receive_board_update', { action: 'status_change', task });
  }

  res.status(200).json(task);
});

/**
 * @desc    Assign task to user
 * @route   PUT /api/tasks/:id/assign
 */
const assignTask = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const task = await taskService.assignTaskService(req.params.id, userId);
  
  if (req.io) {
    req.io.to(task.boardId.toString()).emit('receive_board_update', { action: 'assign', task });
  }

  res.status(200).json(task);
});

/**
 * @desc    Update task priority
 * @route   PUT /api/tasks/:id/priority
 */
const updateTaskPriority = asyncHandler(async (req, res) => {
  const { priority } = req.body;
  const task = await taskService.updateTaskPriorityService(req.params.id, priority);
  
  if (req.io) {
    req.io.to(task.boardId.toString()).emit('receive_board_update', { action: 'priority_change', task });
  }

  res.status(200).json(task);
});

module.exports = {
  getWorkspaceTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  assignTask,
  updateTaskPriority
};
