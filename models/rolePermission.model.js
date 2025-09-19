const mongoose_rp = require('mongoose');
const { Schema: Schema_rp } = require('./_shared');


const RolePermissionSchema = new Schema_rp({
role_id: { type: String, ref: 'Role', required: true, index: true },
permission_id: { type: String, ref: 'Permission', required: true, index: true },
}, { collection: 'role_permissions', timestamps: true });


RolePermissionSchema.index({ role_id: 1, permission_id: 1 }, { name: 'RolePermission_index_1', unique: true });


const RolePermission = mongoose_rp.model('RolePermission', RolePermissionSchema);
module.exports = RolePermission;