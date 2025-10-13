const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid');

const ActivityLogSchema = new Schema({
_id: { type: String, default: () => uuidv4() },
user_id: { type: String, ref: 'User', index: true },
action: { type: String, maxlength: 100 },
target_type: { type: String, maxlength: 50 },
target_id: { type: String },
created_at: { type: Date, default: Date.now },
}, { collection: 'activity_logs' });


const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
module.exports = ActivityLog;