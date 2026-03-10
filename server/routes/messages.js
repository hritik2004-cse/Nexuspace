const express = require('express');
const router = express.Router();
const { getMessages, createMessage, reactToMessage, togglePinMessage } = require('../controllers/messageController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/:channelId', protect, getMessages);
router.post('/', protect, createMessage);
router.put('/:id/react', protect, reactToMessage);
router.put('/:id/pin', protect, admin, togglePinMessage); // Only admins can pin

module.exports = router;
