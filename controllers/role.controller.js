const roleService = require('../services/role.service');

/**
 * Role Controller - Xử lý logic nghiệp vụ cho Role
 * Chứa các methods xử lý request/response cho Role endpoints
 */
class RoleController {

  /**
   * Lấy tất cả roles
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllRoles(req, res) {
    try {
      console.log('📋 [RoleController] getAllRoles - Getting all roles');
      
      const result = await roleService.getAllRoles();
      
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách roles thành công',
        count: result.length,
        data: result
      });
    } catch (error) {
      console.error('❌ [RoleController] getAllRoles - Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Không thể lấy danh sách roles'
      });
    }
  }

  /**
   * Lấy role theo ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getRoleById(req, res) {
    try {
      const { id } = req.params;
      console.log(`📋 [RoleController] getRoleById - Getting role with ID: ${id}`);
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'ID role là bắt buộc'
        });
      }

      const result = await roleService.getRoleById(id);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Không tìm thấy role với ID này'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lấy thông tin role thành công',
        data: result
      });
    } catch (error) {
      console.error('❌ [RoleController] getRoleById - Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Không thể lấy thông tin role'
      });
    }
  }

  /**
   * Tạo role mới
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createRole(req, res) {
    try {
      const roleData = req.body;
      console.log('📋 [RoleController] createRole - Creating new role:', roleData);
      
      // Validate input
      if (!roleData.name) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Tên role là bắt buộc'
        });
      }

      const result = await roleService.createRole(roleData);
      
      res.status(201).json({
        success: true,
        message: 'Tạo role thành công',
        data: result
      });
    } catch (error) {
      console.error('❌ [RoleController] createRole - Error:', error);
      
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'Tên role đã tồn tại'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Không thể tạo role'
      });
    }
  }

  /**
   * Cập nhật role
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      console.log(`📋 [RoleController] updateRole - Updating role ID: ${id}`, updateData);
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'ID role là bắt buộc'
        });
      }

      const result = await roleService.updateRole(id, updateData);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Không tìm thấy role với ID này'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Cập nhật role thành công',
        data: result
      });
    } catch (error) {
      console.error('❌ [RoleController] updateRole - Error:', error);
      
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'Tên role đã tồn tại'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Không thể cập nhật role'
      });
    }
  }

  /**
   * Xóa role
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteRole(req, res) {
    try {
      const { id } = req.params;
      console.log(`📋 [RoleController] deleteRole - Deleting role ID: ${id}`);
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'ID role là bắt buộc'
        });
      }

      const result = await roleService.deleteRole(id);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Không tìm thấy role với ID này'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Xóa role thành công',
        data: result
      });
    } catch (error) {
      console.error('❌ [RoleController] deleteRole - Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Không thể xóa role'
      });
    }
  }

  /**
   * Lấy role theo tên
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getRoleByName(req, res) {
    try {
      const { name } = req.params;
      console.log(`📋 [RoleController] getRoleByName - Getting role with name: ${name}`);
      
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Tên role là bắt buộc'
        });
      }

      const result = await roleService.getRoleByName(name);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Không tìm thấy role với tên này'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lấy thông tin role thành công',
        data: result
      });
    } catch (error) {
      console.error('❌ [RoleController] getRoleByName - Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Không thể lấy thông tin role'
      });
    }
  }

  /**
   * Lấy role của user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUserRole(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId || req.params.userId;
      console.log(`📋 [RoleController] getUserRole - Getting role for user ID: ${userId}`);
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Không xác định được user từ token'
        });
      }

      const result = await roleService.getUserRole(userId);
      
      res.status(200).json({
        success: true,
        message: 'Lấy thông tin role của user thành công',
        data: result
      });
    } catch (error) {
      console.error('❌ [RoleController] getUserRole - Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Không thể lấy thông tin role của user'
      });
    }
  }
}

module.exports = new RoleController();
