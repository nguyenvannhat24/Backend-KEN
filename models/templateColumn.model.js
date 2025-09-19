const mongoose_tc = require('mongoose');
const { uuidString: uuid_tc, Schema: Schema_tc } = require('./_shared');


const TemplateColumnSchema = new Schema_tc({
_id: uuid_tc,
template_id: { type: String, ref: 'Template', required: true, index: true },
name: { type: String, maxlength: 100 },
order_index: { type: Number },
}, { collection: 'template_columns', timestamps: true });


const TemplateColumn = mongoose_tc.model('TemplateColumn', TemplateColumnSchema);
module.exports = TemplateColumn;