const userRoleService = require('../services/userRole.service');

// Lấy tất cả UserRole
exports.SelectAlluserRole = async (req, res) => {
  try {
    const userRoleAll = await userRoleService.viewAll();
    return res.json({
      success: true,
      count: userRoleAll.length,
      data: userRoleAll
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy role theo userId
exports.getRoleByUser = async (req, res) => {
  try {
    const role = await userRoleService.getRole(req.params.userId);
    if (!role) return res.status(404).json({ message: 'Role not found for this user' });
    res.json(role);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo user-role mới
exports.createUserRole = async (req, res) => {
  try {
    const newUserRole = await userRoleService.create(req.body);
    res.status(201).json(newUserRole);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật user-role
exports.updateUserRole = async (req, res) => {
  try {
    const updatedUserRole = await userRoleService.update(req.params.id, req.body);
    if (!updatedUserRole) return res.status(404).json({ message: 'UserRole not found' });
    res.json(updatedUserRole);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa user-role theo id
exports.deleteUserRole = async (req, res) => {
  try {
    const deleted = await userRoleService.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'UserRole not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa toàn bộ role của 1 user
exports.deleteRolesByUser = async (req, res) => {
  try {
    const deleted = await userRoleService.deleteByUser(req.params.userId);
    res.json({ message: 'Deleted all roles for user', deletedCount: deleted.deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
