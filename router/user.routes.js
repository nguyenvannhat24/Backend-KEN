const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticateAny, authorizeAny, adminAny } = require('../middlewares/auth');

const router = express.Router();

router.post('/getprofile', authenticateAny, userController.viewProfile);

router.get('/myRoles', authenticateAny, (req, res) => {
  res.json({
    email: req.user.email,
    username: req.user.username,
    roles: req.user.roles || [req.user.role]
  });
});

router.get('/me', authenticateAny, userController.getMe);

// Cập nhật profile chính mình
router.put('/me', authenticateAny, userController.updateMyProfile);

// Đổi mật khẩu
router.put('/change-password', authenticateAny, userController.changePassword);

// Lấy user theo email / name (cụ thể)
router.get('/email/:email', authenticateAny, userController.getByEmail);
router.get('/name/:name', authenticateAny, userController.getByName);
router.get('/phone/:numberphone', authenticateAny, authorizeAny('admin', 'System_Manager'), userController.getByNumberPhone);

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
router.get('/selectAll', authenticateAny, authorizeAny('admin', 'System_Manager', 'VIEW_USER'), userController.SelectAll);

router.get('/search', authenticateAny, authorizeAny('admin', 'System_Manager'), userController.searchUsers);

// Lấy user theo ID (admin hoặc chính mình)
router.get('/:id', authenticateAny, authorizeAny('admin', 'System_Manager'), userController.getById);

// Tạo mới user (admin hoặc System_Manager)
router.post('/', authenticateAny, authorizeAny('admin', 'System_Manager'), userController.create);

// Cập nhật user (admin hoặc chính mình)
router.put('/:id', authenticateAny, userController.update);

// Soft delete user (admin hoặc System_Manager) - Phải đặt trước DELETE /:id
router.delete('/soft/:id', authenticateAny, authorizeAny('admin', 'System_Manager'), userController.softDelete);

// Soft delete user (admin hoặc System_Manager)
router.delete('/:id', authenticateAny, authorizeAny('admin', 'System_Manager'), userController.delete);

// Restore user (admin hoặc System_Manager)
router.put('/restore/:id', authenticateAny, authorizeAny('admin', 'System_Manager'), userController.restore);

// Get all users with deleted (admin hoặc System_Manager)
router.get('/admin/with-deleted', authenticateAny, authorizeAny('admin', 'System_Manager'), userController.getAllWithDeleted);

// Get all deleted records (admin hoặc System_Manager)
router.get('/admin/deleted', authenticateAny, authorizeAny('admin', 'System_Manager'), userController.getAllDeletedRecords);

module.exports = router;