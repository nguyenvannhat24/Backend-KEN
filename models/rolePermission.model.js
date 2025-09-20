const mongoose = require('mongoose');

const RolePermissionSchema = new mongoose.Schema({
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
    index: true
  },
  permission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
    required: true,
    index: true
  }
}, {
  collection: 'RolePermissions',
  timestamps: true
});

// Tạo unique index để tránh gán trùng cùng một permission cho cùng một role
RolePermissionSchema.index(
  { role_id: 1, permission_id: 1 },
  { name: 'RolePermission_index_1', unique: true }
);

module.exports = mongoose.model('RolePermission', RolePermissionSchema);
