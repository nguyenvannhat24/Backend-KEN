const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const userRole = require('../services/userRole.service');
const role = require('../services/role.service')
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.validateUser(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không đúng' });
    }

 const roleName = await role.viewRole(user._id);
   console.log(roleName);
    // Tạo token JWT
    const token = jwt.sign(
      { userId: user._id, role: roleName },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' } // hoặc '1d'
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
    
      },
      

    });

  
  
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server', message: err.message });
  }
};
