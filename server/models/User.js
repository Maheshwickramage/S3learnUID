const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  displayName: { type: String, trim: true, maxlength: 50 },
  bio: { type: String, trim: true, maxlength: 200 },
  avatar: { type: String, default: '' },
  website: { type: String, trim: true },
  
  // Stats
  totalUploads: { type: Number, default: 0 },
  totalDownloads: { type: Number, default: 0 },
  totalStars: { type: Number, default: 0 },
  
  // Rewards & Gamification
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{
    type: { type: String, enum: ['rookie', 'contributor', 'star', 'legend', 'milestone_100', 'milestone_500', 'milestone_1000', 'milestone_5000'] },
    earnedAt: { type: Date, default: Date.now }
  }],
  
  // Milestones for rewards
  rewards: [{
    milestone: { type: Number }, // 100, 500, 1000, etc
    type: { type: String, enum: ['badge', 'feature', 'certificate', 'gift'] },
    title: { type: String },
    description: { type: String },
    claimedAt: { type: Date, default: Date.now }
  }],
  
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'creator', 'admin'], default: 'creator' }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate level based on points
userSchema.methods.calculateLevel = function() {
  this.level = Math.floor(this.points / 100) + 1;
};

// Award badge
userSchema.methods.awardBadge = function(badgeType) {
  if (!this.badges.some(b => b.type === badgeType)) {
    this.badges.push({ type: badgeType });
  }
};

// Check and award milestone rewards
userSchema.methods.checkMilestones = async function() {
  const milestones = [
    { downloads: 100, type: 'badge', title: 'Rising Star 🌟', description: 'Reached 100 downloads!' },
    { downloads: 500, type: 'feature', title: 'Featured Creator ⭐', description: 'Your components are featured!' },
    { downloads: 1000, type: 'certificate', title: 'Master Creator 🏆', description: 'Digital certificate of excellence' },
    { downloads: 5000, type: 'gift', title: 'Legend Status 👑', description: 'Exclusive gift package!' }
  ];
  
  milestones.forEach(milestone => {
    if (this.totalDownloads >= milestone.downloads && 
        !this.rewards.some(r => r.milestone === milestone.downloads)) {
      this.rewards.push({
        milestone: milestone.downloads,
        type: milestone.type,
        title: milestone.title,
        description: milestone.description
      });
      this.points += milestone.downloads;
    }
  });
  
  this.calculateLevel();
};

// Remove password from JSON output
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
