const RolePermissionService = require('../services/rolePermission.service');

/**
 * RolePermission Controller - Xử lý các request liên quan đến RolePermission
 */
class RolePermissionController {

  /**
   * Lấy tất cả role-permissions
   * GET /api/role-permissions/
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAll(req, res) {
    try {
      const rolePermissions = await RolePermissionService.getAllRolePermissions();
      res.json({
        success: true,
        count: rolePermissions.length,
        data: rolePermissions
      });
    } catch (err) {
      console.error('❌ Error in getAll rolePermissions:', err);
      res.status(500).json({ 
        success: false,
        error: 'Lỗi server',
        message: err.message 
      });
    }
  }

  /**
   * Tạo mới role-permission
   * POST /api/role-permissions/
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async create(req, res) {
    try {
      const rolePermission = await RolePermissionService.createRolePermission(req.body);
      res.status(201).json({
        success: true,
        data: rolePermission,
        message: 'Tạo role-permission thành công'
      });
    } catch (err) {
      console.error('❌ Error in create rolePermission:', err);
      res.status(400).json({ 
        success: false,
        error: 'Lỗi tạo role-permission',
        message: err.message 
      });
    }
  }

  /**
   * Lấy role-permission theo ID
   * GET /api/role-permissions/:id
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getById(req, res) {
    try {
      const rolePermission = await RolePermissionService.getRolePermissionById(req.params.id);
      if (!rolePermission) {
        return res.status(404).json({ 
          success: false,
          error: 'Không tìm thấy role-permission',
          message: 'RolePermission not found' 
        });
      }
      res.json({
        success: true,
        data: rolePermission
      });
    } catch (err) {
      console.error('❌ Error in getById rolePermission:', err);
      res.status(500).json({ 
        success: false,
        error: 'Lỗi server',
        message: err.message 
      });
    }
  }

  /**
   * Cập nhật role-permission
   * PUT /api/role-permissions/:id
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async update(req, res) {
    try {
      const rolePermission = await RolePermissionService.updateRolePermission(req.params.id, req.body);
      if (!rolePermission) {
        return res.status(404).json({ 
          success: false,
          error: 'Không tìm thấy role-permission',
          message: 'RolePermission not found' 
        });
      }
      res.json({
        success: true,
        data: rolePermission,
        message: 'Cập nhật role-permission thành công'
      });
    } catch (err) {
      console.error('❌ Error in update rolePermission:', err);
      res.status(400).json({ 
        success: false,
        error: 'Lỗi cập nhật role-permission',
        message: err.message 
      });
    }
  }

  /**
   * Xóa role-permission
   * DELETE /api/role-permissions/:id
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async delete(req, res) {
    try {
      const rolePermission = await RolePermissionService.deleteRolePermission(req.params.id);
      if (!rolePermission) {
        return res.status(404).json({ 
          success: false,
          error: 'Không tìm thấy role-permission',
          message: 'RolePermission not found' 
        });
      }
      res.json({ 
        success: true,
        message: 'Xóa role-permission thành công' 
      });
    } catch (err) {
      console.error('❌ Error in delete rolePermission:', err);
      res.status(500).json({ 
        success: false,
        error: 'Lỗi server',
        message: err.message 
      });
    }
  }
}

// Export methods
const rolePermissionController = new RolePermissionController();
module.exports = {
  getAll: rolePermissionController.getAll.bind(rolePermissionController),
  create: rolePermissionController.create.bind(rolePermissionController),
  getById: rolePermissionController.getById.bind(rolePermissionController),
  update: rolePermissionController.update.bind(rolePermissionController),
  delete: rolePermissionController.delete.bind(rolePermissionController)
};
