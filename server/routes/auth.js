const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Register new creator
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: existingUser.email === email ? 'Email already exists' : 'Username already taken' 
      });
    }
    
    // Create user
    const user = new User({
      username: username.toLowerCase(),
      email,
      password,
      displayName: displayName || username,
      role: 'creator'
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
        totalDownloads: user.totalDownloads,
        totalUploads: user.totalUploads,
        level: user.level,
        points: user.points,
        badges: user.badges,
        rewards: user.rewards
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { displayName, bio, website } = req.body;
    
    if (displayName) req.user.displayName = displayName;
    if (bio !== undefined) req.user.bio = bio;
    if (website !== undefined) req.user.website = website;
    
    await req.user.save();
    
    res.json({ success: true, message: 'Profile updated', user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user stats & rewards
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const Component = require('../models/Component');
    const Reward = require('../models/Reward');
    
    // Get user's components
    const components = await Component.find({ creator: req.user._id });
    
    // Calculate stats
    const totalDownloads = components.reduce((sum, c) => sum + c.downloads, 0);
    const totalViews = components.reduce((sum, c) => sum + c.views, 0);
    const totalLikes = components.reduce((sum, c) => sum + c.likes, 0);
    
    // Update user stats
    req.user.totalUploads = components.length;
    req.user.totalDownloads = totalDownloads;
    
    // Check and award milestones
    await req.user.checkMilestones();
    await req.user.save();
    
    // Get claimed rewards
    const claimedRewards = await Reward.find({ user: req.user._id, claimed: true });
    
    res.json({
      success: true,
      stats: {
        totalUploads: components.length,
        totalDownloads,
        totalViews,
        totalLikes,
        level: req.user.level,
        points: req.user.points,
        badges: req.user.badges,
        rewards: req.user.rewards,
        claimedRewards: claimedRewards,
        recentComponents: components.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get public profile
router.get('/creator/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
      .select('-password -email');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }
    
    const Component = require('../models/Component');
    const components = await Component.find({ creator: user._id, isActive: true })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      creator: user,
      components
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = { router, authMiddleware };
