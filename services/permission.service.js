const PermissionRepository = require('../repositories/permission.repository');

/**
 * Permission Service - Xử lý business logic cho Permission
 * Chứa các methods xử lý logic nghiệp vụ liên quan đến permission
 */
class PermissionService {

  /**
   * Lấy tất cả permissions
   * @returns {Promise<Array>} Danh sách tất cả permissions
   */
  async getAllPermissions() {
    try {
      console.log('🔍 Getting all permissions...');
      const permissions = await PermissionRepository.findAll();
      console.log(`✅ Found ${permissions.length} permissions`);
      return permissions;
    } catch (error) {
      console.error('❌ Error in getAllPermissions:', error);
      throw error;
    }
  }

  /**
   * Lấy permission theo ID
   * @param {string} id - ID của permission
   * @returns {Promise<Object>} Permission object
   * @throws {Error} Nếu không tìm thấy permission
   */
  async getPermissionById(id) {
    try {
      console.log(`🔍 Getting permission by ID: ${id}`);
      const permission = await PermissionRepository.findById(id);
      if (!permission) {
        console.log(`❌ Permission not found: ${id}`);
        throw new Error('Permission not found');
      }
      console.log(`✅ Found permission: ${permission.code}`);
      return permission;
    } catch (error) {
      console.error('❌ Error in getPermissionById:', error);
      throw error;
    }
  }

  /**
   * Tạo mới permission
   * @param {Object} data - Dữ liệu permission
   * @returns {Promise<Object>} Permission đã tạo
   * @throws {Error} Nếu code đã tồn tại
   */
  async createPermission(data) {
    try {
      console.log('🔍 Creating new permission...', data);
      
      // Validate required fields
      if (!data.code) {
        throw new Error('Permission code là bắt buộc');
      }

      // Kiểm tra trùng code
      const existing = await PermissionRepository.findByCode(data.code);
      if (existing) {
        console.log(`❌ Permission code already exists: ${data.code}`);
        throw new Error('Permission code already exists');
      }

      const permission = await PermissionRepository.create(data);
      console.log(`✅ Created permission successfully: ${permission.code}`);
      return permission;
    } catch (error) {
      console.error('❌ Error in createPermission:', error);
      throw error;
    }
  }

  /**
   * Cập nhật permission
   * @param {string} id - ID của permission
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<Object>} Permission đã cập nhật
   * @throws {Error} Nếu không tìm thấy permission
   */
  async updatePermission(id, data) {
    try {
      console.log(`🔍 Updating permission: ${id}`, data);
      const updated = await PermissionRepository.update(id, data);
      if (!updated) {
        console.log(`❌ Permission not found for update: ${id}`);
        throw new Error('Permission not found');
      }
      console.log(`✅ Updated permission successfully: ${updated.code}`);
      return updated;
    } catch (error) {
      console.error('❌ Error in updatePermission:', error);
      throw error;
    }
  }

  /**
   * Xóa permission
   * @param {string} id - ID của permission
   * @returns {Promise<Object>} Permission đã xóa
   * @throws {Error} Nếu không tìm thấy permission
   */
  async deletePermission(id) {
    try {
      console.log(`🔍 Deleting permission: ${id}`);
      const deleted = await PermissionRepository.delete(id);
      if (!deleted) {
        console.log(`❌ Permission not found for deletion: ${id}`);
        throw new Error('Permission not found');
      }
      console.log(`✅ Deleted permission successfully: ${deleted.code}`);
      return deleted;
    } catch (error) {
      console.error('❌ Error in deletePermission:', error);
      throw error;
    }
  }
}

module.exports = new PermissionService();
