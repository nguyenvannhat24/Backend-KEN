const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');

/**
 * Auth Routes - Xử lý authentication và authorization
 */
module.exports = function(keycloak) {
  const router = express.Router();

  // ==================== PUBLIC ROUTES ====================
  
  // Đăng nhập thường (DB)
  router.post('/login', authController.login);

  // veryfile 
  router.get('/sso', keycloak.protect(), (req, res) => {
    res.json({ 
      success: true,
      message: 'Login bằng Keycloak thành công!', 
      data: {
        user: req.kauth.grant.access_token.content
      }
    });
  });

  // ==================== AUTHENTICATED ROUTES ====================
  
  // Đăng xuất (cần token)
  router.post('/logout', authenticate, authController.logout);

  // Refresh token (cần token cũ)
  router.post('/refresh-token', authenticate, authController.refreshToken);
  // trên clienr nếu lỗi 401 thì gọi đến router này Refresh token tự động
  /// gửi 

  // Logout Keycloak (nếu cần)
  // router.get('/logout-sso', keycloak.logout(), (req, res) => {
  //   res.json({ 
  //     success: true,
  //     message: 'Đăng xuất Keycloak thành công' 
  //   });
  // });

  return router;
};
