const userRoleRepo = require('../repositories/userRole.repository');

const bcrypt = require('bcrypt');

class UserRoleService {
  async viewAll(){
    // lấy tất cả
    const user = await userRoleRepo.findAll();
    return user ;
  }

  async getRole(IdUser){
    const userRole = await userRoleRepo.findAll();
  return userRole;
  }

}

module.exports = new UserRoleService();
