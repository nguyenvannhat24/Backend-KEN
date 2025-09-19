const userRoleService = require('../services/userRole.service');

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
