const Task = require('../models/Task');

/**
 * @desc    Get tasks for a workspace
 */
const getTasksByWorkspaceService = async (boardId) => {
  return await Task.find({ boardId })
    .populate('assignee', 'name username avatar')
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * @desc    Get task by ID
 */
const getTaskByIdService = async (taskId) => {
  const task = await Task.findById(taskId)
    .populate('assignee', 'name username avatar')
    .lean();
  if (!task) throw new Error('Task not found');
  return task;
};

/**
 * @desc    Create a new task
 */
const createTaskService = async (data) => {
  return await Task.create({
    ...data,
    description: data.description || '',
    status: data.status || 'todo',
    priority: data.priority || 'low',
    dueDate: data.dueDate || ''
  });
};

/**
 * @desc    Update task details
 */
const updateTaskService = async (id, data) => {
  const task = await Task.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!task) throw new Error('Task not found');
  return task;
};

/**
 * @desc    Delete task
 */
const deleteTaskService = async (id) => {
  const task = await Task.findByIdAndDelete(id);
  if (!task) throw new Error('Task not found');
  return task;
};

/**
 * @desc    Update task status
 */
const updateTaskStatusService = async (id, status) => {
  const task = await Task.findById(id);
  if (!task) throw new Error('Task not found');
  
  task.status = status;
  await task.save();
  return task;
};

/**
 * @desc    Assign task to user
 */
const assignTaskService = async (id, userId) => {
  const task = await Task.findById(id);
  if (!task) throw new Error('Task not found');
  
  task.assignee = userId;
  await task.save();
  return await task.populate('assignee', 'name username avatar');
};

/**
 * @desc    Update task priority
 */
const updateTaskPriorityService = async (id, priority) => {
  const task = await Task.findById(id);
  if (!task) throw new Error('Task not found');
  
  task.priority = priority;
  await task.save();
  return task;
};

module.exports = {
  getTasksByWorkspaceService,
  getTaskByIdService,
  createTaskService,
  updateTaskService,
  deleteTaskService,
  updateTaskStatusService,
  assignTaskService,
  updateTaskPriorityService
};
