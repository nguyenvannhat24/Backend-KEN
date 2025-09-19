const mongoose_tpl = require('mongoose');
const { uuidString: uuid_tpl, Schema: Schema_tpl } = require('./_shared');


const TemplateSchema = new Schema_tpl({
_id: uuid_tpl,
name: { type: String, maxlength: 200 },
description: { type: String, maxlength: 500 },
created_by: { type: String, ref: 'User', required: true, index: true },
created_at: { type: Date, default: Date.now },
updated_at: { type: Date, default: Date.now },
}, { collection: 'templates' });


TemplateSchema.pre('save', function(next){ this.updated_at = new Date(); next(); });


const Template = mongoose_tpl.model('Template', TemplateSchema);
module.exports = Template;