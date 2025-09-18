const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ message: 'Không có token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = decoded; // Gắn decoded (userId, role) vào req
    next();
  } catch (err) {
    res.status(403).json({ message: 'Token không hợp lệ' });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
// file này để phân quyền JWT