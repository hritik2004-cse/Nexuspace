const express = require('express');
const router = express.Router();
const { getMessages, createMessage, reactToMessage, togglePinMessage } = require('../controllers/messageController');
const { protect, checkPermission, verifyChannelAccess } = require('../middleware/authMiddleware');

router.get('/:channelId', protect, verifyChannelAccess, getMessages);
router.post('/', protect, verifyChannelAccess, createMessage);
router.put('/:id/react', protect, verifyChannelAccess, reactToMessage);
router.put('/:id/pin', protect, checkPermission('message:delete'), togglePinMessage); // Only admins can pin

module.exports = router;
