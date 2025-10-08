const userService = require('../services/user.service');
const userRoleService = require('../services/userRole.service');
const roleSevive = require('../services/role.service');
const { createUser, getUsers, getUserById, updateUser, deleteUser   ,getUserByUsername, getUserByEmail ,createUserWithPassword} = require('../services/keycloak.service');
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
// 🔵 Lấy danh sách user từ Keycloak
exports.getAllKeycloakUsers = async (req, res) => {
  try {
    const users = await getUsers({ max: 50 }); // giới hạn 50 user
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get users', error: err.message });
  }
};
// 🔵 Lấy user theo ID từ Keycloak
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
    const { page = 1, limit = 10, sortBy = "created_at", sortOrder = "desc" } = req.query;

    const userAll = await userService.viewAll({
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    });

    return res.json({
      success: true,
      ...userAll // chứa cả users + pagination
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
    // 1. Tạo user (local + keycloak)
    const user = await userService.createUser(req.body);

    // 2. Lấy danh sách roles từ body (nếu không có thì mặc định "user")
    const rolesFromBody = req.body.roles && Array.isArray(req.body.roles) 
      ? req.body.roles 
      : ["user"];

    // 3. Gán roles cho user
    for (const roleName of rolesFromBody) {
      const roleId = await roleSevive.getIdByName(roleName);
      if (!roleId) {
        console.warn(`⚠️ Role "${roleName}" không tồn tại, bỏ qua`);
        continue;
      }

      await userRoleService.create({
        user_id: user._id,
        role_id: roleId,
      });
    }

    // 4. Trả về user + roles
    res.status(201).json({
      message: "User created successfully",
      data: user,
      roles: rolesFromBody
    });
  } catch (err) {
    console.error("❌ Error in create user:", err);
    res.status(400).json({ message: err.message });
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
    const userId = req.user.id; // lấy id từ token
    const roles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    const isAdmin = roles.includes('admin');

    console.log(`🔹 Request update user: ${req.params.id} by ${userId}, admin: ${isAdmin}`);

    if (userId == req.params.id || isAdmin) {
      const checkUser = await userService.getUserById(req.params.id);
      console.log("🔹 checkUser:", checkUser);

      if (!checkUser) {
        console.warn("⚠️ Không tìm thấy user bạn muốn cập nhật");
        throw new Error("Không tìm thấy user bạn muốn cập nhật");
      }

      const typeAccount = checkUser.typeAccount;
      console.log(`🔹 Type account: ${typeAccount}`);

      // Luôn update trên DB trước
      let user = await userService.updateUser(req.params.id, req.body);
      console.log("✅ User updated in local DB:", user);

      // Nếu user này thuộc SSO thì cập nhật bên Keycloak
      if (typeAccount === 'SSO') {
        const id = checkUser.idSSO; // ID user trên Keycloak
        console.log(`🔹 Updating user on Keycloak with ID: ${id}`);

        // Map dữ liệu từ payload frontend sang schema của Keycloak
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

        console.log("🔹 Keycloak payload:", keycloakPayload);

        await updateUser(id, keycloakPayload); // gọi hàm update lên Keycloak
        console.log("✅ User updated on Keycloak");
      }

      if (!user) {
        console.warn("⚠️ User not found after update");
        return res.status(404).json({ message: "User not found" });
      }

      console.log("✅ Update process finished, returning updated user");
      res.json(user);
    } else {
      console.warn("⚠️ User không có quyền cập nhật user này");
      res.status(403).json({ message: "Bạn không có quyền cập nhật user này" });
    }
  } catch (err) {
    console.error("❌ Error in update user:", err);
    res.status(400).json({ message: err.message });
  }
};


exports.delete = async (req, res) => {
  try {
    // Lấy thông tin user từ DB
    const checkUser = await userService.getUserById(req.params.id);
    if (!checkUser) return res.status(404).json({ message: "User not found" });

    // Luôn xóa user trong DB
    await userService.deleteUser(req.params.id);

    // Nếu là user SSO thì xóa thêm trên Keycloak
    if (checkUser.typeAccount === "SSO" && checkUser.idSSO) {
      await deleteUser(checkUser.idSSO); // gọi Keycloak Admin API
    }

    res.json({ message: "Deleted successfully" });
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
        _id: req.user.id,
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
}
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

    const validTypes = ['all', 'user', 'board', 'group', 'center', 'task', 'template', 'column', 'swimlane', 'templatecolumn', 'templateswimlane', 'tag', 'comment'];
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