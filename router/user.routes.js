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
router.get('/:id', authenticateAny,  authorizeAny('admin','manage-account'), userController.getById);

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

// router xem profive chính người đăng nhập

router.post('/getprofile',authenticateAny ,userController.viewProfile);

// Keycloak CRUD routes
router.get('/keycloak', userController.getAllKeycloakUsers);
// lấy theo id

router.get('/keycloak/id/:id',userController.getKeycloakUserById);
router.get('/keycloak/username/:username', userController.getKeycloakUserByName);
router.get('/keycloak/email/:email', userController.getKeycloakUserByMail);

router.post('/keycloak', userController.createKeycloakUser);
router.put('/keycloak/:id', userController.updateKeycloakUser);
router.delete('/keycloak/:id', userController.deleteKeycloakUser);
// tạo mới user từ thông tin của keycloack
router.post('/cloneUser', userController.cloneUser);
module.exports = router;
