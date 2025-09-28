const mongoose = require('mongoose');

/**
 * Role Schema - Định nghĩa cấu trúc dữ liệu cho bảng Roles
 * Collection: Roles
 */
const RoleSchema = new mongoose.Schema({
  // Tên role (unique)
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  
  // Mô tả role
  description: {
    type: String,
    trim: true,
    maxlength: 300
  }
}, {
  collection: 'Roles',
  timestamps: true
});

// Indexes để tối ưu hóa truy vấn (name đã có unique nên không cần thêm index)
RoleSchema.index({ createdAt: -1 });

// Virtual để lấy số lượng users có role này
RoleSchema.virtual('userCount', {
  ref: 'UserRole',
  localField: '_id',
  foreignField: 'role_id',
  count: true
});

// Ensure virtual fields are serialized
RoleSchema.set('toJSON', { virtuals: true });
RoleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Role', RoleSchema);
