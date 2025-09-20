const RolePermissionService = require('../services/rolePermission.service');

exports.getAll = async (req, res) => {
  try {
    const rolePermissions = await RolePermissionService.getAllRolePermissions();
    res.json(rolePermissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const rolePermission = await RolePermissionService.createRolePermission(req.body);
    res.status(201).json(rolePermission);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const rolePermission = await RolePermissionService.getRolePermissionById(req.params.id);
    if (!rolePermission) return res.status(404).json({ message: 'RolePermission not found' });
    res.json(rolePermission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const rolePermission = await RolePermissionService.updateRolePermission(req.params.id, req.body);
    if (!rolePermission) return res.status(404).json({ message: 'RolePermission not found' });
    res.json(rolePermission);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const rolePermission = await RolePermissionService.deleteRolePermission(req.params.id);
    if (!rolePermission) return res.status(404).json({ message: 'RolePermission not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
