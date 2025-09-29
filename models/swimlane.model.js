const mongoose = require('mongoose');
const { Schema } = mongoose;

const SwimlaneSchema = new Schema({

board_id: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
name: { type: String, required: true, maxlength: 100 },
order_index: { type: Number, required: true },
}, { collection: 'Swimlanes', timestamps: true });


module.exports = mongoose.model('Swimlane', SwimlaneSchema);