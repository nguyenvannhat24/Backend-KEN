const mongoose = require('mongoose');


const BoardSchema = new mongoose.Schema({
  
  title:      { type: String, required: true },
  description:{ type: String },
  is_template:{type: Boolean} ,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
},{ collection: 'Boards' });

module.exports = mongoose.model('Board', BoardSchema);
