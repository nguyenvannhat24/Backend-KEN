const mongoose_center = require('mongoose');
const { uuidString: uuid_center, Schema: Schema_center } = require('./_shared');


const CenterSchema = new Schema_center({
_id: uuid_center,
name: { type: String, required: true, maxlength: 200, index: true },
address: { type: String, maxlength: 300 },
}, { collection: 'centers', timestamps: true });


const Center = mongoose_center.model('Center', CenterSchema);
module.exports = Center;