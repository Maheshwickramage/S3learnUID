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
  previewVideo: { type: String }, // Optional video preview
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
    // S3 URLs - previewImage already contains the folder path (e.g., "previews/123.png")
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${this.previewImage}`;
  }
  // Local URLs - add folder prefix if not already present
  const imagePath = this.previewImage.startsWith('previews/') ? this.previewImage : `previews/${this.previewImage}`;
  return `/uploads/${imagePath}`;
});

componentSchema.virtual('previewVideoUrl').get(function() {
  if (!this.previewVideo) return null;
  if (process.env.USE_S3 === 'true') {
    // S3 URLs - previewVideo already contains the folder path (e.g., "videos/123.mp4")
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${this.previewVideo}`;
  }
  // Local URLs - add folder prefix if not already present
  const videoPath = this.previewVideo.startsWith('videos/') ? this.previewVideo : `videos/${this.previewVideo}`;
  return `/uploads/${videoPath}`;
});

componentSchema.virtual('zipUrl').get(function() {
  if (process.env.USE_S3 === 'true') {
    // S3 URLs - zipFile already contains the folder path (e.g., "zips/123.zip")
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${this.zipFile}`;
  }
  // Local URLs - add folder prefix if not already present
  const zipPath = this.zipFile.startsWith('zips/') ? this.zipFile : `zips/${this.zipFile}`;
  return `/uploads/${zipPath}`;
});

componentSchema.set('toJSON', { virtuals: true });
componentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Component', componentSchema);
