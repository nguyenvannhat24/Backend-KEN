const mongoose_up = require('mongoose');
const { Schema: Schema_up } = require('./_shared');


const UserPointSchema = new Schema_up({
user_id: { type: String, ref: 'User', required: true, index: true },
center_id: { type: String, ref: 'Center', required: true, index: true },
points: { type: Number, default: 0 },
updated_at: { type: Date, default: Date.now },
}, { collection: 'user_points' });


UserPointSchema.index({ user_id: 1, center_id: 1 }, { name: 'UserPoint_index_9', unique: true });


const UserPoint = mongoose_up.model('UserPoint', UserPointSchema);
module.exports = UserPoint;