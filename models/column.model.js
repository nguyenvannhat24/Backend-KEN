const mongoose = require('mongoose');
const { Schema } = mongoose;

const ColumnSchema = new Schema({
  board_id: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
  name: { type: String, required: true, maxlength: 100 },
  order: { type: Number, required: true },
}, { collection: 'Columns', timestamps: true });


  module.exports = mongoose.model('Column', ColumnSchema);