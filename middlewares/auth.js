const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
require('dotenv').config(); // đọc file .env
const tokenBlacklist = require('./tokenBlacklist');
// Keycloak JWKS client
const keycloakClient = jwksClient({
  jwksUri: process.env.KEYCLOAK_JWKS_URI
});

// Lấy public key từ Keycloak
function getKey(header, callback) {
  keycloakClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

/**
 * Middleware xác thực cả Local JWT và Keycloak JWT
 */
const authenticateAny = (req, res, next) => {
  console.log('🔍 [AUTH DEBUG] Headers:', req.headers.authorization);
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ [AUTH] No valid authorization header');
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc không cung cấp' });
  }
  

  const token = authHeader.split(' ')[1];

  if (tokenBlacklist.has(token)) {
  return res.status(401).json({ message: "Token đã bị đăng xuất" });
}

  // Thử verify Local JWT trước
  jwt.verify(token, process.env.JWT_SECRET, (errLocal, decodedLocal) => {
    if (!errLocal && decodedLocal) {
      req.user = {
        id: decodedLocal.userId,
        email: decodedLocal.email,
        role: decodedLocal.role
      };
      console.log(`🔐 [AUTH] Local JWT verified: ${decodedLocal.email} (${decodedLocal.role})`);
      return next();
    }

    // Nếu Local JWT fail, thử Keycloak JWT
    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (errKC, decodedKC) => {
      if (errKC) {
        return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc hết hạn' });
      }

      // Gán thông tin user từ Keycloak
      let roles = decodedKC.realm_access?.roles || [];

      // Nếu muốn lấy thêm roles của client
      if (decodedKC.resource_access) {
        Object.values(decodedKC.resource_access).forEach(clientRoles => {
          roles.push(...(clientRoles.roles || []));
        });
      }
      // role 

      req.user = {
        id: decodedKC.sub,
        email: decodedKC.email,
        username: decodedKC.preferred_username,
        roles: Array.from(new Set(roles)) // loại trùng roles
      };
      
      console.log(`🔑 [AUTH] Keycloak JWT verified: ${decodedKC.email} (${roles.join(', ')})`);

      next();
    });
  });
};

/**
 * Middleware kiểm tra quyền (hỗn hợp Local + Keycloak)
 * @param  {...string} allowedRoles 
 */
const authorizeAny = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Chưa xác thực' });

    // Nếu là Local JWT (có field role)
    if (req.user.role) {
      if (allowedRoles.includes(req.user.role)) return next();
      return res.status(403).json({ success: false, message: `Bạn cần quyền ${allowedRoles.join(', ')} để truy cập` });
    }

    // Nếu là Keycloak JWT (không có role field riêng, chỉ token hợp lệ)
    // Mặc định coi là "user", không check role
    return next();
  };
};


/**
 * Middleware admin only
 */
const adminAny = authorizeAny('admin');

module.exports = {
  authenticateAny,
  authorizeAny,
  adminAny
};
