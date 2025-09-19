const mongoose_al = require('mongoose');
const { uuidString: uuid_al, Schema: Schema_al } = require('./_shared');


const ActivityLogSchema = new Schema_al({
_id: uuid_al,
user_id: { type: String, ref: 'User', index: true },
action: { type: String, maxlength: 100 },
target_type: { type: String, maxlength: 50 },
target_id: { type: String },
created_at: { type: Date, default: Date.now },
}, { collection: 'activity_logs' });


const ActivityLog = mongoose_al.model('ActivityLog', ActivityLogSchema);
module.exports = ActivityLog;