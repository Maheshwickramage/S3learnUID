const express = require('express');
const router = express.Router();
const path = require('path');
const Component = require('../models/Component');

// Get all components
router.get('/', async (req, res) => {
  try {
    const { category, search, sort = 'newest', page = 1, limit = 12 } = req.query;
    let query = { isActive: true };
    
    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    let sortOption = {};
    switch (sort) {
      case 'popular': sortOption = { downloads: -1 }; break;
      case 'rating': sortOption = { stars: -1 }; break;
      case 'oldest': sortOption = { createdAt: 1 }; break;
      default: sortOption = { createdAt: -1 };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [components, total] = await Promise.all([
      Component.find(query).populate('creator', 'username displayName avatar level badges').sort(sortOption).skip(skip).limit(parseInt(limit)),
      Component.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: components,
      pagination: { current: parseInt(page), pages: Math.ceil(total / parseInt(limit)), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single component
router.get('/:id', async (req, res) => {
  try {
    let component = await Component.findById(req.params.id);
    if (!component) component = await Component.findOne({ slug: req.params.id, isActive: true });
    if (!component) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: component });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Download component
router.get('/download/:id', async (req, res) => {
  try {
    const component = await Component.findById(req.params.id).populate('creator');
    if (!component) return res.status(404).json({ success: false, message: 'Not found' });
    
    component.downloads += 1;
    await component.save();
    
    // Update creator stats and check for milestones
    if (component.creator) {
      const User = require('../models/User');
      const creator = await User.findById(component.creator);
      if (creator) {
        creator.totalDownloads += 1;
        creator.points += 1;
        await creator.checkMilestones();
        await creator.save();
      }
    }
    
    const filePath = path.join(__dirname, '../uploads/zips', component.zipFile);
    res.download(filePath, `${component.slug}.zip`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Component.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data: categories.map(c => ({ name: c._id, count: c.count })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get stats
router.get('/meta/stats', async (req, res) => {
  try {
    const [total, downloads, cats] = await Promise.all([
      Component.countDocuments({ isActive: true }),
      Component.aggregate([{ $match: { isActive: true } }, { $group: { _id: null, total: { $sum: '$downloads' } } }]),
      Component.distinct('category')
    ]);
    res.json({ success: true, data: { components: total, downloads: downloads[0]?.total || 0, categories: cats.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
