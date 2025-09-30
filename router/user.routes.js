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

router.get('/keycloak/id/:id',authenticateAny,userController.getKeycloakUserById);
router.get('/keycloak/username/:username',authenticateAny, userController.getKeycloakUserByName); 
router.get('/keycloak/email/:email',authenticateAny, userController.getKeycloakUserByMail);

router.post('/keycloak',authenticateAny, userController.createKeycloakUser);
router.put('/keycloak/:id',authenticateAny, userController.updateKeycloakUser);
router.delete('/keycloak/:id', authenticateAny,userController.deleteKeycloakUser);
// tạo mới user từ thông tin của keycloack
router.post('/cloneUser', userController.cloneUser);
// Lấy user theo email (chỉ admin)
router.get('/email/:email', authenticateAny, userController.getByEmail);

// Lấy user theo name (chỉ admin)
router.get('/name/:name', authenticateAny, userController.getByName);
module.exports = router;
