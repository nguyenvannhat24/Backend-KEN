const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await userService.validateUser(name, password);
    if (!user) {
      return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không đúng' });
    }

    // Tạo token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' } // hoặc '1d'
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server', message: err.message });
  }
};
