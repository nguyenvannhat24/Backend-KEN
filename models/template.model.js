const mongoose = require('mongoose');
const { Schema } = mongoose;

const TemplateSchema = new Schema({
name: { type: String, maxlength: 200 },
description: { type: String, maxlength: 500 },
created_by: { type: String, ref: 'User', required: true, index: true },
created_at: { type: Date, default: Date.now },
updated_at: { type: Date, default: Date.now },
}, { collection: 'Templates' });


module.exports = mongoose.model('Template', TemplateSchema);