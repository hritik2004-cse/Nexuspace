const express = require('express');
const router = express.Router();
const { 
  createChannel, 
  getWorkspaceChannels, 
  getChannelDetails, 
  updateChannel, 
  deleteChannel 
} = require('../controllers/channelController');
const { protect } = require('../middleware/authMiddleware');

// Base route /api/channels
router.route('/')
  .post(protect, createChannel);

router.get('/:workspaceId', protect, getWorkspaceChannels);

router.get('/details/:id', protect, getChannelDetails);

router.route('/:id')
  .put(protect, updateChannel)
  .delete(protect, deleteChannel);

module.exports = router;
