const userRoleRepo = require('../repositories/userRole.repository');

class UserRoleService {
  // Lấy tất cả user-role
  async viewAll() {
    return await userRoleRepo.findAll();
  }

  // Lấy 1 role của user (nếu mỗi user chỉ có 1 role)
  async getRole(userId) {
    return await userRoleRepo.findRoleByUser(userId);
  }

  // Lấy tất cả role của user (nếu 1 user có nhiều role)
  async getRoles(userId) {
    return await userRoleRepo.findRolesByUser(userId);
  }

  // Thêm mới user-role
  async create(userRoleData) {
    return await userRoleRepo.create(userRoleData);
  }

  // Cập nhật role của user-role record
  async update(userRoleId, updateData) {
    return await userRoleRepo.update(userRoleId, updateData);
  }

  // Xóa 1 user-role theo id
  async delete(userRoleId) {
    return await userRoleRepo.delete(userRoleId);
  }

  // Xóa tất cả role của 1 user
  async deleteByUser(userId) {
    return await userRoleRepo.deleteByUser(userId);
  }
}

module.exports = new UserRoleService();
