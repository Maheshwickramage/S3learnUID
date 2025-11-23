const mongoose = require('mongoose');
const slugify = require('slugify');

const componentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, unique: true },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  category: {
    type: String,
    required: true,
    enum: ['Dashboard', 'Cards', 'Forms', 'Tables', 'Landing', 'Navigation', 'Modals', 'Charts', 'Other']
  },
  tags: [{ type: String, trim: true, lowercase: true }],
  previewImage: { type: String, required: true },
  zipFile: { type: String, required: true },
  downloads: { type: Number, default: 0 },
  stars: { type: Number, default: 5.0, min: 0, max: 5 },
  version: { type: String, default: '1.0.0' },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  
  // Creator info
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creatorName: { type: String, default: 'Anonymous' }, // Fallback for old components
  
  // Engagement
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 }
}, { timestamps: true });

componentSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  next();
});

componentSchema.index({ name: 'text', description: 'text', tags: 'text' });
componentSchema.index({ category: 1 });
componentSchema.index({ downloads: -1 });

componentSchema.virtual('previewUrl').get(function() {
  return `/uploads/previews/${this.previewImage}`;
});

componentSchema.virtual('zipUrl').get(function() {
  return `/uploads/zips/${this.zipFile}`;
});

componentSchema.set('toJSON', { virtuals: true });
componentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Component', componentSchema);
