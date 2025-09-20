const mongoose = require('mongoose');

/**
 * RolePermission Schema - Định nghĩa cấu trúc dữ liệu cho bảng RolePermissions
 * Collection: RolePermissions
 * Liên kết giữa Role và Permission (Many-to-Many)
 */
const RolePermissionSchema = new mongoose.Schema({
  // ID của role
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  
  // ID của permission
  permission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
    required: true
  },
  
  // Ngày gán permission
  assigned_at: {
    type: Date,
    default: Date.now
  },
  
  // Người gán permission
  assigned_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Trạng thái permission
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  collection: 'RolePermissions',
  timestamps: true
});

// Compound unique index để tránh duplicate role-permission
RolePermissionSchema.index(
  { role_id: 1, permission_id: 1 },
  { 
    name: 'RolePermission_index_1', 
    unique: true 
  }
);

// Indexes để tối ưu hóa truy vấn
RolePermissionSchema.index({ role_id: 1 });
RolePermissionSchema.index({ permission_id: 1 });
RolePermissionSchema.index({ status: 1 });

// Virtual để populate thông tin role
RolePermissionSchema.virtual('role', {
  ref: 'Role',
  localField: 'role_id',
  foreignField: '_id',
  justOne: true
});

// Virtual để populate thông tin permission
RolePermissionSchema.virtual('permission', {
  ref: 'Permission',
  localField: 'permission_id',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
RolePermissionSchema.set('toJSON', { virtuals: true });
RolePermissionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('RolePermission', RolePermissionSchema);
