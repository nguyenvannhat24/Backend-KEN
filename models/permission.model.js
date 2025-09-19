const mongoose_perm = require('mongoose');
const { uuidString: uuid_perm, Schema: Schema_perm } = require('./_shared');


const PermissionSchema = new Schema_perm({
_id: uuid_perm,
code: { type: String, required: true, maxlength: 100, unique: true, index: true },
description: { type: String, maxlength: 300 },
}, { collection: 'permissions', timestamps: true });


const Permission = mongoose_perm.model('Permission', PermissionSchema);
module.exports = Permission;