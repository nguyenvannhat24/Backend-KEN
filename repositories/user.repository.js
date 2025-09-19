// phần này xử lí logic tương tác với database
const User = require('../models/usersModel');
const UserModel = require('../models/usersModel'); 
class UserRepository {
    // tìm người dùng theo id
  async findById(id) {
    return User.findById(id).lean();
  }
  
  async findByEmail(email) {
    return User.findOne({ email }).exec();
  }

  async findByName(email) {
    return await UserModel.findOne({ email });
  }

  async findByNumberPhone(numberphone){
    return await UserModel.findOne({numberphone});
  }
  async create(userData) {
    return User.create(userData);
  }
async findAll() {
  return User.find().lean();   // lấy tất cả user
}

}

module.exports = new UserRepository();