const Task = require('../models/Task');
const Workspace = require('../models/Workspace');

const getTasksByWorkspaceService = async (boardId) => {
  return await Task.find({ boardId }).populate('assignee', 'name email avatar').sort({ createdAt: -1 });
};

const createTaskService = async (taskData) => {
  const task = await Task.create(taskData);
  return task;
};

const updateTaskService = async (taskId, updateData) => {
  const task = await Task.findByIdAndUpdate(taskId, updateData, { new: true, runValidators: true });
  if (!task) throw new Error('Task not found');
  return task;
};

const deleteTaskService = async (taskId) => {
  const task = await Task.findByIdAndDelete(taskId);
  if (!task) throw new Error('Task not found');
  return task;
};

module.exports = {
  getTasksByWorkspaceService,
  createTaskService,
  updateTaskService,
  deleteTaskService
};
