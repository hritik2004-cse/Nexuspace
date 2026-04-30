const express = require('express');
const router = express.Router();
const { getMessages, createMessage, reactToMessage, togglePinMessage, deleteMessage, editMessage } = require('../controllers/messageController');
const { protect, checkPermission, verifyChannelAccess } = require('../middleware/authMiddleware');

router.get('/:channelId', protect, verifyChannelAccess, getMessages);
router.post('/', protect, verifyChannelAccess, createMessage);
router.put('/:id/react', protect, verifyChannelAccess, reactToMessage);
router.put('/:id/pin', protect, checkPermission('message:delete'), togglePinMessage);
router.put('/:id', protect, verifyChannelAccess, editMessage);
router.delete('/:id', protect, verifyChannelAccess, deleteMessage);

module.exports = router;

