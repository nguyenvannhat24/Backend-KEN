const mongoose_notif = require('mongoose');
const { uuidString: uuid_notif, Schema: Schema_notif } = require('./_shared');


const NotificationSchema = new Schema_notif({
_id: uuid_notif,
user_id: { type: String, ref: 'User', required: true, index: true },
title: { type: String, maxlength: 200 },
body: { type: String, maxlength: 1000 },
type: { type: String, maxlength: 50 },
created_at: { type: Date, default: Date.now },
read_at: { type: Date },
}, { collection: 'notifications' });


const Notification = mongoose_notif.model('Notification', NotificationSchema);
module.exports = Notification;