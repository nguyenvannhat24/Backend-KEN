const mongoose_tag = require('mongoose');
const { uuidString: uuid_tag, Schema: Schema_tag } = require('./_shared');


const TagSchema = new Schema_tag({
_id: uuid_tag,
name: { type: String, required: true, maxlength: 50, index: true, unique: true },
color: { type: String, maxlength: 20 },
}, { collection: 'tags', timestamps: true });


const Tag = mongoose_tag.model('Tag', TagSchema);
module.exports = Tag;