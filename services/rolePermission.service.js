const RolePermissionRepository = require('../repositories/rolePermission.repository');

class RolePermissionService {
  async getAllRolePermissions() {
    return RolePermissionRepository.getAll();
  }

  async createRolePermission(data) {
    return RolePermissionRepository.create(data);
  }

  async getRolePermissionById(id) {
    return RolePermissionRepository.getById(id);
  }

  async updateRolePermission(id, data) {
    return RolePermissionRepository.update(id, data);
  }

  async deleteRolePermission(id) {
    return RolePermissionRepository.delete(id);
  }
}

module.exports = new RolePermissionService();
