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
    const userAll = await userService.viewAll();

    return res.json({
      success: true,
      count: userAll.length,
      data: userAll
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
    const userId = req.user.id; // lấy id từ token
    const roles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    const isAdmin = roles.includes('admin');

    if (userId == req.params.id || isAdmin) {
      const checkUser = await userService.getUserById(req.params.id);
      if (!checkUser) throw new Error("Không tìm thấy user bạn muốn cập nhật");

      const typeAccount = checkUser.typeAccount;

      // Luôn update trên DB trước
      let user = await userService.updateUser(req.params.id, req.body);

      // Nếu user này thuộc SSO thì cập nhật bên Keycloak
      if (typeAccount === 'SSO') {
        const id = checkUser.idSSO; // ID user trên Keycloak

        // Map dữ liệu từ payload frontend sang schema của Keycloak
        const keycloakPayload = {
          username: req.body.username || checkUser.username,
          email: req.body.email || checkUser.email,
          firstName: req.body.full_name ? req.body.full_name.split(" ")[0] : checkUser.full_name,
          lastName: req.body.full_name ? req.body.full_name.split(" ").slice(1).join(" ") : "",
          enabled: req.body.status ? req.body.status.toLowerCase() === "active" : checkUser.status === "active",
        };

        // Nếu frontend gửi password mới thì update luôn
        if (req.body.password) {
          keycloakPayload.credentials = [
            {
              type: "password",
              value: req.body.password,
              temporary: false
            }
          ];
        }

        await updateUser(id, keycloakPayload); // gọi hàm update lên Keycloak
      }

      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    }
  } catch (err) {
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
