const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticateAny } = require('../middlewares/auth');
const jwt = require('jsonwebtoken');

/**
 * Auth Routes - Xử lý authentication và authorization
 */
module.exports = function() {
  const router = express.Router();

  // ==================== PUBLIC ROUTES ====================
  
  // Đăng nhập thường (DB)
  router.post('/login', authController.login);

  // Verify Keycloak token
  router.post('/keycloak/decode', authController.verifyKeycloakToken);

  // ==================== AUTHENTICATED ROUTES ====================
  
  // Đăng xuất (cần token)
  router.post('/logout', authenticateAny, authController.logout);

  // Refresh token: KHÔNG yêu cầu access token, dùng refreshToken trong body
  router.post('/refresh-token', authController.refreshToken); //

  return router;
};
