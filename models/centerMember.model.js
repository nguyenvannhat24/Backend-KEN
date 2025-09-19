const mongoose_cm = require('mongoose');
const { Schema: Schema_cm } = require('./_shared');


const CenterMemberSchema = new Schema_cm({
center_id: { type: String, ref: 'Center', required: true, index: true },
user_id: { type: String, ref: 'User', required: true, index: true },
role_in_center: { type: String, maxlength: 50 },
}, { collection: 'center_members', timestamps: true });


CenterMemberSchema.index({ center_id: 1, user_id: 1 }, { name: 'CenterMember_index_3', unique: true });


const CenterMember = mongoose_cm.model('CenterMember', CenterMemberSchema);
module.exports = CenterMember;