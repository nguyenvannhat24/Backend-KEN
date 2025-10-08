const userRoleRepo = require('../repositories/userRole.repository');
const roleRepository = require('../repositories/role.repository');

/**
 * UserRole Service - Xử lý business logic cho UserRole
 * Chứa các methods xử lý logic nghiệp vụ liên quan đến user-role
 */
class UserRoleService {

  /** Lấy tất cả user-role */
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

  /** Lấy 1 role của user (nếu mỗi user chỉ có 1 role) */
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

  /** Lấy tất cả role của user (nếu 1 user có nhiều role) */
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

  /** Thêm mới user-role */
async create(userRoleData) {
  try {
    if (!userRoleData.user_id) throw new Error('❌ user_id bị thiếu');
    if (!userRoleData.role_id) throw new Error('❌ role_id bị thiếu');

    const role = await roleRepository.findById(userRoleData.role_id);
    if (role?.name === "System_Manager") {
      throw new Error("❌ Không thể gán role System_Manager cho user khác");
    }
    console.log(role);

    // ✅ Kiểm tra trùng trước khi tạo
    const exists = await userRoleRepo.findByUserAndRole(userRoleData.user_id, userRoleData.role_id);
    if (exists) {
      console.log(`⚠️ User-role đã tồn tại, bỏ qua tạo mới: user_id=${userRoleData.user_id}, role_id=${userRoleData.role_id}`);
      return exists;
    }

    const newUserRole = await userRoleRepo.create(userRoleData);
    console.log('✅ Created user-role successfully:', newUserRole._id);
    return newUserRole;
  } catch (error) {
    console.error('❌ Error in create userRole:', error.message);
    throw error;
  }
}

  /** Cập nhật role của user-role record */
  async update(userRoleId, updateData) {
    try {
      const userRole = await userRoleRepo.findById(userRoleId);
      if (!userRole) throw new Error("User-role không tồn tại");

      // Check role cũ
    const role = await roleRepository.findById(userRole.role_id);
    if (role?.name === "System_Manager") {
      throw new Error("❌ Không thể gán role System_Manager cho user khác");
    }

      // Check role mới
      if (updateData.role_id) {
        const newRole = await roleRepository.findById(updateData.role_id);
        if (newRole?.name === "System_Manager") {
          throw new Error("❌ Không thể gán System_Manager khi update");
        }
      }

      const updatedUserRole = await userRoleRepo.update(userRoleId, updateData);
      console.log('✅ Updated user-role successfully');
      return updatedUserRole;
    } catch (error) {
      console.error('❌ Error in update userRole:', error.message);
      throw error;
    }
  }

  /** Xóa 1 user-role theo id */
  async delete(userRoleId) {
    try {
      const userRole = await userRoleRepo.findById(userRoleId);
      if (!userRole) throw new Error("User-role không tồn tại");
    const role = await roleRepository.findById(userRole.role_id);
    if (role?.name === "System_Manager") {
      throw new Error("❌ Không thể gán role System_Manager cho user khác");
    }
      const deleted = await userRoleRepo.delete(userRoleId);
      console.log('✅ Deleted user-role successfully');
      return deleted;
    } catch (error) {
      console.error('❌ Error in delete userRole:', error.message);
      throw error;
    }
  }

  /** Xóa tất cả role của 1 user */
  async deleteByUser(userId) {
    try {
      console.log(`🔍 Deleting all roles for user: ${userId}`);

      // Lấy danh sách roles hiện có của user
      const userRoles = await userRoleRepo.findByUser(userId);

      // Lấy thêm tên role để check System_Manager
      const rolesWithName = await Promise.all(
        userRoles.map(async ur => {
          const role = await roleRepository.findById(ur.role_id);
          return { ...ur, name: role?.name };
        })
      );

      const protectedRoles = ["System_Manager"];
      const rolesToDelete = rolesWithName.filter(r => !protectedRoles.includes(r.name));

      if (rolesToDelete.length === 0) {
        console.log(`⚠️ No deletable roles for user: ${userId}`);
        return { deletedCount: 0 };
      }

      const result = await userRoleRepo.deleteManyByIds(rolesToDelete.map(r => r._id));
      console.log(`✅ Deleted ${result.deletedCount} roles for user: ${userId}`);

      return result;
    } catch (error) {
      console.error('❌ Error in deleteByUser:', error.message);
      throw error;
    }
  }

  /** Tìm 1 user-role theo user_id và role_id */
  async findByUserAndRole(user_id, role_id) {
    if (!user_id) throw new Error('❌ user_id bị thiếu');
    if (!role_id) throw new Error('❌ role_id bị thiếu');

    return await userRoleRepo.findByUserAndRole(user_id, role_id);
  }

  /** Lấy danh sách user theo role name */
  async findIdRoleByName(nameRole) {
    const role = await roleRepository.findByName(nameRole);
    if (!role) throw new Error('❌ Không tìm thấy role');

    const idRole = role.data.data._id;
    if (!idRole) throw new Error('❌ Không tìm thấy id role');

    const users = await userRoleRepo.findUserByIdRole(idRole);
    return users.data;
  }
}

module.exports = new UserRoleService();
