const express = require('express');
const router = express.Router();
const Reward = require('../models/Reward');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user's rewards
router.get('/my-rewards', auth, async (req, res) => {
  try {
    const rewards = await Reward.find({ user: req.user.id }).sort({ milestone: 1 });
    res.json({ success: true, rewards });
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Check for new milestone achievements
router.get('/check-milestones', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const milestones = [
      { value: 100, title: 'Rising Star 🌟', type: 'badge' },
      { value: 500, title: 'Featured Creator ⭐', type: 't-shirt' },
      { value: 1000, title: 'Master Creator 🏆', type: 'certificate' },
      { value: 5000, title: 'Legend Status 👑', type: 'gift-package' }
    ];

    const totalDownloads = user.totalDownloads || 0;
    const existingRewards = await Reward.find({ user: req.user.id });
    const existingMilestones = existingRewards.map(r => r.milestone);

    const newRewards = [];
    for (const milestone of milestones) {
      if (totalDownloads >= milestone.value && !existingMilestones.includes(milestone.value)) {
        const reward = new Reward({
          user: req.user.id,
          milestone: milestone.value,
          title: milestone.title,
          type: milestone.type
        });
        await reward.save();
        newRewards.push(reward);
      }
    }

    res.json({ success: true, newRewards, totalDownloads });
  } catch (error) {
    console.error('Check milestones error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit shipping address for reward
router.post('/submit-address/:rewardId', auth, async (req, res) => {
  try {
    const reward = await Reward.findOne({ _id: req.params.rewardId, user: req.user.id });
    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward not found' });
    }

    const { fullName, email, phone, addressLine1, addressLine2, city, state, postalCode, country, size } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !addressLine1 || !city || !postalCode || !country) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    // Validate size for physical items
    if ((reward.type === 't-shirt' || reward.type === 'cap') && !size) {
      return res.status(400).json({ success: false, message: 'Please select a size' });
    }

    reward.shippingInfo = {
      fullName,
      email,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      size: size || undefined
    };
    reward.status = 'address-submitted';
    reward.claimed = true;

    await reward.save();

    res.json({ success: true, message: 'Shipping address submitted successfully!', reward });
  } catch (error) {
    console.error('Submit address error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Get all rewards (for fulfillment)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isCreator) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const rewards = await Reward.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json({ success: true, rewards });
  } catch (error) {
    console.error('Get all rewards error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Update reward status
router.put('/admin/update-status/:rewardId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isCreator) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { status, trackingNumber, notes } = req.body;
    const reward = await Reward.findById(req.params.rewardId);

    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward not found' });
    }

    reward.status = status || reward.status;
    reward.trackingNumber = trackingNumber || reward.trackingNumber;
    reward.notes = notes || reward.notes;

    if (status === 'shipped' && !reward.shippedAt) {
      reward.shippedAt = new Date();
    }
    if (status === 'delivered' && !reward.deliveredAt) {
      reward.deliveredAt = new Date();
    }

    await reward.save();

    res.json({ success: true, message: 'Reward status updated', reward });
  } catch (error) {
    console.error('Update reward status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
