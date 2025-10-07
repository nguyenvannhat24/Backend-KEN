const User = require('../models/usersModel');

/**
 * User Repository - Xử lý logic tương tác với database cho User
 * Chứa các methods CRUD cơ bản và tìm kiếm user
 */
class UserRepository {
  
  /**
   * Tìm user theo ID
   * @param {string} id - ObjectId của user
   * @returns {Promise<Object|null>} User object hoặc null
   */
  async findById(id) {
    try {
      return await User.findById(id).lean();
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

/**
 * Lấy profile user theo ID, loại bỏ các trường nhạy cảm
 * @param {string} id - ObjectId của user
 * @returns {Promise<Object|null>} User profile hoặc null
 */

async getProfileById(id) {
  try {
    const user = await User.findById(id).lean();
    if (!user) return null;

    // Loại bỏ các trường nhạy cảm
    const { password, password_hash, ...profile } = user;
    return profile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

  /**
   * Tìm user theo email
   * @param {string} email - Email của user
   * @returns {Promise<Object|null>} User object hoặc null
   */
  async findByEmail(email) {
    try {
      return await User.findOne({ email: email.toLowerCase().trim() }).exec();
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Tìm user theo username
   * @param {string} username - Username của user
   * @returns {Promise<Object|null>} User object hoặc null
   */
  async findByUsername(username) {
    try {
      return await User.findOne({ username: username.trim() }).lean();
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  /**
   * Tìm user theo số điện thoại (nếu có field này)
   * @param {string} phoneNumber - Số điện thoại
   * @returns {Promise<Object|null>} User object hoặc null
   */
  async findByPhoneNumber(phoneNumber) {
    try {
      return await User.findOne({ phone_number: phoneNumber }).lean();
    } catch (error) {
      console.error('Error finding user by phone number:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả users với pagination
   * @param {Object} options - Options cho pagination
   * @param {number} options.page - Trang hiện tại (default: 1)
   * @param {number} options.limit - Số lượng items per page (default: 10)
   * @param {string} options.sortBy - Field để sort (default: 'created_at')
   * @param {string} options.sortOrder - Thứ tự sort: 'asc' hoặc 'desc' (default: 'desc')
   * @returns {Promise<Object>} Object chứa users và pagination info
   */
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const [users, total] = await Promise.all([
        User.find()
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments()
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  /**
   * Tạo user mới
   * @param {Object} userData - Dữ liệu user
   * @returns {Promise<Object>} User object đã tạo
   */
  async create(userData) {
    try {
      // Chuẩn hóa email
      if (userData.email) {
        userData.email = userData.email.toLowerCase().trim();
      }
      
      return await User.create(userData);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

async createSSO({ username, email, full_name, idSSO }) {
  const typeAccount = "SSO";
  const userSSO = new User({ username, email, full_name, typeAccount, idSSO });
  return await User.create(userSSO);
}


  /**
   * Cập nhật user theo ID
   * @param {string} id - ObjectId của user
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise<Object|null>} User object đã cập nhật hoặc null
   */
  async update(id, updateData) {
    try {
      // Chuẩn hóa email nếu có
      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase().trim();
      }

      return await User.findByIdAndUpdate(
        id, 
        updateData, 
        { 
          new: true, 
          runValidators: true 
        }
      ).lean();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Xóa user theo ID
   * @param {string} id - ObjectId của user
   * @returns {Promise<Object|null>} User object đã xóa hoặc null
   */
  async delete(id) {
    try {
      return await User.findByIdAndDelete(id).lean();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra email đã tồn tại chưa
   * @param {string} email - Email cần kiểm tra
   * @param {string} excludeId - ID user cần loại trừ (khi update)
   * @returns {Promise<boolean>} true nếu email đã tồn tại
   */
  async isEmailExists(email, excludeId = null) {
    try {
      const query = { email: email.toLowerCase().trim() };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      
      const user = await User.findOne(query).lean();
      return !!user;
    } catch (error) {
      console.error('Error checking email exists:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra username đã tồn tại chưa
   * @param {string} username - Username cần kiểm tra
   * @param {string} excludeId - ID user cần loại trừ (khi update)
   * @returns {Promise<boolean>} true nếu username đã tồn tại
   */
  async isUsernameExists(username, excludeId = null) {
    try {
      const query = { username: username.trim() };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      
      const user = await User.findOne(query).lean();
      return !!user;
    } catch (error) {
      console.error('Error checking username exists:', error);
      throw error;
    }
  }


  async findbyIdSSO(idSSO){
   try {
    return await User.findOne({idSSO : idSSO}) ;
   } catch (error) {
      console.error('Error checking username exists:', error);
      throw error;
   }
  }

  /**
   * Soft delete user
   * @param {string} id - User ID
   * @returns {Promise<Object>} Updated user
   */
  async softDelete(id) {
    try {
      return await User.findByIdAndUpdate(
        id,
        { 
          deleted_at: new Date(),
          status: 'inactive'
        },
        { new: true }
      );
    } catch (error) {
      console.error('Error soft deleting user:', error);
      throw error;
    }
  }

  /**
   * Restore soft deleted user
   * @param {string} id - User ID
   * @returns {Promise<Object>} Restored user
   */
  async restore(id) {
    try {
      // Explicitly query for soft-deleted users to bypass middleware
      return await User.findOneAndUpdate(
        { _id: id, deleted_at: { $ne: null } },
        { 
          deleted_at: null,
          status: 'active'
        },
        { new: true }
      );
    } catch (error) {
      console.error('Error restoring user:', error);
      throw error;
    }
  }

  /**
   * Find all users including soft deleted
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} Users and pagination info
   */
  async findAllWithDeleted(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Use $or to bypass middleware
      const users = await User.find({
        $or: [
          { deleted_at: null },
          { deleted_at: { $ne: null } }
        ]
      })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await User.countDocuments({
        $or: [
          { deleted_at: null },
          { deleted_at: { $ne: null } }
        ]
      });

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error finding all users with deleted:', error);
      throw error;
    }
  }
}

module.exports = new UserRepository();