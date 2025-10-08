const UserRole = require("../models/userRole.model");
const Role = require("../models/role.model");

class UserRoleRepository {
    // Tìm role theo user_id
    async findRoleByUser(userId) {
 const userRoles = await UserRole.find({ user_id: userId.toString() }).lean();
  if (!userRoles || userRoles.length === 0) return [];

  const roles = await Role.find({ _id: { $in: userRoles.map(ur => ur.role_id) } }).lean();
  return roles;
    }

    // Lấy tất cả UserRole
    async findAll() {
        return await UserRole.find().lean();
    }

    // Lấy tất cả role theo user_id (nếu 1 user có nhiều role)
    async findRolesByUser(userId) {
        return await UserRole.find({ user_id: userId.toString() })
            .populate("role_id") // trả thêm thông tin role
            .lean();
    }
    // lấy tất cả user theo role id
    async findUserByIdRole(roleId){
      return await UserRole.find({ role_id: roleId.toString() })
           
            .lean();
    }

    // Thêm mới user-role
    async create(userRoleData) {
        return await UserRole.create(userRoleData);
    }

    // Cập nhật role của user
    async update(userRoleId, updateData) {
        return await UserRole.findByIdAndUpdate(userRoleId, updateData, { new: true }).lean();
    }

    // Xóa user-role theo id
    async delete(userRoleId) {
        return await UserRole.findByIdAndDelete(userRoleId).lean();
    }

    // Xóa tất cả role của 1 user
    async deleteByUser(userId) {
        return await UserRole.deleteMany({ user_id: userId.toString() });
    }

    async  findByUserAndRole(user_id, role_id){
        return await UserRole.findOne({ user_id, role_id });
    }

/**
 * Đếm số người dùng theo role
     * @param {string} roleName - tên role (ví dụ: "admin", "user", ...)
 */


 async  countUsersByRole(roleId) {
  try {
    // 1️⃣ Đếm số bản ghi trong bảng UserRole có role_id tương ứng
    const count = await UserRole.countDocuments({ role_id: roleId, status: 'active' });

    // 2️⃣ Lấy danh sách user tương ứng (nếu muốn in ra)
    const users = await UserRole.find({ role_id: roleId, status: 'active' })
      .populate('user_id', 'username email');

    console.log(`✅ Role ID "${roleId}" hiện có ${count} người dùng đang active.`);
    console.log('👥 Danh sách người dùng:', users.map(u => u.user_id));

    return count;
  } catch (error) {
    console.error('❌ Lỗi khi đếm người dùng theo role_id:', error);
    return 0;
  }
}
async deleteManyByIds(ids) {
  return await UserRole.deleteMany({ _id: { $in: ids } });
}
 async findByUser(userId) {
    if (!userId) throw new Error('❌ userId bị thiếu');

    // Trả về mảng các document UserRole của user
    const userRoles = await UserRole.find({ user_id: userId }).populate('role_id'); 
    // populate('role_id') nếu bạn muốn lấy thông tin role chi tiết

    return userRoles;
  }

/* Tìm 1 user-role theo ID
   * @param {string} userRoleId - ID của user-role
   * @returns {Promise<Object|null>} user-role hoặc null nếu không tìm thấy
   */
  async findById(userRoleId) {
    if (!userRoleId) throw new Error('userRoleId bị thiếu');

    try {
      const userRole = await UserRole.findById(userRoleId).lean();
      return userRole; // trả về object hoặc null
    } catch (error) {
      console.error('❌ Error in UserRoleRepository.findById:', error);
      throw error;
    }
  }
}

module.exports = new UserRoleRepository();
