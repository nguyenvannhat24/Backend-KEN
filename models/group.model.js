const mongoose = require('mongoose');
const { Schema } = mongoose;

const GroupSchema = new Schema({
  center_id: { type: Schema.Types.ObjectId, ref: 'Center', index: true },
  name: { type: String, required: true, maxlength: 200 },
  description: { type: String, maxlength: 300 },
}, { collection: 'Groups', timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);
