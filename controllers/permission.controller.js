const PermissionService = require('../services/permission.service');

/**
 * Permission Controller - Xử lý các request liên quan đến Permission
 */
class PermissionController {

  /**
   * Lấy toàn bộ permissions
   * GET /api/permission/
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async SelectAll(req, res) {
    try {
      const permissions = await PermissionService.getAllPermissions();
      res.status(200).json({
        success: true,
        count: permissions.length,
        data: permissions
      });
    } catch (error) {
      console.error('❌ Error in SelectAll permissions:', error);
      res.status(500).json({ 
        success: false,
        error: 'Lỗi server',
        message: error.message 
      });
    }
  }

  /**
   * Lấy permission theo ID
   * GET /api/permission/:id
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async SelectById(req, res) {
    try {
      const permission = await PermissionService.getPermissionById(req.params.id);
      res.status(200).json({
        success: true,
        data: permission
      });
    } catch (error) {
      console.error('❌ Error in SelectById permission:', error);
      res.status(404).json({ 
        success: false,
        error: 'Không tìm thấy permission',
        message: error.message 
      });
    }
  }

  /**
   * Tạo mới permission
   * POST /api/permission/
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async Create(req, res) {
    try {
      const permission = await PermissionService.createPermission(req.body);
      res.status(201).json({
        success: true,
        data: permission,
        message: 'Tạo permission thành công'
      });
    } catch (error) {
      console.error('❌ Error in Create permission:', error);
      res.status(400).json({ 
        success: false,
        error: 'Lỗi tạo permission',
        message: error.message 
      });
    }
  }

  /**
   * Cập nhật permission
   * PUT /api/permission/:id
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async Update(req, res) {
    try {
      const permission = await PermissionService.updatePermission(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: permission,
        message: 'Cập nhật permission thành công'
      });
    } catch (error) {
      console.error('❌ Error in Update permission:', error);
      res.status(404).json({ 
        success: false,
        error: 'Không tìm thấy permission',
        message: error.message 
      });
    }
  }

  /**
   * Xóa permission
   * DELETE /api/permission/:id
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async Delete(req, res) {
    try {
      const result = await PermissionService.deletePermission(req.params.id);
      res.status(200).json({ 
        success: true,
        message: 'Xóa permission thành công',
        data: result 
      });
    } catch (error) {
      console.error('❌ Error in Delete permission:', error);
      res.status(404).json({ 
        success: false,
        error: 'Không tìm thấy permission',
        message: error.message 
      });
    }
  }
}

// Export methods
const permissionController = new PermissionController();
module.exports = {
  SelectAll: permissionController.SelectAll.bind(permissionController),
  SelectById: permissionController.SelectById.bind(permissionController),
  Create: permissionController.Create.bind(permissionController),
  Update: permissionController.Update.bind(permissionController),
  Delete: permissionController.Delete.bind(permissionController)
};
