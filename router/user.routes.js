const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate, adminOnly, selfOrAdmin } = require('../middlewares/auth');

const router = express.Router();

/**
 * User Routes - Quản lý người dùng
 * Tất cả routes đều cần authentication
 */

// ==================== PUBLIC ROUTES ====================
// (Không có - tất cả đều cần đăng nhập)

// ==================== AUTHENTICATED ROUTES ====================

// Lấy toàn bộ user (chỉ admin)
router.get('/selectAll', authenticate, adminOnly, userController.SelectAll);

// Lấy user theo ID (admin hoặc chính mình)
router.get('/:id', authenticate, selfOrAdmin, userController.getById);

// Lấy user theo email (chỉ admin)
router.get('/email/:email', authenticate, adminOnly, userController.getByEmail);

// Lấy user theo name (chỉ admin)
router.get('/name/:name', authenticate, adminOnly, userController.getByName);

// Lấy user theo số điện thoại (chỉ admin)
router.get('/phone/:numberphone', authenticate, adminOnly, userController.getByNumberPhone);

// ==================== ADMIN ONLY ROUTES ====================

// Tạo mới user (chỉ admin)
router.post('/', authenticate, adminOnly, userController.create);

// Cập nhật user (admin hoặc chính mình)
router.put('/:id', authenticate, selfOrAdmin, userController.update);

// Xóa user (chỉ admin)
router.delete('/:id', authenticate, adminOnly, userController.delete);

module.exports = router;
