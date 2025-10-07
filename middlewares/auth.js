const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
require('dotenv').config();
const tokenBlacklist = require('./tokenBlacklist');
const userService = require('../services/user.service');
const userRoleService = require('../services/userRole.service');
const roleService = require('../services/role.service');
const rolePermissionService = require('../services/rolePermission.service');

const permissionService = require('../services/permission.service');
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

    let user = null;

    // Thử verify Local JWT trước
    try {
      const decodedLocal = jwt.verify(token, process.env.JWT_SECRET);

      // Lấy user từ DB
      user = await userService.getUserById(decodedLocal.userId);

      // Lấy roles của user
      const dbRoles = await userRoleService.getRoles(user._id);
      const roleNames = dbRoles?.map(r => r.role_id?.name).filter(Boolean) || [];

      req.user = {
        id: user._id,
        email: user.email,
        username: user.username,
        roles: roleNames
      };

      console.log(`🔐 [AUTH] Local JWT verified: ${user.email} (${roleNames.join(', ')})`);
      return next();
    } catch (errLocal) {
      // Nếu Local JWT fail, sẽ thử Keycloak
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

      // Kiểm tra user đã có trong DB chưa (dựa trên username từ Keycloak token)
      user = await userService.getUserByUsername(username);
      if (!user) {
        // Tạo user mới từ thông tin Keycloak token
        user = await userService.createUserSSO({
          username: username,
          email: decodedKC.email || `${username}@keycloak.local`,
          full_name: decodedKC.name || username,
          idSSO: decodedKC.sub
        });

        // Thêm quyền mặc định "user"
        const roleId = await roleService.getIdByName('user');
        if (roleId) {
          const existingUserRole = await userRoleService.findByUserAndRole(user._id, roleId);
          if (!existingUserRole) {
            await userRoleService.create({ user_id: user._id, role_id: roleId });
            console.log(`✅ Assigned role "user" to ${user.email}`);
          }
        }
      }

      const dbRoles = await userRoleService.getRoles(user._id);
      req.user = {
        id: user._id.toString(),  
        email: user.email,
        username: user.username,
        idSSO: user.idSSO ,
        roles: dbRoles?.map(r => r.role_id?.name).filter(Boolean) || []
      };

      console.log(`🔑 [AUTH] Keycloak JWT verified & user loaded: ${req.user.email} id là ${req.user.id}`);

      next();
    });

  } catch (err) {
    console.error('❌ [AUTH] Error in authenticateAny:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Middleware kiểm tra quyền
 */
const authorizeAny = (allowed) => async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Chưa xác thực' });

    // Chuẩn hóa allowed thành mảng
    let allowedCodes = [];
    if (typeof allowed === 'string') {
      allowedCodes = allowed.split(' ').map(s => s.trim());
    } else if (Array.isArray(allowed)) {
      allowedCodes = allowed;
    }

    const { id, roles } = req.user;

    // 1️⃣ Kiểm tra role trực tiếp
    if (roles && roles.some(r => allowedCodes.includes(r))) {
      return next();
    }

    // 2️⃣ Kiểm tra quyền (permission)
    const userRoles = await userRoleService.getRoles(id);
    const roleIds = userRoles.map(r => r.role_id._id);

    const rolePermissions = await rolePermissionService.getByRoleIds(roleIds);
    const permissionIds = rolePermissions.map(rp => rp.permission_id);

    const permissions = await permissionService.getByIds(permissionIds);
    const codes = permissions.map(p => p.code);

    if (codes.some(c => allowedCodes.includes(c))) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Bạn không có quyền hoặc vai trò cần thiết (${allowedCodes.join(', ')})`
    });

  } catch (err) {
    console.error('❌ [AUTHZ] Error in authorizeAny:', err);
    res.status(500).json({ success: false, message: err.message });
  }
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
