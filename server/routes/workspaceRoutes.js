const express = require('express');
const router = express.Router();
const { createWorkspace, getWorkspaces, addMember } = require('../controllers/workspaceController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, checkPermission('workspace:create'), createWorkspace)
  .get(protect, getWorkspaces);

router.post('/:workspaceId/members', protect, addMember);

module.exports = router;
