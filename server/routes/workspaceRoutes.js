const express = require('express');
const router = express.Router();
const { createWorkspace, getWorkspaces, addMember, joinWorkspace } = require('../controllers/workspaceController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, checkPermission('workspace:create'), createWorkspace)
  .get(protect, getWorkspaces);

router.post('/:workspaceId/members', protect, addMember);
router.post('/:workspaceId/join', protect, joinWorkspace);

module.exports = router;
