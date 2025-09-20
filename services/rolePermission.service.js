const RolePermissionRepository = require('../repositories/rolePermission.repository');

/**
 * RolePermission Service - Xử lý business logic cho RolePermission
 * Chứa các methods xử lý logic nghiệp vụ liên quan đến role-permission
 */
class RolePermissionService {

  /**
   * Lấy tất cả role-permissions
   * @returns {Promise<Array>} Danh sách tất cả role-permissions
   */
  async getAllRolePermissions() {
    try {
      console.log('🔍 Getting all role-permissions...');
      const rolePermissions = await RolePermissionRepository.getAll();
      console.log(`✅ Found ${rolePermissions.length} role-permissions`);
      return rolePermissions;
    } catch (error) {
      console.error('❌ Error in getAllRolePermissions:', error);
      throw error;
    }
  }

  /**
   * Tạo mới role-permission
   * @param {Object} data - Dữ liệu role-permission
   * @returns {Promise<Object>} Role-permission đã tạo
   */
  async createRolePermission(data) {
    try {
      console.log('🔍 Creating new role-permission...', data);
      
      // Validate required fields
      if (!data.role_id || !data.permission_id) {
        throw new Error('role_id và permission_id là bắt buộc');
      }

      const rolePermission = await RolePermissionRepository.create(data);
      console.log('✅ Created role-permission successfully:', rolePermission._id);
      return rolePermission;
    } catch (error) {
      console.error('❌ Error in createRolePermission:', error);
      throw error;
    }
  }

  /**
   * Lấy role-permission theo ID
   * @param {string} id - ID của role-permission
   * @returns {Promise<Object|null>} Role-permission object hoặc null
   */
  async getRolePermissionById(id) {
    try {
      console.log(`🔍 Getting role-permission by ID: ${id}`);
      const rolePermission = await RolePermissionRepository.getById(id);
      if (rolePermission) {
        console.log(`✅ Found role-permission: ${id}`);
      } else {
        console.log(`❌ Role-permission not found: ${id}`);
      }
      return rolePermission;
    } catch (error) {
      console.error('❌ Error in getRolePermissionById:', error);
      throw error;
    }
  }

  /**
   * Cập nhật role-permission
   * @param {string} id - ID của role-permission
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<Object|null>} Role-permission đã cập nhật hoặc null
   */
  async updateRolePermission(id, data) {
    try {
      console.log(`🔍 Updating role-permission: ${id}`, data);
      const updated = await RolePermissionRepository.update(id, data);
      if (updated) {
        console.log('✅ Updated role-permission successfully');
      } else {
        console.log('❌ Role-permission not found for update');
      }
      return updated;
    } catch (error) {
      console.error('❌ Error in updateRolePermission:', error);
      throw error;
    }
  }

  /**
   * Xóa role-permission
   * @param {string} id - ID của role-permission
   * @returns {Promise<Object|null>} Role-permission đã xóa hoặc null
   */
  async deleteRolePermission(id) {
    try {
      console.log(`🔍 Deleting role-permission: ${id}`);
      const deleted = await RolePermissionRepository.delete(id);
      if (deleted) {
        console.log('✅ Deleted role-permission successfully');
      } else {
        console.log('❌ Role-permission not found for deletion');
      }
      return deleted;
    } catch (error) {
      console.error('❌ Error in deleteRolePermission:', error);
      throw error;
    }
  }
}

module.exports = new RolePermissionService();
