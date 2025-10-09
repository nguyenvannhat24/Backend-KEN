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
async  updateRolePermissions(userId, permissionIds) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("🔹 Bắt đầu cập nhật role và permission cho user:", userId);

    // 1️⃣ Lấy tất cả role hiện tại của user 
    const userRoles = await userRoleRepository.findRolesByUser(userId); // đây chính là các role mà user có trong bảng user role
    console.log("🔹 Role hiện tại của user:", userRoles);

    let roleId;

    if (userRoles.length === 1) {
      // Nếu user chỉ có 1 role, dùng luôn role đó
       roleId = userRoles[0].role_id?._id?.toString();
      if (!roleId) throw new Error("Role ID không hợp lệ"); // sai ở đây roleId phải là userRoles.role_id. nếu lấy như này thì là lấy id của userRole ko liên quan đến permisson
      console.log("🔹 Dùng role hiện tại:", roleId);
    } else {
      // Nếu user có nhiều role => tạo role riêng cho user
      const newRole = await Role.create({ name: `role_for_${userId}` }, { session });
      roleId = newRole._id.toString();
      console.log("🔹 Tạo role mới:", roleId);

      // Gán role mới cho user
      await UserRole.create({ user_id: userId, role_id: roleId }, { session });
      console.log("🔹 Gán role mới cho user:", roleId);
    }

    // 2️⃣ Xóa permission cũ chỉ của role này
    await rolePermissionRepository.deleteByRoleId(roleId, { session }); // đoạn này xóa thì lấy id của role_id để xóa trong bảng rolePermisson
    console.log("🔹 Xóa permission cũ của role:", roleId);

    // 3️⃣ Thêm permission mới
    let insertedIds = [];
    if (permissionIds.length > 0) {
      const newRolePermissions = permissionIds.map(pid => ({
        role_id: roleId,
        permission_id: pid
      }));

      const insertedPermissions = await rolePermissionRepository.insertMany(newRolePermissions, { session });
      insertedIds = insertedPermissions.map(p => p._id.toString());
      console.log("🔹 Permission mới đã thêm:", insertedIds);
    }

    await session.commitTransaction();
    session.endSession();
    console.log("✅ Cập nhật role và permission thành công");

    return { roleId, updatedPermissions: insertedIds };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Lỗi khi cập nhật role/permission:", err);
    throw err;
  }
}


}

module.exports = new RolePermissionService();
