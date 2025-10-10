const rolePermissionRepository = require('../repositories/rolePermission.repository');
const roleRepository = require("../repositories/role.repository");
const UserRole = require( '../models/userRole.model.js');
const Role = require( '../models/role.model.js');
const userRoleRepository = require('../repositories/userRole.repository.js');
const mongoose = require('mongoose');
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
  // 0️⃣ Kiểm tra role có phải role hệ thống không
  const role = await roleRepository.findById(roleId);
  if (!role) {
    return { success: false, message: "Role không tồn tại" };
  }
  
 if ((role.name || "").trim().toLowerCase() === "system_manager".toLowerCase()) {
  console.log("⚠️ Ngăn không sửa role System_Manager");
  return { success: false, message: "Không thể sửa quyền của role hệ thống" };
}


  // 1️⃣ Xóa tất cả quyền cũ của role
  await rolePermissionRepository.deleteByRoleId(roleId);

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

 async countUsersByRole(roleId) {
    try {
      const role = await Role.findById(roleId);
      if (!role) {
        console.log(`❌ Không tìm thấy role có id: ${roleId}`);
        return 0;
      }

      const count = await UserRole.countDocuments({ role_id: role._id, status: 'active' });
      console.log(`📊 Role '${role.name}' đang được dùng bởi ${count} user.`);
      return count;
    } catch (error) {
      console.error("❌ Lỗi khi đếm user theo role:", error);
      return 0;
    }
  }
async updateRolePermissions(userId, permissionIds) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("🔹 Bắt đầu cập nhật role và permission cho user:", userId);

    // 1️⃣ Lấy tất cả role của user
      const userRoles = await userRoleRepository.findRolesByUser(userId);
      console.log("🔹 Role hiện tại của user:", userRoles);

    let roleId;

    if (userRoles.length > 0) {
      const currentRole = userRoles[0].role_id;
      const count = await this.countUsersByRole(currentRole._id);

      console.log(`📊 Số user đang dùng role '${currentRole.name}':`, count);

      if (count > 1) {
        // 🧱 Nếu có nhiều user đang dùng role này → tạo role riêng
        const existingPrivateRole = await Role.findOne({ name: `role_for_${userId}` });
        if (existingPrivateRole) {
          console.log("⚠️ Role riêng đã tồn tại:", existingPrivateRole._id);
          roleId = existingPrivateRole._id;
        } else {
          const newRole = await Role.create([{ name: `role_for_${userId}` }], { session });
          roleId = newRole[0]._id;
          console.log("🆕 Tạo role riêng:", roleId);

          // Gán role mới cho user
          await UserRole.create([{ user_id: userId, role_id: roleId }], { session });
          console.log("👤 Gán role mới cho user:", userId);
        }
      } else {
        // ✅ Nếu chỉ mình user này có role đó → dùng luôn role cũ
        roleId = currentRole._id;
        console.log("✅ Dùng role hiện tại:", roleId);
      }
    } else {
      // 🧩 Nếu user chưa có role nào → tạo mới hoàn toàn
      const newRole = await Role.create([{ name: `role_for_${userId}` }], { session });
      roleId = newRole[0]._id;
      console.log("🆕 User chưa có role, tạo mới:", roleId);

      await UserRole.create([{ user_id: userId, role_id: roleId }], { session });
    }

    // 2️⃣ Xóa permission cũ của role này
    await rolePermissionRepository.deleteByRoleId(roleId, { session });
    console.log("🧹 Đã xóa permission cũ của role:", roleId);

    // 3️⃣ Thêm permission mới
    if (permissionIds?.length > 0) {
      const newPermissions = permissionIds.map(pid => ({
        role_id: roleId,
        permission_id: pid
      }));

      const inserted = await rolePermissionRepository.insertMany(newPermissions, { session });
      console.log("✅ Permission mới đã thêm:", inserted.map(p => p._id.toString()));
    }

    await session.commitTransaction();
    session.endSession();

    console.log("🎯 Cập nhật role và permission thành công cho user:", userId);
    return { success: true, roleId };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Lỗi khi cập nhật role/permission:", err);
    throw err;
  }
}

}

module.exports = new RolePermissionService();
