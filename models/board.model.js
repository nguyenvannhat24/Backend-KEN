const mongoose = require('mongoose');


const BoardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  created_by: { type: mongoose.Types.ObjectId, ref: 'User', required: true, index: true },
  is_template: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { 
  collection: 'Boards',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Board', BoardSchema);
