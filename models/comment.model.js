const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  created_at: { type: Date, default: Date.now }
}, { 
  collection: 'Comments',
  timestamps: true 
});

module.exports = mongoose.model('Comment', CommentSchema);