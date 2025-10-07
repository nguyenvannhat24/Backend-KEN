const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  board_id: { type: mongoose.Types.ObjectId, ref: 'Board', required: true },
  column_id: { type: mongoose.Types.ObjectId, ref: 'Column', required: true },
  swimlane_id: { type: mongoose.Types.ObjectId, ref: 'Swimlane' },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String },
  priority: { type: String },
  start_date: { type: Date },
  due_date: { type: Date },
  estimate_hours: { type: Number },
  created_by: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  assigned_to: { type: mongoose.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null }
}, { 
  collection: 'Tasks',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

TaskSchema.index({ deleted_at: 1 });

TaskSchema.pre(/^find/, function(next) {
  if (!this.getQuery().deleted_at && !this.getQuery().$or) {
    this.where({ deleted_at: null });
  }
  next();
});

module.exports = mongoose.model('Task', TaskSchema);
