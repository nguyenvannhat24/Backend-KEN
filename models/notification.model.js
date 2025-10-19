const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid');

const NotificationSchema = new Schema({
_id: { type: String, default: () => uuidv4() },
user_id: { type: String, ref: 'User', required: true, index: true },
title: { type: String, maxlength: 200 },
body: { type: String, maxlength: 1000 },
type: { type: String, maxlength: 50 },
created_at: { type: Date, default: Date.now },
read_at: { type: Date },
}, { collection: 'notifications' });


const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;
