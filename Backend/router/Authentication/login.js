const express = require('express');
const router = express.Router();

const UserModel = require("C:/Codegym/Backend/models/usersModel");
 const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// chắc chắn body đã parse
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// router login thường

router.post('/login',  async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await UserModel.findOne({ name });

    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // So sánh mật khẩu đã mã hóa
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo token JWT
  const token = jwt.sign(
  { userId: user._id, role: user.role },  // thêm role vào đây
  'your_jwt_secret_key',
  { expiresIn: '1d' }
);

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server', message: err.message });
  }
});

module.exports = router;
