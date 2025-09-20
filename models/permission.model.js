const mongoose = require('mongoose');

/**
 * Permission Schema - Định nghĩa cấu trúc dữ liệu cho bảng Permissions
 * Collection: Permissions
 */
const PermissionSchema = new mongoose.Schema({
  // Mã permission (unique)
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 100
  },
  
  // Mô tả permission
  description: {
    type: String,
    trim: true,
    maxlength: 300
  }
}, {
  collection: 'Permissions',
  timestamps: true
});

// Indexes để tối ưu hóa truy vấn
PermissionSchema.index({ code: 1 });
PermissionSchema.index({ createdAt: -1 });

// Virtual để lấy số lượng roles có permission này
PermissionSchema.virtual('roleCount', {
  ref: 'RolePermission',
  localField: '_id',
  foreignField: 'permission_id',
  count: true
});

// Ensure virtual fields are serialized
PermissionSchema.set('toJSON', { virtuals: true });
PermissionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Permission', PermissionSchema);

