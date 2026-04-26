const express = require('express');
const router = express.Router();
const { findOrCreateChannel, getWorkspaceChannels, deleteChannel } = require('../controllers/channelController');
const { protect } = require('../middleware/authMiddleware');

router.post('/findOrCreate', protect, findOrCreateChannel);
router.get('/:workspaceId', protect, getWorkspaceChannels);
router.delete('/:id', protect, deleteChannel);

module.exports = router;
