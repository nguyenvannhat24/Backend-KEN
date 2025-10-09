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

// Lấy tất cả roles (admin hoặc System_Manager)
router.get('/', authenticateAny, authorizeAny('admin', 'System_Manager'), roleController.getAllRoles);

// Lấy role theo ID (admin hoặc System_Manager)
router.get('/:id', authenticateAny, authorizeAny('admin', 'System_Manager'), roleController.getRoleById);

// Lấy role theo tên (admin hoặc System_Manager)
router.get('/name/:name', authenticateAny, authorizeAny('admin', 'System_Manager'), roleController.getRoleByName);

// Tạo role mới (admin hoặc System_Manager)
router.post('/', authenticateAny, authorizeAny('admin', 'System_Manager'), roleController.createRole);

// Cập nhật role (admin hoặc System_Manager)
router.put('/:id', authenticateAny, authorizeAny('admin', 'System_Manager'), roleController.updateRole);

// Xóa role (admin hoặc System_Manager)
router.delete('/:id', authenticateAny, authorizeAny('admin', 'System_Manager'), roleController.deleteRole);

module.exports = router;
