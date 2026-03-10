const express = require('express');
const router = express.Router();
const { findOrCreateChannel } = require('../controllers/channelController');
const { protect } = require('../middleware/authMiddleware');

router.post('/findOrCreate', protect, findOrCreateChannel);

module.exports = router;
