const mongoose_up = require('mongoose');
const { Schema } = mongoose_up;

const UserPointSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  center_id: { type: Schema.Types.ObjectId, ref: 'Center', required: true, index: true },
  points: { type: Number, default: 0 },
}, { collection: 'UserPoints', timestamps: true });

// Một user chỉ có 1 bản ghi cho mỗi center
UserPointSchema.index({ user_id: 1, center_id: 1 }, { name: 'UserPoint_index_9', unique: true });

const UserPoint = mongoose_up.model('UserPoint', UserPointSchema);
module.exports = UserPoint;
