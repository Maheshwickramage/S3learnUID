const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Component = require('../models/Component');
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');
const { authMiddleware } = require('./auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = file.fieldname === 'zipFile' ? 'uploads/zips' : 'uploads/previews';
    cb(null, path.join(__dirname, '..', dest));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'zipFile' && (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip'))) cb(null, true);
    else if (file.fieldname === 'previewImage' && file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Invalid file type'), false);
  }
});

// Verify admin key (legacy support - only for old admin key check)
router.get('/verify', adminAuth, (req, res) => {
  res.json({ success: true, message: 'Authenticated' });
});

// Upload component (with user auth)
router.post('/upload', authMiddleware, upload.fields([{ name: 'zipFile', maxCount: 1 }, { name: 'previewImage', maxCount: 1 }]), async (req, res) => {
  try {
    const { name, description, category, tags, version } = req.body;
    if (!req.files?.zipFile?.[0] || !req.files?.previewImage?.[0]) {
      return res.status(400).json({ success: false, message: 'Both files required' });
    }
    
    const component = new Component({
      name,
      description: description || '',
      category,
      tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
      previewImage: req.files.previewImage[0].filename,
      zipFile: req.files.zipFile[0].filename,
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
router.put('/components/:id', authMiddleware, upload.fields([{ name: 'zipFile', maxCount: 1 }, { name: 'previewImage', maxCount: 1 }]), async (req, res) => {
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
      fs.unlink(path.join(__dirname, '../uploads/zips', component.zipFile), () => {});
      component.zipFile = req.files.zipFile[0].filename;
    }
    if (req.files?.previewImage?.[0]) {
      fs.unlink(path.join(__dirname, '../uploads/previews', component.previewImage), () => {});
      component.previewImage = req.files.previewImage[0].filename;
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
    
    fs.unlink(path.join(__dirname, '../uploads/zips', component.zipFile), () => {});
    fs.unlink(path.join(__dirname, '../uploads/previews', component.previewImage), () => {});
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
