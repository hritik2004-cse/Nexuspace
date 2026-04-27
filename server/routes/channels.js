const express = require('express');
const router = express.Router();
const { findOrCreateChannel, getWorkspaceChannels, deleteChannel } = require('../controllers/channelController');
const { protect, checkPermission } = require('../middleware/authMiddleware');
const { verifyPin, changePin, revokeSessions } = require('../controllers/pinManagementController');

router.post('/findOrCreate', protect, findOrCreateChannel);
router.get('/:workspaceId', protect, getWorkspaceChannels);
router.delete('/:id', protect, checkPermission('channel:delete'), deleteChannel);

// PIN Management Routes
router.post('/:id/verify-pin', protect, verifyPin);
router.put('/:id/change-pin', protect, changePin);
router.post('/:id/revoke-sessions', protect, revokeSessions);

module.exports = router;
