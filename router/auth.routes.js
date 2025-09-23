const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticateAny } = require('../middlewares/auth');
const jwt = require('jsonwebtoken');

/**
 * Auth Routes - Xử lý authentication và authorization
 */
module.exports = function(keycloak) {
  const router = express.Router();

  // ==================== PUBLIC ROUTES ====================
  
  // Đăng nhập thường (DB)
  router.post('/login', authController.login);

  // veryfile 
 // Route nhận token từ client
router.post('/keycloak/decode',authController.verifyKeycloakToken);

  // ==================== AUTHENTICATED ROUTES ====================
  
  // Đăng xuất (cần token)
  router.post('/logout', authenticateAny, authController.logout);

  // Refresh token (cần token cũ)
  router.post('/refresh-token', authenticateAny, authController.refreshToken);
  // trên clienr nếu lỗi 401 thì gọi đến router này Refresh token tự động
  /// gửi 
 router.post('/verifi',authController.verifyKeycloakToken);
  // Logout Keycloak (nếu cần)
  // router.get('/logout-sso', keycloak.logout(), (req, res) => {
  //   res.json({ 
  //     success: true,
  //     message: 'Đăng xuất Keycloak thành công' 
  //   });
  // });

  return router;
};
