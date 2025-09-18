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

  async findByName(name) {
    return await UserModel.findOne({ name });
  }

  async create(userData) {
    return User.create(userData);
  }
 
}

module.exports = new UserRepository();