const mongoose = require('mongoose');
const { Schema } = mongoose;

const TemplateColumnSchema = new Schema({
template_id: {type: Schema.Types.ObjectId, ref: 'Template', required: true, index: true },
name: { type: String, maxlength: 100 },
order_index: { type: Number },
}, { collection: 'TemplateColumns', timestamps: true });


module.exports = mongoose.model('TemplateColumn', TemplateColumnSchema);