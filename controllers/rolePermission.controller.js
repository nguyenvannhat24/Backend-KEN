const rolePermissionService = require('../services/rolePermission.service');

class RolePermissionController {
  async create(req, res) {
    try {
      const newRP = await rolePermissionService.createRolePermission(req.body);
      res.status(201).json({ success: true, data: newRP });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const list = await rolePermissionService.getAllRolePermissions();
      res.status(200).json({ success: true, data: list });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const data = await rolePermissionService.getRolePermissionById(req.params.id);
      if (!data)
        return res.status(404).json({ success: false, message: 'Not found' });
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getByRole(req, res) {
    try {
      const data = await rolePermissionService.getPermissionsByRole(req.params.roleId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
async update(req, res) {
  try {
    const roleId = req.params.roleId;
    const { permissions } = req.body;
    const updated = await rolePermissionService.updateByRoleId(roleId, permissions);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

  async delete(req, res) {
    try {
      await rolePermissionService.deleteRolePermission(req.params.id);
      res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  async getPermissionsByNameRole(req, res) {
  try {
    const nameRole = req.params.name;

    // Gọi service để lấy danh sách quyền theo tên role
    const permissions = await rolePermissionService.getPermissionsByNameRole(nameRole);

    res.status(200).json({ success: true, data: permissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

}

module.exports = new RolePermissionController();
