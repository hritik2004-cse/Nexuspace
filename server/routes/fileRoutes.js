const express = require('express');
const router = express.Router();
const { uploadFile, getFileById, deleteFile } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, upload.single('file'), uploadFile);

router.route('/:id')
  .get(protect, getFileById)
  .delete(protect, deleteFile);

module.exports = router;
