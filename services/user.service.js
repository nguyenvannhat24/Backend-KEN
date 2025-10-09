const userRepo = require('../repositories/user.repository');
const bcrypt = require('bcrypt');
const keycloack = require('../services/keycloak.service');
/**
 * User Service - Xử lý business logic cho User
 * Chứa các methods xử lý logic nghiệp vụ liên quan đến user
 */
class UserService {

  /**
   * Validate user đăng nhập
   * @param {string} email - Email của user
   * @param {string} password - Mật khẩu (plain text)
   * @returns {Promise<Object|null>} User object nếu hợp lệ, null nếu không
   */
async validateUser(login, password) {
  try {
    console.log(`🔍 Validating user: ${login}`);

    // Validate input
    if (!login || !password) {
      console.log('❌ Email/username hoặc password không được để trống');
      return null;
    }

    // Tìm user theo email hoặc username
   let user = await userRepo.findByEmail(login);
if (!user) {
  user = await userRepo.findByUsername(login);
}

    if (!user) {
      console.log(`❌ Không tìm thấy user với login: ${login}`);
      return null;
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = this._validatePassword(password, user);
    if (!isPasswordValid) {
      console.log(`❌ Mật khẩu không đúng cho user: ${login}`);
      return null;
    }

    console.log(`✅ Đăng nhập thành công cho user: ${user.email || user.username}`);
    return user;

  } catch (error) {
    console.error('❌ Lỗi trong validateUser:', error.message);
    return null;
  }
}


  /**
   * Validate password (hỗ trợ nhiều format)
   * @param {string} inputPassword - Mật khẩu nhập vào
   * @param {Object} user - User object từ database
   * @returns {boolean} true nếu mật khẩu đúng
   * @private
   */
  _validatePassword(inputPassword, user) {
    // Kiểm tra password_hash (plain text hoặc bcrypt)
    if (user.password_hash) {
      // Nếu là bcrypt hash
      if (user.password_hash.startsWith('$2b$')) {
        return bcrypt.compareSync(inputPassword, user.password_hash);
      }
      // Nếu là plain text
      return user.password_hash === inputPassword;
    }

    // Kiểm tra password field (nếu có)
    if (user.password) {
      if (user.password.startsWith('$2b$')) {
        return bcrypt.compareSync(inputPassword, user.password);
      }
      return user.password === inputPassword;
    }

    return false;
  }



  /**
   * Lấy tất cả users với pagination
   * @param {Object} options - Options cho pagination
   * @returns {Promise<Object>} Object chứa users và pagination info
   */
  async getAllUsers(options = {}) {
    try {
      console.log('📋 Getting all users with options:', options);
      return await userRepo.findAll(options);
    } catch (error) {
      console.error('❌ Error in getAllUsers:', error.message);
      throw error;
    }
  }

  /**
   * Lấy user theo ID
   * @param {string} id - ObjectId của user
   * @returns {Promise<Object|null>} User object hoặc null
   */
  async getUserById(id) {
    try {
      if (!id) {
        throw new Error('ID không được để trống');
      }
      
      console.log(`🔍 Getting user by ID: ${id}`);
      return await userRepo.findById(id);
    } catch (error) {
      console.error('❌ Error in getUserById:', error.message);
      throw error;
    }
  }

  /**
   * Lấy user theo email
   * @param {string} email - Email của user
   * @returns {Promise<Object|null>} User object hoặc null
   */
  async getUserByEmail(email) {
    try {
      if (!email) {
        throw new Error('Email không được để trống');
      }
      
      console.log(`🔍 Getting user by email: ${email}`);
      return await userRepo.findByEmail(email);
    } catch (error) {
      console.error('❌ Error in getUserByEmail:', error.message);
      throw error;
    }
  }

  /**
   * Lấy user theo username
   * @param {string} username - Username của user
   * @returns {Promise<Object|null>} User object hoặc null
   */
  async getUserByUsername(username) {
    try {
      if (!username) {
        throw new Error('Username không được để trống');
      }
      
      console.log(`🔍 Getting user by username: ${username}`);
      return await userRepo.findByUsername(username);
    } catch (error) {
      console.error('❌ Error in getUserByUsername:', error.message);
      throw error;
    }
  }

  /**
   * Lấy user theo số điện thoại
   * @param {string} phoneNumber - Số điện thoại
   * @returns {Promise<Object|null>} User object hoặc null
   */
  async getUserByPhoneNumber(phoneNumber) {
    try {
      if (!phoneNumber) {
        throw new Error('Số điện thoại không được để trống');
      }
      
      console.log(`🔍 Getting user by phone: ${phoneNumber}`);
      return await userRepo.findByPhoneNumber(phoneNumber);
    } catch (error) {
      console.error('❌ Error in getUserByPhoneNumber:', error.message);
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
console.log('🔑 Creating user on Keycloak...');
    // Tạo trên Keycloak trước
    console.log('🔑 Creating user on Keycloak...');
    const userKeyCloak = await keycloack.createUserWithPassword(
      { username, email, full_name, status },
      password
    );
// Log chi tiết user Keycloak vừa tạo
console.log('✅ User created on Keycloak:');
console.log('ID:', userKeyCloak.id);
console.log('Username:', userKeyCloak.username);
console.log('Email:', userKeyCloak.email);
console.log('Full name:', userKeyCloak.full_name);
console.log('Status:', userKeyCloak.status);
    // Tạo local user
    console.log(`➕ Creating new local user: ${email}`);
    const localUser = await userRepo.create({
      username,
      email,
      full_name,
      status,
      idSSO: userKeyCloak.id, // liên kết với Keycloak
      typeAccount: "SSO",
      password_hash: userData.password_hash, // lưu hash (nếu có)
    });
// Log chi tiết user local vừa tạo
console.log('✅ Local user created:');
console.log(localUser);
    return localUser;
  } catch (error) {
    console.error('❌ Error in createUser:', error.message);
    throw error;
  }
}


async createUserSSO({ username, email, full_name, idSSO }) {
  try {
    if (!email) {
      throw new Error('Email là bắt buộc');
    }

    // Kiểm tra email đã tồn tại chưa
    const emailExists = await userRepo.isEmailExists(email);
    if (emailExists) {
      // Nếu tồn tại, trả về user hiện tại, không tạo mới
      console.log(`⚠️ User SSO với email ${email} đã tồn tại, dùng user hiện tại`);
      return await userRepo.findByEmail(email);
    }

    // Kiểm tra username tồn tại chưa
    if (username) {
      const usernameExists = await userRepo.isUsernameExists(username);
      if (usernameExists) {
        console.log(`⚠️ Username ${username} đã tồn tại, sẽ tiếp tục tạo user theo email`);
      }
    }

    console.log(`➕ Creating new userSSO: ${username}`);
    return await userRepo.createSSO({ username, email, full_name, idSSO });
  } catch (error) {
    console.error('❌ Error in createUserSSO:', error.message);
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
  async updateUser(id, updateData) {
    try {
      if (!id) {
        throw new Error('ID không được để trống');
      }
      if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error('Dữ liệu cập nhật không được để trống');
      }

      // Validate email format nếu có
      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
          throw new Error('Email không đúng định dạng');
        }

        // Kiểm tra email đã tồn tại chưa (loại trừ user hiện tại)
        const emailExists = await userRepo.isEmailExists(updateData.email, id);
        if (emailExists) {
          throw new Error('Email đã tồn tại trong hệ thống');
        }
      }

      // Kiểm tra username đã tồn tại chưa (nếu có)
      if (updateData.username) {
        const usernameExists = await userRepo.isUsernameExists(updateData.username, id);
        if (usernameExists) {
          throw new Error('Username đã tồn tại trong hệ thống');
        }
      }

      // Hash password nếu có
      if (updateData.password) {
        updateData.password_hash = bcrypt.hashSync(updateData.password, 10);
        delete updateData.password; // Xóa password plain text
      }

      console.log(`✏️ Updating user: ${id}`);
      return await userRepo.update(id, updateData);
    } catch (error) {
      console.error('❌ Error in updateUser:', error.message);
      throw error;
    }
  }

  /**
   * Xóa user
   * @param {string} id - ObjectId của user
   * @returns {Promise<Object|null>} User object đã xóa hoặc null
   */
  async deleteUser(id) {
    try {
      if (!id) {
        throw new Error('ID không được để trống');
      }

      console.log(`🗑️ Deleting user: ${id}`);
      return await userRepo.delete(id);
    } catch (error) {
      console.error('❌ Error in deleteUser:', error.message);
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
    console.log('📋 Getting all users');
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
    console.error('❌ Error in viewAll:', error.message);
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
    console.log(`✅ [UserService] Updated profile for user: ${userId}`);
    return user;
  } catch (error) {
    console.error('❌ [UserService] updateProfile error:', error);
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

    console.log(`🔍 [UserService] Change password for user: ${userId}`);
    console.log(`🔍 [UserService] User has password_hash: ${!!user.password_hash}`);
    console.log(`🔍 [UserService] Current password provided: ${currentPassword}`);

    // Kiểm tra mật khẩu hiện tại
    if (user.password_hash && user.password_hash !== null && user.password_hash !== undefined) {
      console.log(`🔍 [UserService] User has password_hash, validating current password`);
      
      // Kiểm tra xem password_hash có phải là bcrypt hash không
      const isBcryptHash = user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2y$');
      
      let isCurrentPasswordValid = false;
      
      if (isBcryptHash) {
        // Password đã được hash bằng bcrypt
        console.log(`🔍 [UserService] Password is bcrypt hashed, using bcrypt.compare`);
        isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      } else {
        // Password được lưu dưới dạng plain text
        console.log(`🔍 [UserService] Password is plain text, using direct comparison`);
        isCurrentPasswordValid = (currentPassword === user.password_hash);
      }
      
      console.log(`🔍 [UserService] Password comparison result: ${isCurrentPasswordValid}`);
      if (!isCurrentPasswordValid) {
        throw new Error('Mật khẩu hiện tại không đúng');
      }
    } else {
      // User không có password_hash - cho phép set password lần đầu
      console.log(`🔍 [UserService] User không có mật khẩu, cho phép set password lần đầu`);
      if (currentPassword) {
        console.log(`🔍 [UserService] User không có mật khẩu nhưng vẫn cung cấp current_password, bỏ qua validation`);
      }
    }

    // Hash mật khẩu mới
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Cập nhật mật khẩu
    await userRepo.update(userId, { password_hash: newPasswordHash });
    
    console.log(`✅ [UserService] Changed password for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ [UserService] changePassword error:', error);
    throw error;
  }
}

async getbyIdSOO(id){
  if(!id) throw new Error("idSSO là bắt buộc");
  return await userRepo.findbyIdSSO(id);
}



async searchAllUsers(keyword, page = 1, limit = 10) {
  try {
    const result = await userRepo.find({ keyword, page, limit });
    return result; // result.users + result.pagination
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
}

// ==================== SOFT DELETE METHODS ====================

/**
 * Soft delete user - Set deleted_at and change status to inactive
 * @param {string} id - User ID
 * @returns {Promise<Object>} Updated user
 */
async softDeleteUser(id) {
  try {
    console.log(`🗑️ Soft deleting user: ${id}`);
    const user = await userRepo.softDelete(id);
    if (!user) {
      throw new Error('User not found');
    }
    console.log(`✅ User soft deleted successfully: ${id}`);
    return user;
  } catch (error) {
    console.error('❌ Error soft deleting user:', error.message);
    throw error;
  }
}

/**
 * Restore soft deleted user
 * @param {string} id - User ID
 * @returns {Promise<Object>} Restored user
 */
async restoreUser(id) {
  try {
    console.log(`♻️ Restoring user: ${id}`);
    const user = await userRepo.restore(id);
    if (!user) {
      throw new Error('User not found or not deleted');
    }
    console.log(`✅ User restored successfully: ${id}`);
    return user;
  } catch (error) {
    console.error('❌ Error restoring user:', error.message);
    throw error;
  }
}

/**
 * Get all users including deleted ones (admin only)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Users with pagination
 */
async getAllUsersWithDeleted(options = {}) {
  try {
    console.log('📋 Getting all users including deleted');
    const result = await userRepo.findAllWithDeleted(options);
    return result;
  } catch (error) {
    console.error('❌ Error getting users with deleted:', error.message);
    throw error;
  }
}

/**
 * Get all deleted records across different entity types (admin only)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Deleted records with pagination
 */
async getAllDeletedRecords({ type = 'all', page = 1, limit = 10, sort = 'deleted_at', order = 'desc' }) {
  try {
    console.log(`📋 Getting deleted records - type: ${type}`);
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort]: order === 'desc' ? -1 : 1 }
    };

    let results = {};

    if (type === 'all' || type === 'user') {
      const userRepo = require('../repositories/user.repository');
      results.users = await userRepo.findAllWithDeleted(options);
    }

    if (type === 'all' || type === 'board') {
      const boardRepo = require('../repositories/board.repository');
      results.boards = await boardRepo.findAllWithDeleted(options);
    }

    if (type === 'all' || type === 'group') {
      const groupRepo = require('../repositories/group.repository');
      results.groups = await groupRepo.findAllWithDeleted(options);
    }

    if (type === 'all' || type === 'task') {
      const taskRepo = require('../repositories/task.repository');
      results.tasks = await taskRepo.findAllWithDeleted(options);
    }

    if (type === 'all' || type === 'template') {
      const templateRepo = require('../repositories/template.repository');
      results.templates = await templateRepo.findAllWithDeleted(options);
    }

    if (type === 'all' || type === 'column') {
      const columnRepo = require('../repositories/column.repository');
      results.columns = await columnRepo.findAllWithDeleted(options);
    }

    if (type === 'all' || type === 'swimlane') {
      const swimlaneRepo = require('../repositories/swimlane.repository');
      results.swimlanes = await swimlaneRepo.findAllWithDeleted(options);
    }

    if (type === 'all' || type === 'center') {
      const centerRepo = require('../repositories/center.repository');
      results.centers = await centerRepo.findAllWithDeleted(options);
    }

    if (type === 'all' || type === 'templatecolumn') {
      const templateColumnRepo = require('../repositories/templateColumn.repository');
      results.templateColumns = await templateColumnRepo.findAllWithDeleted(options);
    }

    if (type === 'all' || type === 'templateswimlane') {
      const templateSwimlaneRepo = require('../repositories/templateSwimlane.repository');
      results.templateSwimlanes = await templateSwimlaneRepo.findAllWithDeleted(options);
    }

    if (type === 'all' || type === 'tag') {
      const tagRepo = require('../repositories/tag.repository');
      results.tags = await tagRepo.findAllWithDeleted(options);
    }

    if (type === 'all' || type === 'comment') {
      const commentRepo = require('../repositories/comment.repository');
      results.comments = await commentRepo.findAllWithDeleted(options);
    }

    return {
      success: true,
      type,
      data: results,
      pagination: {
        page: options.page,
        limit: options.limit
      }
    };
  } catch (error) {
    console.error('❌ Error getting deleted records:', error.message);
    throw error;
  }
}

}
module.exports = new UserService();