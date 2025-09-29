const mongoose = require('mongoose');
require('dotenv').config(); // đọc file .env


const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Đã kết nối MongoDB');
  } catch (err) {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  }
};

connectDB(); // Gọi hàm ngay khi file được require
