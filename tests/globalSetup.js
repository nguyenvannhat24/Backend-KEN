// tests/globalSetup.js - Global setup cho integration tests
const mongoose = require('mongoose');

module.exports = async () => {
  console.log('🚀 Setting up test database...');
  
  // Kết nối database test (MongoDB Atlas)
  const testDbUri = process.env.DB_CONNECTION_STRING || 'mongodb+srv://phamdobanvia24h_db_user:aLJVXtyle8NV3Lai@cluster0.eufiomf.mongodb.net/KEN?retryWrites=true&w=majority&appName=Cluster0';
  
  try {
    await mongoose.connect(testDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Test database connected successfully');
    
    // Tạo indexes nếu cần
    await mongoose.connection.db.admin().ping();
    console.log('✅ Database ping successful');
    
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error.message);
    throw error;
  }
};
