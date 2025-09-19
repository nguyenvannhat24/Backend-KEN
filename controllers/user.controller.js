const userService = require('../services/user.service');

exports.SelectAll = async (req, res) => {
  try {
    const userAll = await userService.viewAll();

    return res.json({
      success: true,
      count: userAll.length,
      data: userAll
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
};
