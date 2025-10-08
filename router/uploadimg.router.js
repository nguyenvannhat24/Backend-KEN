const express = require('express');
const router = express.Router();
const User = require('../models/userPoint.model');
const upload = require('../config/multer'); // file multer config
const fs = require('fs');
const { authenticateAny, authorizeAny, adminAny } = require('../middlewares/auth');
// Upload avatar
router.post('/users/:id/avatar', authenticateAny ,upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.params.id;

    // Nếu user cũ đã có avatar, xóa file cũ (optional)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });

    if (user.avatar_url) {
      const oldPath = `.${user.avatar_url}`; // đường dẫn cũ
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Lưu đường dẫn mới vào DB
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    user.avatar_url = avatarPath;
    await user.save();

    res.json({ message: 'Cập nhật avatar thành công', avatar_url: avatarPath });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
