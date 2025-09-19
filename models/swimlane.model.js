const mongoose_sw = require('mongoose');
const { uuidString: uuid_sw, Schema: Schema_sw } = require('./_shared');


const SwimlaneSchema = new Schema_sw({
_id: uuid_sw,
board_id: { type: String, ref: 'Board', required: true, index: true },
name: { type: String, required: true, maxlength: 100 },
order_index: { type: Number, required: true },
}, { collection: 'swimlanes', timestamps: true });


SwimlaneSchema.index({ board_id: 1, name: 1 }, { name: 'Swimlane_index_7', unique: true });


const Swimlane = mongoose_sw.model('Swimlane', SwimlaneSchema);
module.exports = Swimlane;