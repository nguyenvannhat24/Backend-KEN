const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware - Xác thực JWT token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const authenticate = (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Không có token',
        message: 'Vui lòng đăng nhập để truy cập tài nguyên này'
      });
    }

    // Kiểm tra format Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token không đúng định dạng',
        message: 'Token phải có định dạng: Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token không tồn tại',
        message: 'Vui lòng cung cấp token hợp lệ'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    // Gắn thông tin user vào request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    console.log(`🔐 Authenticated user: ${req.user.email} (${req.user.role})`);
    next();

  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token không hợp lệ',
        message: 'Token đã bị hỏng hoặc không đúng'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token đã hết hạn',
        message: 'Vui lòng đăng nhập lại'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Lỗi xác thực',
      message: 'Có lỗi xảy ra trong quá trình xác thực'
    });
  }
};

/**
 * Authorization Middleware - Kiểm tra quyền truy cập
 * @param {...string} allowedRoles - Các role được phép truy cập
 * @returns {Function} Middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Kiểm tra user đã được authenticate chưa
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Chưa xác thực',
          message: 'Vui lòng đăng nhập trước'
        });
      }

      // Kiểm tra role
      if (!allowedRoles.includes(req.user.role)) {
        console.log(`❌ Access denied for user ${req.user.email} with role ${req.user.role}`);
        return res.status(403).json({
          success: false,
          error: 'Không có quyền truy cập',
          message: `Bạn cần quyền ${allowedRoles.join(' hoặc ')} để thực hiện hành động này`
        });
      }

      console.log(`✅ Authorized user: ${req.user.email} (${req.user.role})`);
      next();

    } catch (error) {
      console.error('❌ Authorization error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Lỗi phân quyền',
        message: 'Có lỗi xảy ra trong quá trình kiểm tra quyền'
      });
    }
  };
};

/**
 * Admin Only Middleware - Chỉ admin mới được truy cập
 */
const adminOnly = authorize('admin');

/**
 * Self or Admin Middleware - User có thể truy cập dữ liệu của chính mình hoặc admin
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const selfOrAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Chưa xác thực',
        message: 'Vui lòng đăng nhập trước'
      });
    }

    const targetUserId = req.params.id || req.params.userId;
    const isAdmin = req.user.role === 'admin';
    const isSelf = req.user.id === targetUserId;

    if (isAdmin || isSelf) {
      console.log(`✅ Self or Admin access: ${req.user.email} (${req.user.role})`);
      next();
    } else {
      console.log(`❌ Access denied: ${req.user.email} trying to access user ${targetUserId}`);
      return res.status(403).json({
        success: false,
        error: 'Không có quyền truy cập',
        message: 'Bạn chỉ có thể truy cập dữ liệu của chính mình'
      });
    }

  } catch (error) {
    console.error('❌ Self or Admin check error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Lỗi kiểm tra quyền',
      message: 'Có lỗi xảy ra trong quá trình kiểm tra quyền'
    });
  }
};

module.exports = { 
  authenticate, 
  authorize, 
  adminOnly, 
  selfOrAdmin 
};