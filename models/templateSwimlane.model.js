const mongoose_ts = require('mongoose');
const { uuidString: uuid_ts, Schema: Schema_ts } = require('./_shared');


const TemplateSwimlaneSchema = new Schema_ts({
_id: uuid_ts,
template_id: { type: String, ref: 'Template', required: true, index: true },
name: { type: String, maxlength: 100 },
order_index: { type: Number },
}, { collection: 'template_swimlanes', timestamps: true });


const TemplateSwimlane = mongoose_ts.model('TemplateSwimlane', TemplateSwimlaneSchema);
module.exports = TemplateSwimlane;