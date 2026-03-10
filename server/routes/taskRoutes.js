const express = require('express');
const router = express.Router();
const { getWorkspaceTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createTask);

router.route('/:boardId')
  .get(protect, getWorkspaceTasks);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;
