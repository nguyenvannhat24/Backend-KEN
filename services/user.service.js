const userRepo = require('../repositories/user.repository');
const bcrypt = require('bcrypt');
const UserModel = require('../models/usersModel'); 
class UserService {


  async validateUser(nameOrEmail, password) {
    // cho phép login bằng name hoặc email
    const user = await userRepo.findByEmail(nameOrEmail) 
              || await userRepo.findByName(nameOrEmail);
    if (!user) return null;

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;

    return user;
  }
}

module.exports = new UserService();
