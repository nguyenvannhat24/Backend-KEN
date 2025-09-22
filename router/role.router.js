const express = require('express');
const roleController = require('../controllers/role.controller');
const { authenticateAny, authorizeAny } = require('../middlewares/auth');

const router = express.Router();

/**
 * Role Router - Định nghĩa các routes cho Role management
 * Base path: /api/role
 */

// ==================== PUBLIC ROUTES ====================

// Lấy role của user hiện tại
router.get('/my-role', authenticateAny, roleController.getUserRole);

// ==================== ADMIN ROUTES ====================

// Lấy tất cả roles (chỉ admin)
router.get('/', authenticateAny, authorizeAny('admin'), roleController.getAllRoles);

// Lấy role theo ID (chỉ admin)
router.get('/:id', authenticateAny, authorizeAny('admin'), roleController.getRoleById);

// Lấy role theo tên (chỉ admin)
router.get('/name/:name', authenticateAny, authorizeAny('admin'), roleController.getRoleByName);

// Tạo role mới (chỉ admin)
router.post('/', authenticateAny,authorizeAny('admin'), roleController.createRole);

// Cập nhật role (chỉ admin)
router.put('/:id', authenticateAny, authorizeAny('admin'), roleController.updateRole);

// Xóa role (chỉ admin)
router.delete('/:id', authenticateAny, authorizeAny('admin'), roleController.deleteRole);

module.exports = router;
