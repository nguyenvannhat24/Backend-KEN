const RoleRepository = require('../repositories/role.repository');
const UserRoleRepository = require('../repositories/userRole.repository');

/**
 * Role Service - Xử lý logic nghiệp vụ cho Role
 * Chứa các methods xử lý business logic cho Role
 */
class RoleService {

  /**
   * Lấy tất cả roles
   * @returns {Array} Danh sách tất cả roles
   */
  async getAllRoles() {
    try {
      console.log('📋 [RoleService] getAllRoles - Getting all roles');
      const roles = await RoleRepository.findAll();
      console.log(`✅ [RoleService] getAllRoles - Found ${roles.length} roles`);
      return roles;
    } catch (error) {
      console.error('❌ [RoleService] getAllRoles - Error:', error);
      throw error;
    }
  }

  /**
   * Lấy role theo ID
   * @param {String} id - ID của role
   * @returns {Object|null} Thông tin role hoặc null
   */
  async getRoleById(id) {
    try {
      console.log(`📋 [RoleService] getRoleById - Getting role with ID: ${id}`);
      const role = await RoleRepository.findById(id);
      if (role) {
        console.log(`✅ [RoleService] getRoleById - Found role: ${role.name}`);
      } else {
        console.log(`⚠️ [RoleService] getRoleById - Role not found with ID: ${id}`);
      }
      return role;
    } catch (error) {
      console.error('❌ [RoleService] getRoleById - Error:', error);
      throw error;
    }
  }

  /**
   * Lấy role theo tên
   * @param {String} name - Tên của role
   * @returns {Object|null} Thông tin role hoặc null
   */
  async getRoleByName(name) {
    try {
      console.log(`📋 [RoleService] getRoleByName - Getting role with name: ${name}`);
      const role = await RoleRepository.findByName(name);
      if (role) {
        console.log(`✅ [RoleService] getRoleByName - Found role: ${role.name}`);
      } else {
        console.log(`⚠️ [RoleService] getRoleByName - Role not found with name: ${name}`);
      }
      return role;
    } catch (error) {
      console.error('❌ [RoleService] getRoleByName - Error:', error);
      throw error;
    }
  }

  /**
   * Tạo role mới
   * @param {Object} roleData - Dữ liệu role mới
   * @returns {Object} Role đã tạo
   */
  async createRole(roleData) {
    try {
      console.log('📋 [RoleService] createRole - Creating new role:', roleData);
      
      // Validate input
      if (!roleData.name || !roleData.name.trim()) {
        throw new Error('Tên role là bắt buộc');
      }

      // Check if role already exists
      const existingRole = await RoleRepository.findByName(roleData.name.trim());
      if (existingRole) {
        throw new Error('Tên role đã tồn tại');
      }

      const newRole = await RoleRepository.create(roleData);
      console.log(`✅ [RoleService] createRole - Created role: ${newRole.name}`);
      return newRole;
    } catch (error) {
      console.error('❌ [RoleService] createRole - Error:', error);
      throw error;
    }
  }

  /**
   * Cập nhật role
   * @param {String} id - ID của role
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Object|null} Role đã cập nhật hoặc null
   */
  async updateRole(id, updateData) {
    try {
      console.log(`📋 [RoleService] updateRole - Updating role ID: ${id}`, updateData);
      
      // Check if role exists
      const existingRole = await RoleRepository.findById(id);
      if (!existingRole) {
        console.log(`⚠️ [RoleService] updateRole - Role not found with ID: ${id}`);
        return null;
      }

      // If updating name, check if new name already exists
      if (updateData.name && updateData.name !== existingRole.name) {
        const nameExists = await RoleRepository.findByName(updateData.name.trim());
        if (nameExists) {
          throw new Error('Tên role đã tồn tại');
        }
      }

      const updatedRole = await RoleRepository.update(id, updateData);
      console.log(`✅ [RoleService] updateRole - Updated role: ${updatedRole.name}`);
      return updatedRole;
    } catch (error) {
      console.error('❌ [RoleService] updateRole - Error:', error);
      throw error;
    }
  }

  /**
   * Xóa role
   * @param {String} id - ID của role
   * @returns {Object|null} Role đã xóa hoặc null
   */
  async deleteRole(id) {
    try {
      console.log(`📋 [RoleService] deleteRole - Deleting role ID: ${id}`);
      
      // Check if role exists
      const existingRole = await RoleRepository.findById(id);
      if (!existingRole) {
        console.log(`⚠️ [RoleService] deleteRole - Role not found with ID: ${id}`);
        return null;
      }

      // Check if role is being used by any user
      const usersWithRole = await UserRoleRepository.findByRoleId(id);
      if (usersWithRole && usersWithRole.length > 0) {
        throw new Error('Không thể xóa role đang được sử dụng bởi user');
      }

      const deletedRole = await RoleRepository.delete(id);
      console.log(`✅ [RoleService] deleteRole - Deleted role: ${deletedRole.name}`);
      return deletedRole;
    } catch (error) {
      console.error('❌ [RoleService] deleteRole - Error:', error);
      throw error;
    }
  }

  /**
   * Lấy role của user
   * @param {String} userId - ID của user
   * @returns {String|null} Tên role hoặc null
   */
async getUserRoles(userId) {
  try {
    console.log(`📋 [RoleService] getUserRoles - Getting roles for user ID: ${userId}`);
    const roles = await RoleRepository.GetRoles(userId);
    return roles;
  } catch (error) {
    console.error('❌ [RoleService] getUserRoles - Error:', error);
    throw error;
  }
}


  /**
   * Lấy role của user (legacy method - deprecated)
   * @deprecated Use getUserRole instead
   * @param {String} userId - ID của user
   * @returns {String|null} Tên role hoặc null
   */
  async viewRole(userId) {
    console.log('⚠️ [RoleService] viewRole - This method is deprecated, use getUserRole instead');
    return this.getUserRole(userId);
  }
  async getIdByName(nameRole){
    try {
         return await RoleRepository.getIdByName(nameRole);

    } catch (error) {
      console.error('lỗi ở getIDByName service' + error);
      throw error;
    }
  };
}

module.exports = new RoleService();