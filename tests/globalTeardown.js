// tests/globalTeardown.js - Global teardown cho integration tests (KHÔNG XÓA DATA)
const mongoose = require('mongoose');

module.exports = async () => {
  console.log('🧹 Cleaning up test database connections...');
  
  try {
    // Chỉ đóng kết nối, KHÔNG xóa data
    if (mongoose.connection.readyState === 1) {
      console.log('📊 Database collections preserved');
      console.log('✅ Test data kept for inspection');
      
      // Đóng kết nối
      await mongoose.connection.close();
      console.log('✅ Test database connection closed');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    // Force close connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
};
