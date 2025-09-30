const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
require('dotenv').config();
const tokenBlacklist = require('./tokenBlacklist');
const userService = require('../services/user.service');
const { getUserByUsername } = require('../services/keycloak.service');
const userRoleService = require('../services/userRole.service');
const roleService = require('../services/role.service');

// Keycloak JWKS client
const keycloakClient = jwksClient({
  jwksUri: process.env.KEYCLOAK_JWKS_URI
});

// Lấy public key từ Keycloak
function getKey(header, callback) {
  keycloakClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

/**
 * Middleware xác thực cả Local JWT và Keycloak JWT
 */
const authenticateAny = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc không cung cấp' });
    }

    const token = authHeader.split(' ')[1];
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ success: false, message: 'Token đã bị đăng xuất' });
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

      // Nếu Local JWT fail, tiếp tục với Keycloak
      jwt.verify(token, getKey, { algorithms: ['RS256'] }, async (errKC, decodedKC) => {
        if (errKC) {
          return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc hết hạn' });
        }

        const username = decodedKC.preferred_username;
        if (!username) {
          return res.status(400).json({ message: 'Keycloak token không có username' });
        }

        // Kiểm tra user đã có trong DB chưa
        let user = await userService.getUserByUsername(username);
        if (!user) {
          // Lấy thông tin từ Keycloak
          const kcUsers = await getUserByUsername(username);
          const kcUser = kcUsers[0];
          if (!kcUser) return res.status(404).json({ message: 'User not found in Keycloak' });

          // Tạo user mới
          user = await userService.createUserSSO({
            username: kcUser.username,
            email: kcUser.email,
            full_name: `${kcUser.lastName} ${kcUser.firstName}`,
            idSSO: kcUser.id
          });

          // Thêm quyền mặc định "user"
          const roleId = await roleService.getIdByName('user');
                if (roleId) {
            const existingUserRole = await userRoleService.findByUserAndRole(user._id, roleId);
            if (!existingUserRole) {
              await userRoleService.create({ user_id: user._id, role_id: roleId });
              console.log(`✅ Assigned role "user" to ${user.email}`);
            } else {
              console.log(`⚠️ User ${user.email} đã có role "user", bỏ qua tạo mới`);
            }
          }

        }
    

        // Gán thông tin user vào req
      const dbRoles = await userRoleService.getRoles(user._id); 
req.user = {
  id: user._id,
  email: user.email,
  username: user.username,
  roles: dbRoles.map(r => r.role_id.name) // nếu r.role_id là object Role
};

        console.log(`🔑 [AUTH] Keycloak JWT verified & user loaded: ${user.email}`);
        next();
      });
    });
  } catch (err) {
    console.error('❌ [AUTH] Error in authenticateAny:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Middleware kiểm tra quyền
 */
const authorizeAny = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Chưa xác thực' });

  if (req.user.role && allowedRoles.includes(req.user.role)) return next();

  if (req.user.roles && req.user.roles.some(r => allowedRoles.includes(r))) return next();


  return res.status(403).json({ success: false, message: `Bạn cần quyền ${allowedRoles.join(', ')} để truy cập` });
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
