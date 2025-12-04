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
  previewImage: { type: String, required: true }, // Main preview image (backward compatibility)
  images: [{ type: String }], // Array of up to 5 images
  previewVideo: { type: String }, // Optional video preview (S3 key or local filename)
  zipFile: { type: String, required: true },
  demoUrl: { type: String, trim: true }, // URL to live interactive demo (CodeSandbox, StackBlitz, etc)
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
  if (process.env.USE_S3 === 'true') {
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${this.previewImage}`;
  }
  return `/uploads/previews/${this.previewImage}`;
});

componentSchema.virtual('imagesUrls').get(function() {
  if (!this.images || this.images.length === 0) return [];
  const baseUrl = process.env.USE_S3 === 'true' 
    ? `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/`
    : '/uploads/previews/';
  return this.images.map(img => baseUrl + img);
});

componentSchema.virtual('previewVideoUrl').get(function() {
  if (!this.previewVideo) return null;
  if (process.env.USE_S3 === 'true') {
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${this.previewVideo}`;
  }
  return `/uploads/videos/${this.previewVideo}`;
});

componentSchema.virtual('zipUrl').get(function() {
  if (process.env.USE_S3 === 'true') {
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${this.zipFile}`;
  }
  return `/uploads/zips/${this.zipFile}`;
});

componentSchema.set('toJSON', { virtuals: true });
componentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Component', componentSchema);
