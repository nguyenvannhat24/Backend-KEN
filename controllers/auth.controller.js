const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const userRole = require('../services/userRole.service');
const role = require('../services/role.service');

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
      // Kiểm tra req.body
      if (!req.body) {
        return res.status(400).json({
          success: false,
          error: 'Request body không hợp lệ',
          message: 'Vui lòng gửi dữ liệu JSON hợp lệ'
        });
      }

      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          error: 'Email và password là bắt buộc',
          message: 'Vui lòng nhập đầy đủ thông tin đăng nhập'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false,
          error: 'Email không đúng định dạng',
          message: 'Vui lòng nhập email hợp lệ'
        });
      }

      // Validate user credentials
      const user = await userService.validateUser(email, password);
      if (!user) {
        return res.status(401).json({ 
          success: false,
          error: 'Tài khoản hoặc mật khẩu không đúng',
          message: 'Vui lòng kiểm tra lại thông tin đăng nhập'
        });
      }

      // Lấy role của user
      const roleName = await role.viewRole(user._id);
      console.log('🔑 User role:', roleName);
      
      // Tạo JWT token
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email,
          role: roleName 
        },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '24h' } // Tăng thời gian token lên 24h
      );

      // Response thành công
      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            status: user.status,
            role: roleName
          }
        }
      });

    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Lỗi server', 
        message: 'Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Đăng xuất user (invalidate token)
   * POST /api/logout
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async logout(req, res) {
    try {
      // Trong thực tế, có thể lưu token vào blacklist
      // Hoặc sử dụng Redis để quản lý session
      
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
   * Refresh token
   * POST /api/refresh-token
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async refreshToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Token là bắt buộc',
          message: 'Vui lòng cung cấp token để refresh'
        });
      }

      // Verify token hiện tại
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
      
      // Tạo token mới
      const newToken = jwt.sign(
        { 
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Refresh token thành công',
        data: {
          token: newToken
        }
      });

    } catch (error) {
      console.error('❌ Refresh token error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Token không hợp lệ',
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

// Export methods
const authController = new AuthController();
module.exports = {
  login: authController.login.bind(authController),
  logout: authController.logout.bind(authController),
  refreshToken: authController.refreshToken.bind(authController)
};
