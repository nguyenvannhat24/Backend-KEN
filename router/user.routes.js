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

// Cập nhật profile chính mình
router.put('/me', authenticateAny, userController.updateMyProfile);

// Đổi mật khẩu
router.put('/change-password', authenticateAny, userController.changePassword);


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
router.get('/selectAll', authenticateAny,authorizeAny('USER_VIEW_ALL VIEW_USER'), userController.SelectAll);

router.get('/admin/deleted', authenticateAny, authorizeAny('admin'), userController.getAllDeletedRecords);

router.get('/search', authenticateAny,authorizeAny('VIEW_USER'), userController.searchUsers);
// Lấy user theo ID (admin hoặc chính mình)
router.get('/:id', authenticateAny, authorizeAny('VIEW_USER'), userController.getById);

// Tạo mới user (chỉ admin)
router.post('/', authenticateAny,authorizeAny('USER_CREATE'), userController.create);

// Cập nhật user (admin hoặc chính mình)
router.put('/:id', authenticateAny,authorizeAny('USER_DELETE'), userController.update);

// Xóa user (chỉ admin)
router.delete('/:id', authenticateAny, authorizeAny('USER_DELETE'), userController.delete);

// Soft delete user (chỉ admin)
router.delete('/soft/:id', authenticateAny, authorizeAny('USER_DELETE'), userController.softDelete);

// Restore user (chỉ admin)
router.put('/restore/:id', authenticateAny, authorizeAny('USER_DELETE'), userController.restore);

module.exports = router;
