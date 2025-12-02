const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  milestone: { type: Number, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['badge', 't-shirt', 'cap', 'certificate', 'gift-package'], required: true },
  
  // Shipping details
  shippingInfo: {
    fullName: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    addressLine1: { type: String, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true },
    size: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] } // For t-shirt/cap
  },
  
  status: {
    type: String,
    enum: ['pending', 'address-submitted', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  trackingNumber: { type: String },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  notes: { type: String },
  
  claimedAt: { type: Date, default: Date.now },
  claimed: { type: Boolean, default: false }
}, { timestamps: true });

rewardSchema.index({ user: 1, milestone: 1 }, { unique: true });

module.exports = mongoose.model('Reward', rewardSchema);
