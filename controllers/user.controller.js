const userService = require('../services/user.service');
const userRoleService = require('../services/userRole.service');
const roleSevive = require('../services/role.service');
// Keycloak admin functions disabled (not required)

// Keycloak admin functions disabled - not required for authentication
// These endpoints would need keycloak.service to work

exports.getAllKeycloakUsers = async (req, res) => {
  res.status(503).json({ success: false, message: 'Keycloak admin features disabled' });
};

exports.getKeycloakUserById = async (req, res) => {
  res.status(503).json({ success: false, message: 'Keycloak admin features disabled' });
};

exports.getKeycloakUserByName = async (req, res) => {
  res.status(503).json({ success: false, message: 'Keycloak admin features disabled' });
};

exports.getKeycloakUserByMail = async (req, res) => {
  res.status(503).json({ success: false, message: 'Keycloak admin features disabled' });
};

exports.createKeycloakUser = async (req, res) => {
  res.status(503).json({ success: false, message: 'Keycloak admin features disabled' });
};

exports.updateKeycloakUser = async (req, res) => {
  res.status(503).json({ success: false, message: 'Keycloak admin features disabled' });
};

exports.deleteKeycloakUser = async (req, res) => {
  res.status(503).json({ success: false, message: 'Keycloak admin features disabled' });
};
// local

exports.SelectAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };

    const result = await userService.viewAll(options);

    return res.json({
      success: true,
      data: result.users || result,
      pagination: result.pagination || {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.users ? result.users.length : result.length,
        totalPages: Math.ceil((result.users ? result.users.length : result.length) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
};



exports.getById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getByEmail = async (req, res) => {
  try {
    const user = await userService.getUserByEmail(req.params.email);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getByName = async (req, res) => {
  try {
    const user = await userService.getUserByUsername(req.params.name);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getByNumberPhone = async (req, res) => {
  try {
    const user = await userService.getUserByNumberPhone(req.params.numberphone);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    // Tạo user trên bảng user
    const user = await userService.createUser(req.body);

    // Lấy role_id của quyền 'user' từ bảng role
    const roleId  = await roleSevive.getIdByName('user'); // nếu getIdByName là async

    if (!roleId ) {
      return res.status(400).json({ message: 'Role "user" không tồn tại' });
    }

    // Thêm quyền cho user mới
    await userRoleService.create({
      user_id: user._id,
      role_id: roleId , // tùy thuộc hàm trả về chỉ id hay object
    });

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}
exports.cloneUser = async (req, res) => {
  try {
    const username = req.body.username;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    // lấy thông tin user từ Keycloak
    const users = await getUserByUsername(username);
    const inforUser = users[0]; // lấy user đầu tiên

    if (!inforUser) {
      return res.status(404).json({ message: "User not found in Keycloak" });
    }

    // tạo user trong DB
    const user = await userService.createUserSSO({
      username : inforUser.username,
      email    : inforUser.email,
      full_name: `${inforUser.lastName} ${inforUser.firstName}`,
      idSSO    : inforUser.id
    });

    // Lấy role_id của quyền 'user'
    const roleId = await roleSevive.getIdByName('user');
    if (!roleId) {
      return res.status(400).json({ message: 'Role "user" không tồn tại' });
    }

    // Thêm quyền cho user SSO mới
    await userRoleService.create({
      user_id: user._id,
      role_id: roleId
    });

    res.status(201).json(user);
  } catch (err) {
    console.error("❌ cloneUser error:", err);
    res.status(400).json({ message: err.message });
  }
};



exports.update = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }


};
exports.viewProfile = async (req, res) => {
  try {
    const { userId } = req.body; // Lấy userId từ body
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId là bắt buộc" });
    }

    const profile = await userService.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// user.controller.js
exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực' });
    }

    res.json({
      success: true,
      data: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        roles: req.user.roles
      }
    });
  } catch (err) {
    console.error('❌ getMe error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Lấy profile đầy đủ của user hiện tại
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
    }
    
    const user = await userService.getProfile(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User không tồn tại' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('❌ getMyProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Cập nhật profile của user hiện tại
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
    }
    
    const { full_name, avatar_url } = req.body;
    const updateData = {};
    
    if (full_name !== undefined) updateData.full_name = full_name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    
    const user = await userService.updateProfile(userId, updateData);
    res.json({ success: true, message: 'Cập nhật profile thành công', data: user });
  } catch (error) {
    console.error('❌ updateMyProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Đổi mật khẩu của user hiện tại
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { current_password, new_password } = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
    }
    
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }
    
    const user = await userService.getProfile(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User không tồn tại' });
    }
    
    // Nếu user có password_hash, current_password là bắt buộc
    if (user.password_hash && !current_password) {
      return res.status(400).json({ success: false, message: 'current_password là bắt buộc khi user đã có mật khẩu' });
    }
    
    const result = await userService.changePassword(userId, current_password, new_password);
    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('❌ changePassword error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Soft delete user (chỉ admin)
exports.softDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.softDeleteUser(id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User không tồn tại' });
    }
    
    res.json({ 
      success: true, 
      message: 'Đã xóa mềm user thành công',
      data: user
    });
  } catch (error) {
    console.error('Error in softDelete:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Restore user (chỉ admin)
exports.restore = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.restoreUser(id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User không tồn tại hoặc chưa bị xóa' });
    }
    
    res.json({ 
      success: true, 
      message: 'Khôi phục user thành công',
      data: user
    });
  } catch (error) {
    console.error('Error in restore:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Get all users including soft deleted (chỉ admin)
exports.getAllWithDeleted = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'created_at', order = 'desc' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy: sort,
      sortOrder: order
    };
    
    const result = await userService.getAllUsersWithDeleted(options);
    
    res.json({ 
      success: true, 
      data: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error in getAllWithDeleted:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Get all deleted records (admin only) - Consolidated endpoint
exports.getAllDeletedRecords = async (req, res) => {
  try {
    const { 
      type = 'all',        // user, board, group, center, task, template, all
      page = 1, 
      limit = 10, 
      sort = 'deleted_at', 
      order = 'desc' 
    } = req.query;

    const validTypes = ['all', 'user', 'board', 'group', 'center', 'task', 'template'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Type không hợp lệ. Chỉ chấp nhận: ${validTypes.join(', ')}`
      });
    }

    const result = await userService.getAllDeletedRecords({
      type,
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      order
    });

    return res.json(result);
  } catch (error) {
    console.error('Error in getAllDeletedRecords:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi server',
      error: error.message 
    });
  }
};