const express = require('express');
const router = express.Router();
const { 
  createWorkspace, 
  getWorkspaces, 
  addMember, 
  joinWorkspace,
  createInvitation,
  getInvitation,
  acceptInvitation
} = require('../controllers/workspaceController');
const { protect, checkPermission } = require('../middleware/authMiddleware');
const { ipLimiter, userLimiter } = require('../middleware/rateLimiter');

router.route('/')
  .post(protect, checkPermission('workspace:create'), createWorkspace)
  .get(protect, getWorkspaces);

router.post('/:workspaceId/members', protect, addMember);
router.post('/:workspaceId/join', protect, userLimiter, joinWorkspace);

// Invitations
router.post('/:workspaceId/invite', protect, ipLimiter, userLimiter, createInvitation);
router.get('/invite/:token', ipLimiter, getInvitation);
router.post('/invite/:token/accept', protect, ipLimiter, userLimiter, acceptInvitation);

module.exports = router;
