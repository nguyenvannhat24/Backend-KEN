const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticateAny, authorizeAny, adminAny } = require('../middlewares/auth');

const router = express.Router();

/**
 * User Routes - Quản lý người dùng
 * Tất cả routes đều cần authentication
 */

// ==================== PUBLIC ROUTES ====================
// (Không có - tất cả đều cần đăng nhập)

// ==================== AUTHENTICATED ROUTES ====================

// Lấy toàn bộ user (chỉ admin)
router.get('/selectAll', authenticateAny, authorizeAny('admin','manage-account'), userController.SelectAll);

// Lấy user theo ID (admin hoặc chính mình)
router.get('/:id', authenticateAny,  authorizeAny('admin','user'), userController.getById);

// Lấy user theo email (chỉ admin)
router.get('/email/:email', authenticateAny,  authorizeAny('admin'), userController.getByEmail);

// Lấy user theo name (chỉ admin)
router.get('/name/:name', authenticateAny, authorizeAny('admin'), userController.getByName);

// Lấy user theo số điện thoại (chỉ admin)
router.get('/phone/:numberphone', authenticateAny, authorizeAny('admin'), userController.getByNumberPhone);

// ==================== ADMIN ONLY ROUTES ====================

// Tạo mới user (chỉ admin)
router.post('/', authenticateAny, authorizeAny('admin'), userController.create);

// Cập nhật user (admin hoặc chính mình)
router.put('/:id', authenticateAny,  authorizeAny('admin'), userController.update);

// Xóa user (chỉ admin)
router.delete('/:id', authenticateAny, authorizeAny('admin'), userController.delete);

module.exports = router;
