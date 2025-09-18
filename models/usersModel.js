const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email:{ type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // hoặc 'barber', tùy bạn
  numberphone: { type: String },

});
//  tạo ra barbetModel thừa kế từ Schema để có các getter setter
const UserModel =new mongoose.model('user', UserSchema);
module.exports = UserModel;

