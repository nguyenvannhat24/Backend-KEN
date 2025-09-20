const express = require('express');
const roleController = require('../controllers/role.controller');
const { authenticate, adminOnly } = require('../middlewares/auth');

const router = express.Router();

/**
 * Role Router - Định nghĩa các routes cho Role management
 * Base path: /api/role
 */

// ==================== PUBLIC ROUTES ====================

// Lấy role của user hiện tại
router.get('/my-role', authenticate, roleController.getUserRole);

// ==================== ADMIN ROUTES ====================

// Lấy tất cả roles (chỉ admin)
router.get('/', authenticate, adminOnly, roleController.getAllRoles);

// Lấy role theo ID (chỉ admin)
router.get('/:id', authenticate, adminOnly, roleController.getRoleById);

// Lấy role theo tên (chỉ admin)
router.get('/name/:name', authenticate, adminOnly, roleController.getRoleByName);

// Tạo role mới (chỉ admin)
router.post('/', authenticate, adminOnly, roleController.createRole);

// Cập nhật role (chỉ admin)
router.put('/:id', authenticate, adminOnly, roleController.updateRole);

// Xóa role (chỉ admin)
router.delete('/:id', authenticate, adminOnly, roleController.deleteRole);

module.exports = router;
