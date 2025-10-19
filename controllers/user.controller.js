const userService = require('../services/user.service');
const userRoleService = require('../services/userRole.service');
const roleSevive = require('../services/role.service');
const { createUser, getUsers, getUserById, updateUser, deleteUser   ,getUserByUsername, getUserByEmail ,createUserWithPassword ,changeUserPassword ,deactivateUserOnKeycloak ,restoreUserOnKeycloak} = require('../services/keycloak.service');
//

exports.createKeycloakUserPassword = async (req, res) => {
  try {
    const { username, email, full_name, status, password } = req.body;
    const user = await createUserWithPassword(
      { username, email, full_name, status },
      password
    );
    res.json({ success: true, message: "User created in Keycloak", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllKeycloakUsers = async (req, res) => {
  try {
    const users = await getUsers({ max: 50 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get users', error: err.message });
  }
};

exports.getKeycloakUserById = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) 
      return res.status(404).json({ success: false, message: 'User not found in Keycloak' });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get user', error: err.message });
  }
};

// 🔵 Lấy user theo username
exports.getKeycloakUserByName = async (req, res) => {
  try {
    const users = await getUserByUsername(req.params.username); // nên đổi route param thành :username
    if (!users || users.length === 0) 
      return res.status(404).json({ success: false, message: 'User not found in Keycloak' });

    res.json({ success: true, data: users[0] }); // thường chỉ lấy 1 user đầu tiên
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get user', error: err.message });
  }
};

// 🔵 Lấy user theo email
exports.getKeycloakUserByMail = async (req, res) => {
  try {
    const users = await getUserByEmail(req.params.email); // nên đổi route param thành :email
    if (!users || users.length === 0) 
      return res.status(404).json({ success: false, message: 'User not found in Keycloak' });

    res.json({ success: true, data: users[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get user', error: err.message });
  }
};



// 🟢 Tạo user mới trên Keycloak
exports.createKeycloakUser = async (req, res) => {
  try {
    const newUser = await createUser(req.body);
    res.status(201).json({ success: true, data: newUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create user', error: err.message });
  }
};

// 🟠 Cập nhật user trên Keycloak
exports.updateKeycloakUser = async (req, res) => {
  const userId = req.params.id;
  const updatedInfo = req.body;

  try {
    await updateUser(userId, updatedInfo);
    res.json({ success: true, message: 'User updated successfully on Keycloak' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update user', error: err.message });
  }
};

// 🔴 Xóa user trên Keycloak
exports.deleteKeycloakUser = async (req, res) => {
  const userId = req.params.id;

  try {
    await deleteUser(userId);
    res.json({ success: true, message: 'User deleted successfully from Keycloak' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: err.message });
  }
};
// local

exports.SelectAll = async (req, res) => {
  try {
    const queryParser = require('../utils/queryParser');
    
    const parsed = queryParser.parseQuery(req.query, {
      allowedFilters: ['status', 'typeAccount', 'role'],
      allowedSortFields: ['created_at', 'updated_at', 'email', 'username', 'full_name'],
      maxLimit: 100,
      defaults: {
        page: 1,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'desc'
      }
    });

    const result = await userService.getAllUsers({
      page: parsed.pagination.page,
      limit: parsed.pagination.limit,
      sortBy: parsed.metadata.sortBy,
      sortOrder: parsed.metadata.sortOrder,
      filter: parsed.filter,
      search: parsed.search
    });

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const response = queryParser.buildDeepLinkResponse(
      result.users,
      req.query,
      baseUrl,
      {
        page: parsed.pagination.page,
        limit: parsed.pagination.limit,
        total: result.pagination.total
      },
      {
        filtersApplied: parsed.metadata.filtersApplied,
        search: parsed.search,
        viewState: parsed.viewState
      }
    );

    return res.json(response);
  } catch (error) {
    console.error('Error in SelectAll:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Lỗi server',
      message: error.message 
    });
  }
};



exports.getById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ 
      success: false,
      message: 'User not found' 
    });
    res.json({ 
      success: true,
      data: user 
    });
  } catch (err) {
    console.error('Error in getById:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

exports.getByEmail = async (req, res) => {
  try {
    const user = await userService.getUserByEmail(req.params.email);
    if (!user) return res.status(404).json({ 
      success: false,
      message: 'User not found' 
    });
    res.json({ 
      success: true,
      data: user 
    });
  } catch (err) {
    console.error('Error in getByEmail:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

exports.getByName = async (req, res) => {
  try {
    const user = await userService.getUserByUsername(req.params.name);
    if (!user) return res.status(404).json({ 
      success: false,
      message: 'User not found' 
    });
    res.json({ 
      success: true,
      data: user 
    });
  } catch (err) {
    console.error('Error in getByName:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

exports.getByNumberPhone = async (req, res) => {
  try {
    const user = await userService.getUserByPhoneNumber(req.params.numberphone);
    if (!user) return res.status(404).json({ 
      success: false,
      message: 'User not found' 
    });
    res.json({ 
      success: true,
      data: user 
    });
  } catch (err) {
    console.error('Error in getByNumberPhone:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

exports.create = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);

    const rolesFromBody = req.body.roles && Array.isArray(req.body.roles) 
      ? req.body.roles 
      : ["user"];

    for (const roleName of rolesFromBody) {
      const roleId = await roleSevive.getIdByName(roleName);
      if (!roleId) {
        console.warn(`Role "${roleName}" không tồn tại, bỏ qua`);
        continue;
      }

      await userRoleService.create({
        user_id: user._id,
        role_id: roleId,
      });
    }

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
      roles: rolesFromBody
    });
  } catch (err) {
    console.error("Error in create user:", err);
    
    // Xử lý lỗi duplicate key
    if (err.code === 11000) {
      if (err.keyPattern && err.keyPattern.email) {
        return res.status(400).json({
          success: false,
          message: `Email "${req.body.email}" đã tồn tại trong hệ thống`,
          error: "DUPLICATE_EMAIL"
        });
      }
      if (err.keyPattern && err.keyPattern.username) {
        return res.status(400).json({
          success: false,
          message: `Username "${req.body.username}" đã tồn tại trong hệ thống`,
          error: "DUPLICATE_USERNAME"
        });
      }
      return res.status(400).json({
        success: false,
        message: "Dữ liệu đã tồn tại trong hệ thống",
        error: "DUPLICATE_DATA"
      });
    }
    
    res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
};


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
    const userId = req.user.id; 
    const roles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
 const isAdmin = roles.includes('admin') || roles.includes('System_Manager');

    if (userId == req.params.id || isAdmin) {
      const checkUser = await userService.getUserById(req.params.id);

      if (!checkUser) {
        console.warn("⚠️ Không tìm thấy user bạn muốn cập nhật");
        throw new Error("Không tìm thấy user bạn muốn cập nhật" + checkUser);
      }

      const typeAccount = checkUser.typeAccount;

      let user = await userService.updateUser(userId, req.params.id, req.body);

      if (typeAccount === 'SSO') {
        const id = checkUser.idSSO; 
        const keycloakPayload = {
          username: req.body.username || checkUser.username,
          email: req.body.email || checkUser.email,
          firstName: req.body.full_name ? req.body.full_name.split(" ")[0] : checkUser.full_name,
          lastName: req.body.full_name ? req.body.full_name.split(" ").slice(1).join(" ") : "",
          enabled: req.body.status ? req.body.status.toLowerCase() === "active" : checkUser.status === "active",
        };

        if (req.body.password) {
          keycloakPayload.credentials = [
            {
              type: "password",
              value: req.body.password,
              temporary: false
            }
          ];
        }

        await updateUser(id, keycloakPayload);
      }

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }

      res.json({ 
        success: true,
        data: user 
      });
    } else {
      res.status(403).json({ 
        success: false,
        message: "Bạn không có quyền cập nhật user này" 
      });
    }
  } catch (err) {
    console.error("Error in update user:", err);
    
    // Xử lý lỗi duplicate key
    if (err.code === 11000) {
      if (err.keyPattern && err.keyPattern.email) {
        return res.status(400).json({
          success: false,
          message: `Email "${req.body.email}" đã tồn tại trong hệ thống`,
          error: "DUPLICATE_EMAIL"
        });
      }
      if (err.keyPattern && err.keyPattern.username) {
        return res.status(400).json({
          success: false,
          message: `Username "${req.body.username}" đã tồn tại trong hệ thống`,
          error: "DUPLICATE_USERNAME"
        });
      }
      return res.status(400).json({
        success: false,
        message: "Dữ liệu đã tồn tại trong hệ thống",
        error: "DUPLICATE_DATA"
      });
    }
    
    res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
};


exports.delete = async (req, res) => {
  try {
    // Lấy thông tin user từ DB
    const checkUser = await userService.getUserById(req.params.id);
    if (!checkUser) return res.status(404).json({ message: "User not found" });
   if (checkUser.username === "admin" || checkUser.role?.includes("admin")) {
      return res.status(403).json({ 
        success: false, 
        message: "Cannot delete user with system_manager role" 
      });
    }
    // Soft delete user trong DB
    const user = await userService.softDeleteUser(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Nếu là user SSO thì disable trên Keycloak (không xóa)
    if (checkUser.typeAccount === "SSO" && checkUser.idSSO) {
      await deactivateUserOnKeycloak(checkUser.idSSO); // gọi Keycloak Admin API
    }

    res.json({ success: true, message: 'User soft deleted successfully', data: user });
  } catch (err) {
    console.error('Error soft deleting user:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.viewProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId là bắt buộc" });
    }

    const profile = await userService.getUserById(userId);
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
        _id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        roles: req.user.roles
      }
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

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

    if (user.password_hash && !current_password) {
      return res.status(400).json({ success: false, message: 'Cần nhập mật khẩu hiện tại' });
    }

    const result = await userService.changePassword(userId, current_password, new_password);
 
    if (user.typeAccount === 'SSO' && user.idSSO) {
      try {
        await changeUserPassword(user.idSSO, new_password);

      } catch (kcError) {
        console.error('❌ Lỗi đổi mật khẩu Keycloak:', kcError);
      }
    }

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });

  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};



exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query; // từ query ?q=keyword

    if (!q || q.trim() === '') {
      return res.json({ success: true, users: [] });
    }

    const users = await userService.searchAllUsers(q.trim().toLowerCase());

    return res.json({ success: true, users });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
    }

    const userInDB = await userService.getUserById(userId);
    if (!userInDB) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const { full_name, avatar_url, email } = req.body;
    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (email !== undefined) updateData.email = email;

    const updatedUser = await userService.updateProfile(userId, updateData);

    if (userInDB.typeAccount === 'SSO') {
      const id = userInDB.idSSO;

      // Map sang định dạng của Keycloak
      const keycloakPayload = {
        username: updatedUser.username,
        email: updatedUser.email || userInDB.email,
        firstName: updatedUser.full_name ? updatedUser.full_name.split(" ")[0] : userInDB.full_name,
        lastName: updatedUser.full_name ? updatedUser.full_name.split(" ").slice(1).join(" ") : "",
        attributes: {
          avatar_url: updatedUser.avatar_url || userInDB.avatar_url
        }
      };

      // Gọi API cập nhật Keycloak
      await updateUser(id, keycloakPayload);
    }

    res.json({
      success: true,
      message: 'Cập nhật profile thành công',
      data: updatedUser
    });

  } catch (error) {
    console.error('❌ updateMyProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.softDelete = async (req, res) => {
  try {
    const user = await userService.softDeleteUser(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.typeAccount === 'SSO' && user.idSSO) {
      try {
        await updateUser(user.idSSO, { enabled: false });
      } catch (err) {
        console.error('Failed to disable Keycloak user:', err);
      }
    }
    
    res.json({ success: true, message: 'User soft deleted successfully', data: user });
  } catch (error) {
    console.error('Error soft deleting user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.restore = async (req, res) => {
  try {
    const user = await userService.restoreUser(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found or not deleted' });
    }
    
    if (user.typeAccount === 'SSO' && user.idSSO) {
      try {
        await updateUser(user.idSSO, { enabled: true });
      } catch (err) {
        console.error('Failed to enable Keycloak user:', err);
      }
    }
    
    res.json({ success: true, message: 'User restored successfully', data: user });
  } catch (error) {
    console.error('Error restoring user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllWithDeleted = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    const result = await userService.getAllUsersWithDeleted({
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    });
    
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error getting users with deleted:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllDeletedRecords = async (req, res) => {
  try {
    const { type = 'all', page = 1, limit = 10, sort = 'deleted_at', order = 'desc' } = req.query;
    
    const result = await userService.getAllDeletedRecords({
      type,
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      order
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error in getAllDeletedRecords:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi server',
      error: error.message 
    });

  }
};

exports.findUsers = async (req, res) => {
  try {
   
    const keyword = req.query.infor;
    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ message: "Thiếu từ khóa tìm kiếm" });
    }

    const result = await userService.findUsers({ infor: keyword });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi tìm kiếm người dùng gần đúng:", error);
    return res.status(500).json({ message: "Lỗi tìm kiếm người dùng gần đúng", error: error.message });
  }
};
