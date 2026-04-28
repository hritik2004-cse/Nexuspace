const express = require('express');
const router = express.Router();
const { 
  createWorkspace, 
  getWorkspaces, 
  addMember, 
  getWorkspaceById, 
  updateWorkspace, 
  deleteWorkspace,
  inviteWorkspace,
  joinWorkspace,
  getWorkspaceMembers,
  updateMemberRole,
  removeMember
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createWorkspace)
  .get(protect, getWorkspaces);

router.route('/:workspaceId')
  .get(protect, getWorkspaceById)
  .put(protect, updateWorkspace)
  .delete(protect, deleteWorkspace);

router.post('/:workspaceId/members', protect, addMember);

router.post('/:workspaceId/invite', protect, inviteWorkspace);
router.post('/:workspaceId/join', protect, joinWorkspace);
router.get('/:workspaceId/members', protect, getWorkspaceMembers);
router.put('/:workspaceId/role', protect, updateMemberRole);
router.delete('/:workspaceId/member/:userId', protect, removeMember);

module.exports = router;
