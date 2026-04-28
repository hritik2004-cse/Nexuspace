const express = require('express');
const router = express.Router();
const { 
  getUserById, 
  searchUsers, 
  updateUser, 
  deleteUser, 
  getUserWorkspaces,
  getOnlineUsers
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/search', protect, searchUsers);
router.get('/online', protect, getOnlineUsers);

router.route('/:id')
  .get(protect, getUserById)
  .put(protect, updateUser)
  .delete(protect, deleteUser);

router.get('/:id/workspaces', protect, getUserWorkspaces);

module.exports = router;
