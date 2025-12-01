const express = require('express');
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/s3');
const Component = require('../models/Component');
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');
const { authMiddleware } = require('./auth');

const USE_S3 = process.env.USE_S3 === 'true';
const S3_BUCKET = process.env.S3_BUCKET_NAME;

// S3 Storage
const s3Storage = multerS3({
  s3: s3Client,
  bucket: S3_BUCKET,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    let folder = 'previews';
    if (file.fieldname === 'zipFile') folder = 'zips';
    else if (file.fieldname === 'previewVideo') folder = 'videos';
    const filename = `${folder}/${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, filename);
  }
});

// Local Storage (fallback)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = 'uploads/previews';
    if (file.fieldname === 'zipFile') dest = 'uploads/zips';
    else if (file.fieldname === 'previewVideo') dest = 'uploads/videos';
    cb(null, path.join(__dirname, '..', dest));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: USE_S3 ? s3Storage : localStorage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'zipFile' && (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip'))) {
      cb(null, true);
    } else if (file.fieldname === 'previewImage' && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else if (file.fieldname === 'previewVideo' && file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Helper to delete S3 file
async function deleteS3File(key) {
  if (!USE_S3 || !key) return;
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key
    }));
  } catch (error) {
    console.error('S3 delete error:', error);
  }
}

// Helper to delete local file
function deleteLocalFile(filepath) {
  if (USE_S3) return;
  const fs = require('fs');
  fs.unlink(path.join(__dirname, '..', filepath), () => {});
}

// Verify admin key (legacy support - only for old admin key check)
router.get('/verify', adminAuth, (req, res) => {
  res.json({ success: true, message: 'Authenticated' });
});

// Upload component (with user auth)
router.post('/upload', authMiddleware, upload.fields([{ name: 'zipFile', maxCount: 1 }, { name: 'previewImage', maxCount: 1 }, { name: 'previewVideo', maxCount: 1 }]), async (req, res) => {
  try {
    const { name, description, category, tags, version, demoUrl } = req.body;
    if (!req.files?.zipFile?.[0] || !req.files?.previewImage?.[0]) {
      return res.status(400).json({ success: false, message: 'Both files required' });
    }
    
    const component = new Component({
      name,
      description: description || '',
      category,
      tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
      previewImage: USE_S3 ? req.files.previewImage[0].key : req.files.previewImage[0].filename,
      previewVideo: req.files.previewVideo?.[0] ? (USE_S3 ? req.files.previewVideo[0].key : req.files.previewVideo[0].filename) : undefined,
      zipFile: USE_S3 ? req.files.zipFile[0].key : req.files.zipFile[0].filename,
      demoUrl: demoUrl || '',
      version: version || '1.0.0',
      creator: req.user._id,
      creatorName: req.user.displayName || req.user.username
    });
    
    await component.save();
    
    // Update user stats
    req.user.totalUploads += 1;
    req.user.points += 10;
    req.user.calculateLevel();
    
    // Award rookie badge on first upload
    if (req.user.totalUploads === 1) {
      req.user.awardBadge('rookie');
    }
    
    await req.user.save();
    
    res.status(201).json({ success: true, message: 'Component uploaded!', data: component });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update component
router.put('/components/:id', authMiddleware, upload.fields([{ name: 'zipFile', maxCount: 1 }, { name: 'previewImage', maxCount: 1 }, { name: 'previewVideo', maxCount: 1 }]), async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) return res.status(404).json({ success: false, message: 'Not found' });
    
    const { name, description, category, tags, isActive, isFeatured } = req.body;
    if (name) component.name = name;
    if (description !== undefined) component.description = description;
    if (category) component.category = category;
    if (tags) component.tags = tags.split(',').map(t => t.trim());
    if (isActive !== undefined) component.isActive = isActive === 'true';
    if (isFeatured !== undefined) component.isFeatured = isFeatured === 'true';
    
    if (req.files?.zipFile?.[0]) {
      if (USE_S3) {
        await deleteS3File(component.zipFile);
        component.zipFile = req.files.zipFile[0].key;
      } else {
        deleteLocalFile(`uploads/zips/${component.zipFile}`);
        component.zipFile = req.files.zipFile[0].filename;
      }
    }
    if (req.files?.previewImage?.[0]) {
      if (USE_S3) {
        await deleteS3File(component.previewImage);
        component.previewImage = req.files.previewImage[0].key;
      } else {
        deleteLocalFile(`uploads/previews/${component.previewImage}`);
        component.previewImage = req.files.previewImage[0].filename;
      }
    }
    if (req.files?.previewVideo?.[0]) {
      if (component.previewVideo) {
        if (USE_S3) {
          await deleteS3File(component.previewVideo);
        } else {
          deleteLocalFile(`uploads/videos/${component.previewVideo}`);
        }
      }
      component.previewVideo = USE_S3 ? req.files.previewVideo[0].key : req.files.previewVideo[0].filename;
    }
    
    await component.save();
    res.json({ success: true, data: component });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete component
router.delete('/components/:id', authMiddleware, async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) return res.status(404).json({ success: false, message: 'Not found' });
    
    if (USE_S3) {
      await deleteS3File(component.zipFile);
      await deleteS3File(component.previewImage);
      if (component.previewVideo) await deleteS3File(component.previewVideo);
    } else {
      deleteLocalFile(`uploads/zips/${component.zipFile}`);
      deleteLocalFile(`uploads/previews/${component.previewImage}`);
      if (component.previewVideo) deleteLocalFile(`uploads/videos/${component.previewVideo}`);
    }
    
    await Component.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all (admin)
router.get('/components', authMiddleware, async (req, res) => {
  try {
    const components = await Component.find().sort({ createdAt: -1 });
    res.json({ success: true, data: components });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
