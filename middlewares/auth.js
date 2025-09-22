const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Keycloak JWKS client
const keycloakClient = jwksClient({
  jwksUri: 'https://id.dev.codegym.vn/auth/realms/codegym/protocol/openid-connect/certs'
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
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc không cung cấp' });
  }

  const token = authHeader.split(' ')[1];

  // Thử verify Local JWT trước
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key', (errLocal, decodedLocal) => {
    if (!errLocal && decodedLocal) {
      req.user = {
        id: decodedLocal.userId,
        email: decodedLocal.email,
        role: decodedLocal.role
      };
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

      req.user = {
        id: decodedKC.sub,
        email: decodedKC.email,
        username: decodedKC.preferred_username,
        roles: Array.from(new Set(roles)) // loại trùng roles
      };

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

    // Local JWT role check
    if (req.user.role && allowedRoles.includes(req.user.role)) return next();

    // Keycloak role check
    if (req.user.roles && req.user.roles.some(r => allowedRoles.includes(r))) return next();

    return res.status(403).json({ success: false, message: `Bạn cần quyền ${allowedRoles.join(', ')} để truy cập` });
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
