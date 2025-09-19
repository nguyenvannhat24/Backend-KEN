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
}

module.exports = new UserService();
