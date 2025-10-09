const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
require('dotenv').config();
const tokenBlacklist = require('./tokenBlacklist');
const userService = require('../services/user.service');
const userRoleService = require('../services/userRole.service');
const roleService = require('../services/role.service');
const rolePermissionService = require('../services/rolePermission.service');
const permissionService = require('../services/permission.service');

const keycloakClient = jwksClient({
  jwksUri: process.env.KEYCLOAK_JWKS_URI
});

function getKey(header, callback) {
  keycloakClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

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

    try {
      const decodedLocal = jwt.verify(token, process.env.JWT_SECRET);
      user = await userService.getUserById(decodedLocal.userId);
      const dbRoles = await userRoleService.getRoles(user._id);
      const roleNames = dbRoles?.map(r => r.role_id?.name).filter(Boolean) || [];

      req.user = {
        id: user._id,
        email: user.email,
        username: user.username,
        roles: roleNames
      };

      return next();
    } catch (errLocal) {
      // Try Keycloak JWT
    }

    try {
      const decodedKC = jwt.verify(token, getKey, { algorithms: ['RS256'] });
      
      const username = decodedKC.preferred_username;
      if (!username) {
        return res.status(400).json({ message: 'Keycloak token không có username' });
      }

      user = await userService.getUserByUsername(username);
      if (!user) {
        user = await userService.createUserSSO({
          username: username,
          email: decodedKC.email || `${username}@keycloak.local`,
          full_name: decodedKC.name || username,
          idSSO: decodedKC.sub
        });

        const roleId = await roleService.getIdByName('user');
        if (roleId) {
          const existingUserRole = await userRoleService.findByUserAndRole(user._id, roleId);
          if (!existingUserRole) {
            await userRoleService.create({ user_id: user._id, role_id: roleId });
          }
        }
      }

      const dbRoles = await userRoleService.getRoles(user._id);
      req.user = {
        id: user._id.toString(),  
        email: user.email,
        username: user.username,
        idSSO: user.idSSO,
        roles: dbRoles?.map(r => r.role_id?.name).filter(Boolean) || []
      };

      next();
    } catch (errKC) {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc hết hạn' });
    }

  } catch (err) {
    console.error('Error in authenticateAny:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const authorizeAny = (...allowed) => async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Chưa xác thực' });

    const { id } = req.user;

    if (req.user.roles && req.user.roles.some(r => allowed.includes(r))) {
      return next();
    }

    const userRoles = await userRoleService.getRoles(id);
    const roleIds = userRoles.map(r => r.role_id?._id).filter(Boolean);

    const rolePermissions = await rolePermissionService.getByRoleIds(roleIds);
    const permissionIds = rolePermissions.map(rp => rp.permission_id?._id).filter(Boolean);

    const permissions = await permissionService.getByIds(permissionIds);
    const codes = permissions.map(p => p.code);

    if (codes.some(c => allowed.includes(c))) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Bạn không có quyền hoặc vai trò cần thiết (${allowed.join(', ')})`
    });

  } catch (err) {
    console.error('Error in authorizeAny:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminAny = authorizeAny('admin', 'System_Manager');

module.exports = {
  authenticateAny,
  authorizeAny,
  adminAny
};
