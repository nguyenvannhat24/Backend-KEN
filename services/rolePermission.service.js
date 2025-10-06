const rolePermissionRepository = require('../repositories/rolePermission.repository');
const roleRepository = require("../repositories/role.repository");
class RolePermissionService {
  async createRolePermission(data) {
    return await rolePermissionRepository.create(data);
  }

  async getAllRolePermissions() {
    return await rolePermissionRepository.findAll();
  }

  async getRolePermissionById(id) {
    return await rolePermissionRepository.findById(id);
  }

  async getPermissionsByRole(roleId) {
    return await rolePermissionRepository.findByRoleId(roleId);
  }

  async updateRolePermission(id, data) {
    return await rolePermissionRepository.update(id, data);
  }

  async deleteRolePermission(id) {
    return await rolePermissionRepository.delete(id);
  }

  async deleteRolePermissionsByRole(roleId) {
    return await rolePermissionRepository.deleteByRoleId(roleId);
  }

  /**
   * ✅ Lấy RolePermission theo danh sách ID
   */
  async getByIds(ids) {
    return await rolePermissionRepository.findByIds(ids);
  }

  /**
   * ✅ Lấy RolePermission theo danh sách role_id
   */
  async getByRoleIds(roleIds) {
    return await rolePermissionRepository.findByRoleIds(roleIds);
  }
  
  async getPermissionsByNameRole(nameRole) {
    const role = await roleRepository.findByName(nameRole);
    if (!role) {
      throw new Error(`Không tìm thấy role có tên "${nameRole}"`);
    }

    // Tìm tất cả quyền gắn với role này
    const rolePermissions = await rolePermissionRepository.findByRoleIds([role._id]);

    // Trả về danh sách permission (đã populate)
    return rolePermissions.map(rp => rp.permission_id);
  }


  async updateByRoleId(roleId, permissionIds) {

  // 1️⃣ Xóa tất cả quyền cũ của role
  await rolePermissionRepository.deleteByRoleId(roleId);
  console.log(roleId);
  // 2️⃣ Thêm lại quyền mới (nếu có)
    const newRolePermissions = permissionIds.map(pid => ({
      role_id: roleId,
      permission_id: pid
    }));

  if (newRolePermissions.length > 0) {
    await rolePermissionRepository.insertMany(newRolePermissions);
  }

  return { success: true, message: "Cập nhật quyền cho role thành công" };
}

}

module.exports = new RolePermissionService();
