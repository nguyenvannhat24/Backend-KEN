const mongoose = require('mongoose');
require('dotenv').config();

async function debugLogin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}, {collection: 'users'}));
    
    console.log('🔍 Searching for user: nhatx5xxx@gmail.com');
    const user = await User.findOne({ email: 'nhatx5xxx@gmail.com' });
    
    if (user) {
      console.log('✅ User found:');
      console.log(JSON.stringify(user, null, 2));
      console.log('Password field:', user.password_hash);
    } else {
      console.log('❌ User not found');
      
      // List all users
      const allUsers = await User.find();
      console.log('All users in database:');
      allUsers.forEach(u => console.log(`- ${u.email} (${u._id})`));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

debugLogin();
