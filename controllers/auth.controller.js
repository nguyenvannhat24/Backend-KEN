const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const userRole = require('../services/userRole.service');
const role = require('../services/role.service');
const tokenBlacklist = require('../middlewares/tokenBlacklist');
require('dotenv').config(); // đọc file .env
/**
 * Auth Controller - Xử lý các request liên quan đến authentication
 */
class AuthController {

  /**
   * Đăng nhập user
   * POST /api/login
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async login(req, res) { 
  try {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret || !jwtRefreshSecret) {
      console.error('❌ JWT secrets missing');
      return res.status(500).json({
        success: false,
        error: 'Server misconfigured',
        message: 'JWT secrets are missing'
      });
    }

    const { login, password } = req.body;

    // Validate input
    if (!login || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Login và password là bắt buộc',
        message: 'Vui lòng nhập đầy đủ thông tin đăng nhập'
      });
    }

    console.log(`🔍 [LOGIN ATTEMPT] Login: ${login}`);

    // Validate user credentials (login có thể là email hoặc username)
    const user = await userService.validateUser(login, password);
    if (!user) {
      console.log(`❌ [LOGIN FAILED] Login không tồn tại hoặc mật khẩu sai: ${login}`);
      return res.status(401).json({ 
        success: false,
        error: 'Tài khoản hoặc mật khẩu không đúng',
        message: 'Vui lòng kiểm tra lại thông tin đăng nhập'
      });
    }

    // 🔎 Check user status
if (!user.status || user.status.toLowerCase() !== "active") {
  console.log(`🚫 [LOGIN BLOCKED] User ${user.email || user.username} có status: ${user.status}`);
  return res.status(403).json({
    success: false,
    error: 'Tài khoản bị khóa hoặc chưa kích hoạt',
    message: 'Vui lòng liên hệ quản trị viên để được hỗ trợ'
  });
}

    // Lấy tất cả role của user từ DB
    const userRoles = await role.getUserRoles(user._id); // trả về array ['admin','user',...]

    console.log(`🔐 [LOGIN] User đăng nhập thành công: ${user.email || user.username} - Roles: ${userRoles.join(', ')}`);

    // Tạo JWT token với nhiều role
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        username: user.username,
        roles: userRoles 
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        username: user.username,
        roles: userRoles 
      },
      jwtRefreshSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        refreshToken, 
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          status: user.status,
          roles: userRoles
        }
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Lỗi server', 
      message: 'Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau.',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

/*
   * Đăng xuất user (invalidate token)
   * POST /api/logout
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async logout(req, res) {
    try {
      // Lấy token từ header Authorization
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: "Token không hợp lệ hoặc không cung cấp"
        });
      }

      const token = authHeader.split(' ')[1];

      // Lưu token vào blacklist
      tokenBlacklist.add(token);
      
      // Log đăng xuất
      console.log(`🚪 [LOGOUT] User đăng xuất: ${req.user?.email || 'Unknown'}`);

      res.json({
        success: true,
        message: 'Đăng xuất thành công'
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Lỗi server',
        message: 'Có lỗi xảy ra trong quá trình đăng xuất'
      });
    }
  }

  /**
   * Verify Keycloak token
   * POST /api/keycloak/decode
   */
  async verifyKeycloakToken(req, res) {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: "Token không được để trống" 
      });
    }

    try {
      const decoded = jwt.decode(token, { complete: true });
      
      // Log Keycloak token verification
      console.log(`🔑 [KEYCLOAK] Verify token từ FE: ${decoded?.payload?.email || decoded?.payload?.preferred_username || 'Unknown'}`);

      res.json({
        success: true,
        message: "Giải mã token Keycloak thành công",
        data: decoded?.payload
      });
    } catch (error) {
      console.error('❌ Keycloak token decode error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Token không hợp lệ" 
      });
    }
  }
  /**
   * Refresh token
   * POST /api/refresh-token
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'refreshToken là bắt buộc',
          message: 'Vui lòng cung cấp refreshToken để cấp mới access token'
        });
      }

      // Verify refresh token bằng JWT_REFRESH_SECRET
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Tạo access token mới
      const newAccessToken = jwt.sign(
        {
          userId: decoded.userId,
          email: decoded.email,
          username: decoded.username,
          roles: decoded.roles
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Log refresh token
      console.log(`🔄 [REFRESH TOKEN] User refresh token: ${decoded.email}`);

      res.json({
        success: true,
        message: 'Cấp mới access token thành công',
        data: {
          token: newAccessToken
        }
      });
    } catch (error) {
      console.error('❌ Refresh token error:', error);

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Refresh token hết hạn',
          message: 'Vui lòng đăng nhập lại'
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Refresh token không hợp lệ',
          message: 'Vui lòng đăng nhập lại'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Lỗi server',
        message: 'Có lỗi xảy ra trong quá trình refresh token'
      });
    }
  }
}
const authController = new AuthController();
// Export methods
module.exports = {
  login: authController.login.bind(authController),
  logout: authController.logout.bind(authController),
  refreshToken: authController.refreshToken.bind(authController),
  verifyKeycloakToken: authController.verifyKeycloakToken.bind(authController)
};


