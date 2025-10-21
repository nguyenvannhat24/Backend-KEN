const userRepo = require('../repositories/user.repository');
const bcrypt = require('bcrypt');
const keycloack = require('../services/keycloak.service');
const userRole = require('../repositories/userRole.repository');
const { restoreUserOnKeycloak } = require('../services/keycloak.service');
/**
 * User Service - Xử lý business logic cho User
 * Chứa các methods xử lý logic nghiệp vụ liên quan đến user
 */
class UserService {
  async validateUser(login, password) {
    try {
      if (!login || !password) {
        return null;
      }

      let user = await userRepo.findByEmail(login);
      if (!user) {
        user = await userRepo.findByUsername(login);
      }

      if (!user) {
        return null;
      }

      const isPasswordValid = this._validatePassword(password, user);
      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  }

  _validatePassword(inputPassword, user) {
    if (user.password_hash) {
      if (user.password_hash.startsWith('$2b$')) {
        return bcrypt.compareSync(inputPassword, user.password_hash);
      }
      return user.password_hash === inputPassword;
    }

    if (user.password) {
      if (user.password.startsWith('$2b$')) {
        return bcrypt.compareSync(inputPassword, user.password);
      }
      return user.password === inputPassword;
    }

    return false;
  }
  
  async getAllUsers(options = {}) {
    try {
      return await userRepo.findAll(options);
    } catch (error) {
      console.error('Error in getAllUsers:', error.message);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      return await userRepo.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      return await userRepo.findByEmail(email);
    } catch (error) {
      throw error;
    }
  }

  async getUserByUsername(username) {
    try {
      return await userRepo.findByUsername(username);
    } catch (error) {
      throw error;
    }
  }

async createUser(userData) {
  try {
    // Validate input
    if (!userData || !userData.email) {
      throw new Error('Email là bắt buộc');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Email không đúng định dạng');
    }

    // Kiểm tra email đã tồn tại chưa
    const emailExists = await userRepo.isEmailExists(userData.email);
    if (emailExists) {
      throw new Error('Email đã tồn tại trong hệ thống');
    }

    // Kiểm tra username đã tồn tại chưa
    if (userData.username) {
      const usernameExists = await userRepo.isUsernameExists(userData.username);
      if (usernameExists) {
        throw new Error('Username đã tồn tại trong hệ thống');
      }
    }

    // Hash password nếu có
    if (userData.password) {
      userData.password_hash = bcrypt.hashSync(userData.password, 10);
    }

    // Lấy ra biến từ userData
      const { username, email, full_name, status, password } = userData;

    // Tạo trên Keycloak trước
  
    const userKeyCloak = await keycloack.createUserWithPassword(
      { username, email, full_name, status },
      password
    );

    // Tạo local user
  
    const localUser = await userRepo.create({
      username,
      email,
      full_name,
      status,
      idSSO: userKeyCloak.id, 
      typeAccount: "SSO",
      password_hash: userData.password_hash, 
    });

    return localUser;
  } catch (error) {
    throw error;
  }
}

  async createUserSSO(userData) {
    try {
      userData.typeAccount = 'SSO';
      return await userRepo.create(userData);
    } catch (error) {
      throw error;
    }
  }



  /**

  /**
   * Cập nhật user
   * @param {string} id - ObjectId của user
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise<Object|null>} User object đã cập nhật hoặc null
   */
/**
 * Cập nhật user
 * @param {string} idUpdate - ID của người thực hiện update
 * @param {string} id - ID của user cần update
 * @param {Object} updateData - Dữ liệu cập nhật
 */
async updateUser(idUpdate, id, updateData) {
  try {
    if (!id) throw new Error('ID không được để trống');
    if (!updateData || Object.keys(updateData).length === 0)
      throw new Error('Dữ liệu cập nhật không được để trống');

    // ✅ Validate email 
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email))
        throw new Error('Email không đúng định dạng');

      const emailExists = await userRepo.isEmailExists(updateData.email, id);
      if (emailExists) throw new Error('Email đã tồn tại trong hệ thống');
    }

    // ✅ Validate username
    if (updateData.username) {
      const usernameExists = await userRepo.isUsernameExists(updateData.username, id);
      if (usernameExists) throw new Error('Username đã tồn tại trong hệ thống');
    }

    // ✅ Hash password nếu có
    if (updateData.password) {
      updateData.password_hash = bcrypt.hashSync(updateData.password, 10);
      delete updateData.password;
    }

    // ✅ Cập nhật role nếu có
    if (updateData.roles) {
      if (!Array.isArray(updateData.roles)) {
        throw new Error('Roles phải là một mảng');
      }

      // FE truyền ["admin"] hoặc ["672c123..."]
      const roleId = updateData.roles[0]; // chỉ lấy 1 quyền duy nhất
      if (!roleId ) throw new Error('Role không hợp lệ');
      
      await userRole.updateByIdUser(idUpdate, id, roleId);
      delete updateData.roles;
    }

   
    return await userRepo.update(id, updateData);

  } catch (error) {
    throw error;
  }
}


  async deleteUser(id) {
    try {
      return await userRepo.deleteById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy tất cả users (backward compatibility)
   * @deprecated Sử dụng getAllUsers thay thế
   * @returns {Promise<Array>} Array of users
   */
  async viewAll(options = {}) {
  try {

    const result = await userRepo.findAll(options);

    // Luôn trả về đúng cấu trúc
    return {
      users: result.users,
      totalUsers: result.pagination.total,
      totalPages: result.pagination.pages,
      currentPage: result.pagination.page,
      limit: result.pagination.limit
    };
  } catch (error) {
    throw error;
  }
}


async getProfile(userId) {
  if (!userId) throw new Error("UserId là bắt buộc");
  return await userRepo.getProfileById(userId);
}

async getUserWithPassword(userId) {
  if (!userId) throw new Error("UserId là bắt buộc");
  return await userRepo.findById(userId);
}

async updateProfile(userId, updateData) {
  try {
    const user = await userRepo.update(userId, updateData);
   
    return user;
  } catch (error) {
    throw error;
  }
}

async changePassword(userId, currentPassword, newPassword) {
  try {
    // Lấy user hiện tại (bao gồm password_hash)
    const user = await this.getUserWithPassword(userId);
    if (!user) {
      throw new Error('User không tồn tại');
    }

    // Kiểm tra mật khẩu hiện tại
    if (user.password_hash && user.password_hash !== null && user.password_hash !== undefined) {
     
      
      // Kiểm tra xem password_hash có phải là bcrypt hash không
      const isBcryptHash = user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2y$');
      
      let isCurrentPasswordValid = false;
      
      if (isBcryptHash) {
        // Password đã được hash bằng bcrypt
      
        isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      } else {
        // Password được lưu dưới dạng plain text
        
        isCurrentPasswordValid = (currentPassword === user.password_hash);
      }
      

      if (!isCurrentPasswordValid) {
        throw new Error('Mật khẩu hiện tại không đúng');
      }
    } else {
      // User không có password_hash - cho phép set password lần đầu
   
     
    }

    // Hash mật khẩu mới
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Cập nhật mật khẩu
    await userRepo.update(userId, { password_hash: newPasswordHash });
    
    return true;
  } catch (error) {
    throw error;
  }
}

async getbyIdSOO(id){
  if(!id) throw new Error("idSSO là bắt buộc");
  return await userRepo.findbyIdSSO(id);
}

async searchAllUsers(keyword, page = 1, limit = 10) {
  try {
    const result = await userRepo.search(keyword, { page, limit });
    return result; // result.users + result.pagination
  } catch (error) {
    throw error;
  }
}
  /**
   * Soft delete user
   */
  async softDeleteUser(id) {
    try {
      const user = await userRepo.softDelete(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Restore user
   */
async  restoreUser(id) {
  const user = await userRepo.restore(id);
  if (!user) return null;

  // 🔹 Nếu user có tài khoản SSO → kích hoạt lại trên Keycloak
  if (user.typeAccount === 'SSO' && user.idSSO) {
    try {
      
      await restoreUserOnKeycloak(user.idSSO);
  
    } catch (kcError) {
      }
  }

  return user;
}

  /**
   * Get all users including soft deleted
   */

  async getAllDeletedRecords({ type = 'all', page = 1, limit = 10, sort = 'deleted_at', order = 'desc' }) {
    try {
      const options = { page, limit, sortBy: sort, sortOrder: order };
      
      if (type === 'all') {
        return await userRepo.findAllWithDeleted(options);
      }
      
      return await userRepo.findDeleted(options);
    } catch (error) {
      throw error;
    }
  } 

  async findUsers(data) {
    try {
      const keyword = data?.infor || "";
      const users = await userRepo.findUserSimilar(keyword);
      return users;
    } catch (error) {
      throw error;
    }
  }

}
module.exports = new UserService();
