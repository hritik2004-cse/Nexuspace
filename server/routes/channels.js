const express = require('express');
const router = express.Router();
const { findOrCreateChannel, getWorkspaceChannels, deleteChannel, leaveChannel, getChannelMembers, removeMemberFromChannel, updateMemberRole, transferOwnership, renameChannel } = require('../controllers/channelController');

const { protect, checkPermission, checkChannelRole } = require('../middleware/authMiddleware');
const { verifyPin, changePin, revokeSessions } = require('../controllers/pinManagementController');

router.post('/findOrCreate', protect, findOrCreateChannel);
router.get('/:workspaceId', protect, getWorkspaceChannels);
router.patch('/:id', protect, checkChannelRole('admin'), renameChannel);
router.delete('/:id', protect, deleteChannel);
router.post('/:id/leave', protect, leaveChannel);
router.get('/:id/members', protect, getChannelMembers);

// Role Management
router.patch('/:id/role', protect, checkChannelRole('admin'), updateMemberRole);
router.post('/:id/transfer-ownership', protect, checkChannelRole('owner'), transferOwnership);
router.delete('/:id/members/:userId', protect, checkChannelRole('admin'), removeMemberFromChannel);

// PIN Management Routes
router.post('/:id/verify-pin', protect, verifyPin);
router.put('/:id/change-pin', protect, checkChannelRole('admin'), changePin);
router.post('/:id/revoke-sessions', protect, checkChannelRole('admin'), revokeSessions);

module.exports = router;

