const userRoleRepo = require('../repositories/userRole.repository');

/**
 * UserRole Service - Xử lý business logic cho UserRole
 * Chứa các methods xử lý logic nghiệp vụ liên quan đến user-role
 */
class UserRoleService {

  /**
   * Lấy tất cả user-role
   * @returns {Promise<Array>} Danh sách tất cả user-role
   */
  async viewAll() {
    try {
      console.log('🔍 Getting all user-roles...');
      const userRoles = await userRoleRepo.findAll();
      console.log(`✅ Found ${userRoles.length} user-roles`);
      return userRoles;
    } catch (error) {
      console.error('❌ Error in viewAll userRoles:', error);
      throw error;
    }
  }

  /**
   * Lấy 1 role của user (nếu mỗi user chỉ có 1 role)
   * @param {string} userId - ID của user
   * @returns {Promise<Object|null>} Role của user hoặc null
   */
  async getRole(userId) {
    try {
      console.log(`🔍 Getting role for user: ${userId}`);
      const role = await userRoleRepo.findRoleByUser(userId);
      if (role) {
        console.log(`✅ Found role for user: ${userId}`);
      } else {
        console.log(`❌ No role found for user: ${userId}`);
      }
      return role;
    } catch (error) {
      console.error('❌ Error in getRole:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả role của user (nếu 1 user có nhiều role)
   * @param {string} userId - ID của user
   * @returns {Promise<Array>} Danh sách roles của user
   */
  async getRoles(userId) {
    try {
      console.log(`🔍 Getting all roles for user: ${userId}`);
      const roles = await userRoleRepo.findRolesByUser(userId);
      console.log(`✅ Found ${roles.length} roles for user: ${userId}`);
      return roles;
    } catch (error) {
      console.error('❌ Error in getRoles:', error);
      throw error;
    }
  }

  /**
   * Thêm mới user-role
   * @param {Object} userRoleData - Dữ liệu user-role
   * @returns {Promise<Object>} User-role đã tạo
   */
async create(userRoleData) {
  try {
    console.log('🔍 Creating new user-role...', userRoleData);
    
    // Kiểm tra từng field và ném lỗi rõ ràng
    if (!userRoleData.user_id) {
      throw new Error('❌ user_id bị thiếu');
    }
    if (!userRoleData.role_id) {
      throw new Error('❌ role_id bị thiếu');
    
    }

    const newUserRole = await userRoleRepo.create(userRoleData);
    console.log('✅ Created user-role successfully:', newUserRole._id);
    return newUserRole;
  } catch (error) {
    console.error('❌ Error in create userRole:', error.message);
    throw error;
  }
}


  /**
   * Cập nhật role của user-role record
   * @param {string} userRoleId - ID của user-role
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise<Object|null>} User-role đã cập nhật hoặc null
   */
  async update(userRoleId, updateData) {
    try {
      console.log(`🔍 Updating user-role: ${userRoleId}`, updateData);
      const updatedUserRole = await userRoleRepo.update(userRoleId, updateData);
      if (updatedUserRole) {
        console.log('✅ Updated user-role successfully');
      } else {
        console.log('❌ User-role not found for update');
      }
      return updatedUserRole;
    } catch (error) {
      console.error('❌ Error in update userRole:', error);
      throw error;
    }
  }

  /**
   * Xóa 1 user-role theo id
   * @param {string} userRoleId - ID của user-role
   * @returns {Promise<Object|null>} User-role đã xóa hoặc null
   */
  async delete(userRoleId) {
    try {
      console.log(`🔍 Deleting user-role: ${userRoleId}`);
      const deleted = await userRoleRepo.delete(userRoleId);
      if (deleted) {
        console.log('✅ Deleted user-role successfully');
      } else {
        console.log('❌ User-role not found for deletion');
      }
      return deleted;
    } catch (error) {
      console.error('❌ Error in delete userRole:', error);
      throw error;
    }
  }

  /**
   * Xóa tất cả role của 1 user
   * @param {string} userId - ID của user
   * @returns {Promise<Object>} Kết quả xóa
   */
  async deleteByUser(userId) {
    try {
      console.log(`🔍 Deleting all roles for user: ${userId}`);
      const result = await userRoleRepo.deleteByUser(userId);
      console.log(`✅ Deleted ${result.deletedCount} roles for user: ${userId}`);
      return result;
    } catch (error) {
      console.error('❌ Error in deleteByUser:', error);
      throw error;
    }
  }
  async findByUserAndRole(user_id, role_id) {
    if (!user_id) throw new Error('❌ user_id bị thiếu');
    if (!role_id) throw new Error('❌ role_id bị thiếu');

    return await userRoleRepo.findByUserAndRole(user_id, role_id);
  }
}

module.exports = new UserRoleService();
