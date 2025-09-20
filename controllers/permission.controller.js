const PermissionService = require('../services/permission.service');

// Lấy toàn bộ permissions
exports.SelectAll = async (req, res) => {
  try {
    const permissions = await PermissionService.getAllPermissions();
    res.status(200).json(permissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy permission theo ID
exports.SelectById = async (req, res) => {
  try {
    const permission = await PermissionService.getPermissionById(req.params.id);
    res.status(200).json(permission);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Tạo mới permission
exports.Create = async (req, res) => {
  try {
    const permission = await PermissionService.createPermission(req.body);
    res.status(201).json(permission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Cập nhật permission
exports.Update = async (req, res) => {
  try {
    const permission = await PermissionService.updatePermission(req.params.id, req.body);
    res.status(200).json(permission);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Xóa permission
exports.Delete = async (req, res) => {
  try {
    const result = await PermissionService.deletePermission(req.params.id);
    res.status(200).json({ message: 'Permission deleted successfully', result });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
