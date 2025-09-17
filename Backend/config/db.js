const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://nhat:123@cluster0.ajpeazo.mongodb.net/CodeGym?retryWrites=true&w=majority&appName=Cluster0');
    //mongodb+srv://<db_username>:<db_password>@cluster0.ajpeazo.mongodb.net/
    console.log('✅ Đã kết nối MongoDB');
  } catch (err) {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
    process.exit(1); // Dừng server nếu kết nối lỗi
  }
};

connectDB(); // Gọi hàm ngay khi file được require
