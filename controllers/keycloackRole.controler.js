const { kcAdminClient, loginAdmin } = require('../config/keycloakAdmin');

// Tạo role client
const createRole = async (req, res) => {
  try {
    await loginAdmin(); // đảm bảo đã login admin
    const { clientId, name } = req.body;
    const role = await kcAdminClient.clients.createRole({ id: clientId, name });
    res.json({ success: true, data: role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Tạo role thất bại', error: err.message });
  }
};

// Lấy tất cả roles client
const getRoles = async (req, res) => {
  try {
    await loginAdmin();
    const { clientId } = req.params;
    const roles = await kcAdminClient.clients.listRoles({ id: clientId });
    res.json({ success: true, data: roles });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lấy role thất bại', error: err.message });
  }
};

// Xóa role
const deleteRole = async (req, res) => {
  try {
    await loginAdmin();
    const { clientId, roleName } = req.params;
    await kcAdminClient.clients.delRole({ id: clientId, roleName });
    res.json({ success: true, message: 'Xóa role thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Xóa role thất bại', error: err.message });
  }
};

// Gán role cho user
const assignRoleToUser = async (req, res) => {
  try {
    await loginAdmin();
    const { userId, clientId, roles } = req.body;
    const clientRoles = await kcAdminClient.clients.listRoles({ id: clientId });
    const rolesToAssign = clientRoles.filter(r => roles.includes(r.name));

    await kcAdminClient.users.addClientRoleMappings({
      id: userId,
      clientUniqueId: clientId,
      roles: rolesToAssign
    });

    res.json({ success: true, message: 'Gán role thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gán role thất bại', error: err.message });
  }
};

module.exports = {
  createRole,
  getRoles,
  deleteRole,
  assignRoleToUser,
};
