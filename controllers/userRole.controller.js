const userRoleService = require('../services/userRole.service');

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
}

// Export methods
const userRoleController = new UserRoleController();
module.exports = {
  SelectAlluserRole: userRoleController.SelectAlluserRole.bind(userRoleController),
  getRoleByUser: userRoleController.getRoleByUser.bind(userRoleController),
  createUserRole: userRoleController.createUserRole.bind(userRoleController),
  updateUserRole: userRoleController.updateUserRole.bind(userRoleController),
  deleteUserRole: userRoleController.deleteUserRole.bind(userRoleController),
  deleteRolesByUser: userRoleController.deleteRolesByUser.bind(userRoleController)
};
