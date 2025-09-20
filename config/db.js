const mongoose = require('mongoose');
require('dotenv').config(); // đọc file .env


const connectDB = async () => {
  try {
    console.log("🔑 MONGO_URI =", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Đã kết nối MongoDB');
  } catch (err) {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
    process.exit(1); // Dừng server nếu kết nối lỗi
  }
};

connectDB(); // Gọi hàm ngay khi file được require
