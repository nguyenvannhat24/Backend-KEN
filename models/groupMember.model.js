const mongoose_gm = require('mongoose');
const { Schema: Schema_gm } = require('./_shared');


const GroupMemberSchema = new Schema_gm({
group_id: { type: String, ref: 'Group', required: true, index: true },
user_id: { type: String, ref: 'User', required: true, index: true },
role_in_group: { type: String, maxlength: 50 },
}, { collection: 'group_members', timestamps: true });


GroupMemberSchema.index({ group_id: 1, user_id: 1 }, { name: 'GroupMember_index_4', unique: true });


const GroupMember = mongoose_gm.model('GroupMember', GroupMemberSchema);
module.exports = GroupMember;