const express = require('express');
const router = express.Router();
const UserModel = require('../models/usersModel'); // nhớ sửa đúng đường dẫn

router.get('/', async (req, res) => {
  try {
    const users = await UserModel.find();  // ✅ dùng "users"
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server', message: err.message });
  }
});

module.exports = router;
