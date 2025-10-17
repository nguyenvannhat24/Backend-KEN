const mongoose = require('mongoose');
const { Schema } = mongoose;

const CenterMemberSchema = new Schema({
center_id: { type: Schema.Types.ObjectId, ref: 'Center', required: true, index: true },
user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
role_in_center: {
 type: String, 
 enum: ['Center_Admin', 'Manager', 'Staff', 'Member'],  // ✅ chỉ cho phép các quyền này
 default: 'Member',                   
 required: true
},
}, { collection: 'CenterMembers', timestamps: true });


CenterMemberSchema.index({ center_id: 1, user_id: 1 }, { name: 'CenterMember_index_3', unique: true });


const CenterMember = mongoose.model('CenterMember', CenterMemberSchema);
module.exports = CenterMember;