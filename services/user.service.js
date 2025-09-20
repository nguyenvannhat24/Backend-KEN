const userRepo = require('../repositories/user.repository');
const bcrypt = require('bcrypt');
const UserModel = require('../models/usersModel'); 
class UserService {

async validateUser(email, password) {
    console.log(`Đang kiểm tra user: ${email}`);

    const user = await userRepo.findByEmail(email);
    if (!user) {
        console.log(`Không tìm thấy user với email: ${email}`);
        return null;
    }

    if (user.password_hash !== password) {
        console.log(`Mật khẩu không đúng cho user: ${email}`);
        return null;
    }

    console.log(`Đăng nhập thành công cho user: ${email}`);
    return user;
}



  async viewAll(){
    // lấy tất cả người dùng 
    const user = await userRepo.findAll();
    return user ;
  }

   async getAllUsers() {
    return UserRepository.findAll();
  }

  async getUserById(id) {
    return UserRepository.findById(id);
  }

  async getUserByEmail(email) {
    return UserRepository.findByEmail(email);
  }

  async getUserByName(name) {
    return UserRepository.findByName(name);
  }

  async getUserByNumberPhone(numberphone) {
    return UserRepository.findByNumberPhone(numberphone);
  }

  async createUser(data) {
    return UserRepository.create(data);
  }

  async updateUser(id, data) {
    return UserRepository.update(id, data);
  }

  async deleteUser(id) {
    return UserRepository.delete(id);
  }
}

module.exports = new UserService();
