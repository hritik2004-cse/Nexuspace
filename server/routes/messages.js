const express = require('express');
const router = express.Router();
const { 
  getMessages, 
  createMessage, 
  deleteMessage, 
  addReaction, 
  removeReaction, 
  pinMessage, 
  unpinMessage, 
  searchMessages 
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Base route /api/messages
router.route('/')
  .post(protect, createMessage);

router.get('/search', protect, searchMessages);

router.get('/:channelId', protect, getMessages);

router.delete('/:id', protect, deleteMessage);

// Reactions
router.route('/:id/react')
  .post(protect, addReaction)
  .delete(protect, removeReaction);

// Pinning
router.route('/:id/pin')
  .post(protect, pinMessage)
  .delete(protect, unpinMessage);

module.exports = router;
