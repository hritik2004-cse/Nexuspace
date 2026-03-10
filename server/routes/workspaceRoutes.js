const express = require('express');
const router = express.Router();
const { createWorkspace, getWorkspaces, addMember } = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createWorkspace)
  .get(protect, getWorkspaces);

router.post('/:workspaceId/members', protect, addMember);

module.exports = router;
