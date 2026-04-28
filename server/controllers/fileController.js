const File = require('../models/File');
const { asyncHandler } = require('../middleware/errorMiddleware');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Upload a file
 * @route   POST /api/files/upload
 */
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const { workspaceId, channelId } = req.body;

  const file = await File.create({
    name: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
    type: req.file.mimetype,
    size: req.file.size,
    uploadedBy: req.user._id,
    workspaceId,
    channelId
  });

  res.status(201).json(file);
});

/**
 * @desc    Get file details
 * @route   GET /api/files/:id
 */
const getFileById = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id).populate('uploadedBy', 'name username avatar').lean();
  if (!file) {
    res.status(404);
    throw new Error('File not found');
  }
  res.status(200).json(file);
});

/**
 * @desc    Delete a file
 * @route   DELETE /api/files/:id
 */
const deleteFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) {
    res.status(404);
    throw new Error('File not found');
  }

  // Auth check: Only uploader or admin
  if (file.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Delete from filesystem
  const filePath = path.join(__dirname, '..', file.url);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await file.deleteOne();
  res.status(200).json({ success: true, message: 'File deleted' });
});

module.exports = { uploadFile, getFileById, deleteFile };
