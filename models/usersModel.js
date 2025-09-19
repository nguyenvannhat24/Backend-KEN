const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true },
  username:     { type: String, unique: true },
  password_hash:{ type: Buffer },                 // cho login local
  full_name:    { type: String },
  avatar_url:   { type: String },
  status:       { type: String },
  created_at:   { type: Date, default: Date.now },
  updated_at:   { type: Date, default: Date.now }
},{ collection: 'User' });

module.exports = mongoose.model('User', UserSchema);
