const mongoose_userRole = require('mongoose');
const { Schema: Schema_userRole } = require('./_shared');


const UserRoleSchema = new Schema_userRole({
user_id: { type: String, ref: 'User', required: true, index: true },
role_id: { type: String, ref: 'Role', required: true, index: true },
}, { collection: 'user_roles', timestamps: true });


UserRoleSchema.index({ user_id: 1, role_id: 1 }, { name: 'UserRole_index_0', unique: true });


const UserRole = mongoose_userRole.model('UserRole', UserRoleSchema);
module.exports = UserRole;