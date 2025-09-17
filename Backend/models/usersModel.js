const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email:{ type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // hoặc 'barber', tùy bạn
  numberphone: { type: String },
  img: {
    type: String, // Đây là tên file hoặc đường dẫn
    default: '',  // Có thể để trống nếu chưa upload
    }
});
//  tạo ra barbetModel thừa kế từ Schema để có các getter setter
const UserModel =new mongoose.model('user', UserSchema);
module.exports = UserModel;

