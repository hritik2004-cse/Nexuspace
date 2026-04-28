const express = require('express');
const router = express.Router();
const { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getNotifications);

router.put('/read-all', protect, markAllAsRead);

router.route('/:id')
  .put(protect, markAsRead)
  .delete(protect, deleteNotification);

module.exports = router;
