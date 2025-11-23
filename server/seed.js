require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');
const Component = require('./models/Component');
const fs = require('fs');
const path = require('path');

const samples = [
  { name: 'Modern Dashboard', description: 'Admin dashboard with charts and analytics', category: 'Dashboard', tags: ['admin', 'charts', 'analytics'], previewImage: 'demo-dashboard.png', zipFile: 'dashboard.zip', downloads: 1234, stars: 4.8, isFeatured: true },
  { name: 'E-Commerce Card', description: 'Product card with hover effects and animations', category: 'Cards', tags: ['shop', 'product', 'ecommerce'], previewImage: 'demo-card.png', zipFile: 'card.zip', downloads: 892, stars: 4.6 },
  { name: 'Login Form', description: 'Beautiful glassmorphism login form', category: 'Forms', tags: ['auth', 'login', 'glass'], previewImage: 'demo-login.png', zipFile: 'login.zip', downloads: 2156, stars: 4.9, isFeatured: true },
  { name: 'Pricing Table', description: 'Three-tier pricing table with highlights', category: 'Tables', tags: ['pricing', 'saas', 'tiers'], previewImage: 'demo-pricing.png', zipFile: 'pricing.zip', downloads: 756, stars: 4.5 },
  { name: 'Hero Section', description: 'Animated hero section with CTA buttons', category: 'Landing', tags: ['landing', 'hero', 'cta'], previewImage: 'demo-hero.png', zipFile: 'hero.zip', downloads: 1567, stars: 4.7 },
  { name: 'Responsive Navbar', description: 'Mobile-friendly navigation bar', category: 'Navigation', tags: ['navbar', 'menu', 'responsive'], previewImage: 'demo-navbar.png', zipFile: 'navbar.zip', downloads: 3421, stars: 4.8 },
  { name: 'Contact Form', description: 'Modern contact form with validation', category: 'Forms', tags: ['contact', 'form', 'validation'], previewImage: 'demo-contact.png', zipFile: 'contact.zip', downloads: 987, stars: 4.7, isFeatured: true },
  { name: 'Stats Dashboard', description: 'Statistics cards with animations', category: 'Dashboard', tags: ['stats', 'cards', 'metrics'], previewImage: 'demo-stats.png', zipFile: 'stats.zip', downloads: 1543, stars: 4.6 }
];

// Add slugs to samples
const samplesWithSlugs = samples.map((sample, idx) => ({
  ...sample,
  slug: slugify(sample.name, { lower: true, strict: true }) + '-' + (Date.now() + idx).toString(36)
}));

// Create placeholder files if they don't exist
const previewDir = path.join(__dirname, 'uploads', 'previews');
const zipDir = path.join(__dirname, 'uploads', 'zips');

if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir, { recursive: true });
if (!fs.existsSync(zipDir)) fs.mkdirSync(zipDir, { recursive: true });

// Create empty placeholder files
samples.forEach(sample => {
  const previewPath = path.join(previewDir, sample.previewImage);
  const zipPath = path.join(zipDir, sample.zipFile);
  
  if (!fs.existsSync(previewPath)) fs.writeFileSync(previewPath, '');
  if (!fs.existsSync(zipPath)) fs.writeFileSync(zipPath, '');
});

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔌 Connected to MongoDB');
    
    await Component.deleteMany({});
    console.log('🗑️  Cleared existing components');
    
    const result = await Component.insertMany(samplesWithSlugs);
    console.log(`✅ Database seeded with ${result.length} components!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
