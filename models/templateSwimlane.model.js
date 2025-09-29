const mongoose = require('mongoose');
const { Schema } = mongoose;

const TemplateSwimlaneSchema = new Schema({

template_id: {type: Schema.Types.ObjectId , ref: 'Template', required: true, index: true },
name: { type: String, maxlength: 100 },
order_index: { type: Number },
}, { collection: 'TemplateSwimlanes', timestamps: true });

module.exports = mongoose.model('TemplateSwimlane', TemplateSwimlaneSchema);