const express = require('express');
const router = express.Router();
const { 
  getWorkspaceTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask,
  updateTaskStatus,
  assignTask,
  updateTaskPriority
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Base route /api/tasks
router.route('/')
  .post(protect, createTask);

router.get('/workspace/:workspaceId', protect, getWorkspaceTasks);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

// Specialized Kanban Updates
router.put('/:id/status', protect, updateTaskStatus);
router.put('/:id/assign', protect, assignTask);
router.put('/:id/priority', protect, updateTaskPriority);

module.exports = router;
