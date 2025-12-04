require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Reward = require('./models/Reward');

async function resetAndTestRewards() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Get user email from command line argument
    const email = process.argv[2];
    
    if (!email) {
      // Show all users
      const users = await User.find();
      console.log('\n👥 Available users:');
      users.forEach((user, i) => {
        console.log(`   ${user.email} - Current downloads: ${user.totalDownloads || 0}`);
      });
      console.log('\n💡 Usage: node reset-rewards.js <user-email> [download-count]');
      console.log('   Example: node reset-rewards.js user@example.com 101');
      process.exit(0);
    }

    const downloadCount = parseInt(process.argv[3]) || 101;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`\n📊 Current Status for ${user.username}:`);
    console.log(`   Downloads: ${user.totalDownloads || 0}`);
    console.log(`   Rewards: ${user.rewards?.length || 0}`);

    // Delete all rewards for this user
    const deletedRewards = await Reward.deleteMany({ user: user._id });
    console.log(`\n🗑️  Deleted ${deletedRewards.deletedCount} existing rewards`);

    // Clear user rewards array
    user.rewards = [];
    user.totalDownloads = downloadCount;
    await user.save();

    console.log(`\n✅ Reset complete!`);
    console.log(`   New download count: ${downloadCount}`);
    console.log(`   Rewards cleared: Yes`);
    console.log('\n🎉 Steps to test:');
    console.log('   1. Close the dashboard if open');
    console.log('   2. Login again');
    console.log('   3. Open the dashboard');
    console.log(`   4. You should see a reward popup for reaching 100 downloads!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetAndTestRewards();
