const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  board_id:    { type: mongoose.Types.ObjectId, ref: 'Board', required: true },
  column_id:   { type: mongoose.Types.ObjectId, ref: 'Column', required: true },
  swimlane_id: { type: mongoose.Types.ObjectId, ref: 'Swimlane' },
  title:       { type: String, required: true },
  description: { type: String },
  status:      { type: String },
  priority:    { type: String },
  start_date:  { type: Date },
  due_date:    { type: Date },
  estimate_hours: { type: Number },
  created_by:  { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  assigned_to: { type: mongoose.Types.ObjectId, ref: 'User' },
  created_at:  { type: Date, default: Date.now },
  updated_at:  { type: Date, default: Date.now }
},{ collection: 'Task' });

module.exports = mongoose.model('Task', TaskSchema);
