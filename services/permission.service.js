const PermissionRepository = require('../repositories/permission.repository');

class PermissionService {
  // Lấy tất cả permissions
  async getAllPermissions() {
    return await PermissionRepository.findAll();
  }

  // Lấy permission theo ID
  async getPermissionById(id) {
    const permission = await PermissionRepository.findById(id);
    if (!permission) {
      throw new Error('Permission not found');
    }
    return permission;
  }

  // Tạo mới permission
  async createPermission(data) {
    // kiểm tra trùng code
    const existing = await PermissionRepository.findByCode(data.code);
    if (existing) {
      throw new Error('Permission code already exists');
    }
    return await PermissionRepository.create(data);
  }

  // Cập nhật permission
  async updatePermission(id, data) {
    const updated = await PermissionRepository.update(id, data);
    if (!updated) {
      throw new Error('Permission not found');
    }
    return updated;
  }

  // Xóa permission
  async deletePermission(id) {
    const deleted = await PermissionRepository.delete(id);
    if (!deleted) {
      throw new Error('Permission not found');
    }
    return deleted;
  }
}

module.exports = new PermissionService();
