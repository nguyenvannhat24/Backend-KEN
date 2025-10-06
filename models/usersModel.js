const mongoose = require('mongoose');

/**
 * User Schema - Định nghĩa cấu trúc dữ liệu cho bảng users
 * Collection: users
 */
const UserSchema = new mongoose.Schema({
  // Thông tin cơ bản
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  username: {
    type: String,
    unique: true,
    trim: true,
    sparse: true // Cho phép null nhưng unique khi có giá trị
  },
 
  // Mật khẩu (đã hash)
  password_hash: {
    type: String,
  
  },
  
  // Thông tin cá nhân
  full_name: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  avatar_url: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Trạng thái tài khoản
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'active'
  },
  
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now
  },
  
  updated_at: {
    type: Date,
    default: Date.now
  }
  
}, {
  collection: 'users',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes để tối ưu hóa truy vấn (email và username đã có unique nên không cần thêm index)
UserSchema.index({ status: 1 });

// Middleware để cập nhật updated_at trước khi save
UserSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('User', UserSchema);
