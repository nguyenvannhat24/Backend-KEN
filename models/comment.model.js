const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
}, { 
  collection: 'Comments',
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('Comment', CommentSchema);