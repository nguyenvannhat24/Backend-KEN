const userRepo = require('../repositories/user.repository');
const bcrypt = require('bcrypt');

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
  async validateUser(email, password) {
    try {
      console.log(`🔍 Validating user: ${email}`);

      // Validate input
      if (!email || !password) {
        console.log('❌ Email hoặc password không được để trống');
        return null;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('❌ Email không đúng định dạng');
        return null;
      }

      // Tìm user theo email
      const user = await userRepo.findByEmail(email);
      if (!user) {
        console.log(`❌ Không tìm thấy user với email: ${email}`);
        return null;
      }

      // Kiểm tra mật khẩu (hỗ trợ cả password_hash và password field)
      const isPasswordValid = this._validatePassword(password, user);
      if (!isPasswordValid) {
        console.log(`❌ Mật khẩu không đúng cho user: ${email}`);
        return null;
      }

      console.log(`✅ Đăng nhập thành công cho user: ${email}`);
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

  /**
   * Tạo user mới
   * @param {Object} userData - Dữ liệu user
   * @returns {Promise<Object>} User object đã tạo
   */
  async createUser(userData ) {
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

      // Kiểm tra username đã tồn tại chưa (nếu có)
      if (userData.username) {
        const usernameExists = await userRepo.isUsernameExists(userData.username);
        if (usernameExists) {
          throw new Error('Username đã tồn tại trong hệ thống');
        }
      }

      // Hash password nếu có
      if (userData.password) {
        userData.password_hash = bcrypt.hashSync(userData.password, 10);
        delete userData.password; // Xóa password plain text
      }

      console.log(`➕ Creating new user: ${userData.email}`);
      return await userRepo.create(userData);
    } catch (error) {
      console.error('❌ Error in createUser:', error.message);
      throw error;
    }
  }

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
  async viewAll() {
    try {
      console.log('📋 Getting all users (deprecated method)');
      const result = await userRepo.findAll();
      return result.users || result; // Hỗ trợ cả pagination và non-pagination
    } catch (error) {
      console.error('❌ Error in viewAll:', error.message);
      throw error;
    }
  }

async getProfile(userId) {
  if (!userId) throw new Error("UserId là bắt buộc");
  return await userRepo.getProfileById(userId);
}

}

module.exports = new UserService();
