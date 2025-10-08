const express = require('express');
const router = express.Router();
const User = require('../models/usersModel');
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
    const avatarPath = `/uploads/${req.file.filename}`;
    user.avatar_url = avatarPath;
    await user.save();

    res.json({ message: 'Cập nhật avatar thành công', avatar_url: avatarPath });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('avatar_url');
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });

    if (!user.avatar_url) {
      return res.json({ avatar_url: '/uploads/default-avatar.png' });
    }

    res.json({ avatar_url: user.avatar_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
