const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticateAny, authorizeAny, adminAny } = require('../middlewares/auth');

const router = express.Router();

/**
 * User Routes - Quản lý người dùng
 * Tất cả routes đều cần authentication
 */

// ==================== AUTHENTICATED ROUTES ====================

// Xem profile chính mình
router.post('/getprofile', authenticateAny, userController.viewProfile);

// Xem roles của chính mình
router.get('/myRoles', authenticateAny, (req, res) => {
  console.log('User info:', req.user);
  res.json({
    email: req.user.email,
    username: req.user.username,
    roles: req.user.roles || [req.user.role]
  });
});

// Lấy thông tin bản thân
router.get('/me', authenticateAny, userController.getMe);

// Lấy user theo email / name (cụ thể)
router.get('/email/:email', authenticateAny, userController.getByEmail);
router.get('/name/:name', authenticateAny, userController.getByName);
router.get('/phone/:numberphone', authenticateAny, authorizeAny('admin'), userController.getByNumberPhone);
// Đổi mật khẩu
router.put('/change-password', authenticateAny, userController.changePassword);
// Keycloak CRUD routes
router.put('/keycloak/:id', authenticateAny, userController.updateKeycloakUser);
router.get('/keycloak', authenticateAny, userController.getAllKeycloakUsers);
router.get('/keycloak/id/:id', authenticateAny, userController.getKeycloakUserById);
router.get('/keycloak/username/:username', authenticateAny, userController.getKeycloakUserByName); 
router.get('/keycloak/email/:email', authenticateAny, userController.getKeycloakUserByMail);
router.post('/keycloak', authenticateAny, userController.createKeycloakUser);
router.post('/keycloak/createUserPass', authenticateAny, userController.createKeycloakUserPassword);
router.delete('/keycloak/:id', authenticateAny, userController.deleteKeycloakUser);
router.post('/cloneUser', userController.cloneUser);

// ==================== ADMIN ONLY ROUTES ====================

// Lấy toàn bộ user (chỉ admin)
router.get('/selectAll', authenticateAny, authorizeAny('admin','manage-account'), userController.SelectAll);

router.get('/search', authenticateAny, authorizeAny('admin'), userController.searchUsers);
// Lấy user theo ID (admin hoặc chính mình)
router.get('/:id', authenticateAny, authorizeAny('admin','manage-account'), userController.getById);

// Tạo mới user (chỉ admin)
router.post('/', authenticateAny, authorizeAny('admin'), userController.create);

// Cập nhật user (admin hoặc chính mình)
router.put('/:id', authenticateAny, userController.update);

// Xóa user (chỉ admin)
router.delete('/:id', authenticateAny, authorizeAny('admin'), userController.delete);

module.exports = router;
