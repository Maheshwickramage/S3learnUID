const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  component: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Component', 
    required: true,
    index: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    index: true
  },
  // For tracking anonymous downloads
  ipAddress: { type: String },
  userAgent: { type: String },
  // Fingerprint to identify unique anonymous users
  fingerprint: { type: String, index: true },
  downloadedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

// Compound index to prevent duplicate downloads by same user
downloadSchema.index({ component: 1, user: 1 }, { unique: true, sparse: true });
// Index for anonymous users (fingerprint-based)
downloadSchema.index({ component: 1, fingerprint: 1 });

module.exports = mongoose.model('Download', downloadSchema);
