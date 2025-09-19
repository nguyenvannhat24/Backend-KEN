const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema({
  center_id:  { type: mongoose.Types.ObjectId, ref: 'Center' },
  title:      { type: String, required: true },
  description:{ type: String },
  created_by: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
},{ collection: 'Board' });

module.exports = mongoose.model('Board', BoardSchema);
