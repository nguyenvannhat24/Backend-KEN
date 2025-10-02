const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    maxlength: 50, 
    index: true, 
    unique: true 
  },
  color: { 
    type: String, 
    maxlength: 20,
    default: '#007bff'
  },
  board_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Board',
    index: true
  }
}, { 
  collection: 'Tags',
  timestamps: true 
});

module.exports = mongoose.model('Tag', TagSchema);