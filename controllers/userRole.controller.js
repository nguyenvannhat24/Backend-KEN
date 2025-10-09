const userRoleService = require('../services/userRole.service');
const rolePermissionService = require('../services/rolePermission.service');
const permissionService = require('../services/permission.service');
/**
 * UserRole Controller - Xử lý các request liên quan đến UserRole
 */
class UserRoleController {

  /**
   * Lấy tất cả UserRole
   * GET /api/userRole/all
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async SelectAlluserRole(req, res) {
    try {
      const userRoleAll = await userRoleService.viewAll();
      return res.json({
        success: true,
        count: userRoleAll.length,
        data: userRoleAll
      });
    } catch (error) {
      console.error('❌ Error in SelectAlluserRole:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Lỗi server',
        message: error.message 
      });
    }
  }

  /**
   * Lấy role theo userId
   * GET /api/userRole/user/:userId
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getRoleByUser(req, res) {
    try {
      const role = await userRoleService.getRole(req.params.userId);
      if (!role) {
        return res.status(404).json({ 
          success: false,
          error: 'Không tìm thấy role',
          message: 'Role not found for this user' 
        });
      }
      res.json({
        success: true,
        data: role
      });
    } catch (err) {
      console.error('❌ Error in getRoleByUser:', err);
      res.status(500).json({ 
        success: false,
        error: 'Lỗi server',
        message: err.message 
      });
    }
  }

  /**
   * Tạo user-role mới
   * POST /api/userRole/
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createUserRole(req, res) {
    try {
      const newUserRole = await userRoleService.create(req.body);
      res.status(201).json({
        success: true,
        data: newUserRole,
        message: 'Tạo user-role thành công'
      });
    } catch (err) {
      console.error('❌ Error in createUserRole:', err);
      res.status(400).json({ 
        success: false,
        error: 'Lỗi tạo user-role',
        message: err.message 
      });
    }
  }

  /**
   * Cập nhật user-role
   * PUT /api/userRole/:id
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateUserRole(req, res) {
    try {
      const updatedUserRole = await userRoleService.update(req.params.id, req.body);
      if (!updatedUserRole) {
        return res.status(404).json({ 
          success: false,
          error: 'Không tìm thấy user-role',
          message: 'UserRole not found' 
        });
      }
      res.json({
        success: true,
        data: updatedUserRole,
        message: 'Cập nhật user-role thành công'
      });
    } catch (err) {
      console.error('❌ Error in updateUserRole:', err);
      res.status(400).json({ 
        success: false,
        error: 'Lỗi cập nhật user-role',
        message: err.message 
      });
    }
  }

  /**
   * Xóa user-role theo id
   * DELETE /api/userRole/:id
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteUserRole(req, res) {
    try {
      const deleted = await userRoleService.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ 
          success: false,
          error: 'Không tìm thấy user-role',
          message: 'UserRole not found' 
        });
      }
      res.json({ 
        success: true,
        message: 'Xóa user-role thành công' 
      });
    } catch (err) {
      console.error('❌ Error in deleteUserRole:', err);
      res.status(500).json({ 
        success: false,
        error: 'Lỗi server',
        message: err.message 
      });
    }
  }

  /**
   * Xóa toàn bộ role của 1 user
   * DELETE /api/userRole/user/:userId
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteRolesByUser(req, res) {
    try {
      const deleted = await userRoleService.deleteByUser(req.params.userId);
      res.json({ 
        success: true,
        message: 'Xóa tất cả role của user thành công',
        deletedCount: deleted.deletedCount 
      });
    } catch (err) {
      console.error('❌ Error in deleteRolesByUser:', err);
      res.status(500).json({ 
        success: false,
        error: 'Lỗi server',
        message: err.message 
      });
    }
  }

   async getpermission(req, res) {
  try {
    const { id } = req.body; // 🧩 id của người dùng được truyền vào

    if (!id) {
      return res.status(400).json({ success: false, message: "Thiếu id người dùng" });
    }

    // 1️⃣ Lấy tất cả vai trò (roles) của user
    const userRoles = await userRoleService.getRoles(id);
    if (!userRoles || userRoles.length === 0) {
      return res.status(404).json({ success: false, message: "Người dùng chưa có vai trò nào" });
    }

    const roleIds = userRoles.map(r => r.role_id?._id).filter(Boolean);
    if (roleIds.length === 0) {
      return res.status(404).json({ success: false, message: "Người dùng chưa có role hợp lệ nào" });
    }
    const roleNames = userRoles.map(r => r.role_id?.name).filter(Boolean);
    // 2️⃣ Lấy các quyền (permissions) tương ứng với danh sách roles
    const rolePermissions = await rolePermissionService.getByRoleIds(roleIds);
    const permissionIds = rolePermissions.map(rp => rp.permission_id?._id).filter(Boolean);

    // 3️⃣ Lấy thông tin chi tiết của các quyền
    const permissions = await permissionService.getByIds(permissionIds);

    // 4️⃣ Trả về danh sách mã quyền (code)
    const codes = permissions.map(p => p?.code).filter(Boolean);

    return res.status(200).json({
      success: true,
      count: codes.length,
      data: codes,
      role: roleNames
    });

  } catch (err) {
    console.error("❌ [getpermission] Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi lấy danh sách quyền"
    });
  }
}

}

// Export methods
const userRoleController = new UserRoleController();
module.exports = {
  SelectAlluserRole: userRoleController.SelectAlluserRole.bind(userRoleController),
  getRoleByUser: userRoleController.getRoleByUser.bind(userRoleController),
  createUserRole: userRoleController.createUserRole.bind(userRoleController),
  updateUserRole: userRoleController.updateUserRole.bind(userRoleController),
  deleteUserRole: userRoleController.deleteUserRole.bind(userRoleController),
  deleteRolesByUser: userRoleController.deleteRolesByUser.bind(userRoleController),
  getpermission: userRoleController.getpermission.bind(userRoleController)
};
