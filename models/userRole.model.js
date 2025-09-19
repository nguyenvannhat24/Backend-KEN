const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserRoleSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role_id: { type: Schema.Types.ObjectId, ref: 'Role', required: true, index: true },
}, { collection: 'UserRoles', timestamps: true });

UserRoleSchema.index(
  { user_id: 1, role_id: 1 },
  { name: 'UserRole_index_0', unique: true }
);

const UserRole = mongoose.models.UserRole || mongoose.model('UserRole', UserRoleSchema);

module.exports = UserRole;
