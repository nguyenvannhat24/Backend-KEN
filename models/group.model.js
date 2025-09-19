const mongoose_group = require('mongoose');
const { uuidString: uuid_group, Schema: Schema_group } = require('./_shared');


const GroupSchema = new Schema_group({
_id: uuid_group,
center_id: { type: String, ref: 'Center', index: true },
name: { type: String, required: true, maxlength: 200 },
description: { type: String, maxlength: 300 },
}, { collection: 'groups', timestamps: true });


const Group = mongoose_group.model('Group', GroupSchema);
module.exports = Group;