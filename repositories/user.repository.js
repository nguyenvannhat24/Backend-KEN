const User = require('../models/usersModel');

class UserRepository {
  async findById(id) {
    try {
      return await User.findById(id).lean();
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async getProfileById(id) {
    try {
      const user = await User.findById(id).lean();
      if (!user) return null;
      const { password, password_hash, ...profile } = user;
      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      return await User.findOne({ email: email.toLowerCase().trim() }).exec();
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findByUsername(username) {
    try {
      return await User.findOne({ username: username.trim() }).lean();
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

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

      const pipeline = [
        {
          $match: { deleted_at: null } // ✅ chỉ lấy user chưa bị xóa mềm
        },
        {
          $lookup: {
            from: "UserRoles",
            localField: "_id",
            foreignField: "user_id",
            as: "user_roles"
          }
        },
        {
          $lookup: {
            from: "Roles",
            localField: "user_roles.role_id",
            foreignField: "_id",
            as: "roles"
          }
        },
        {
          $addFields: {
            role_name: { $arrayElemAt: ["$roles.name", 0] }
          }
        },
        { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
        { $skip: skip },
        { $limit: limit }
      ];

      const users = await User.aggregate(pipeline);
      const total = await User.countDocuments();

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
      console.error("Error finding all users:", error);
      throw error;
    }
  }

  async create(userData) {
    try {
      return await User.create(userData);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateById(id, updateData) {
    try {
      updateData.updated_at = new Date();
      return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteById(id) {
    try {
      return await User.findByIdAndDelete(id).lean();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async search(keyword, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const searchQuery = {
        $or: [
          { email: { $regex: keyword, $options: 'i' } },
          { username: { $regex: keyword, $options: 'i' } },
          { full_name: { $regex: keyword, $options: 'i' } }
        ]
      };

      const [users, total] = await Promise.all([
        User.find(searchQuery).sort(sort).skip(skip).limit(limit).lean(),
        User.countDocuments(searchQuery)
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
      console.error('Error searching users:', error);
      throw error;
    }
  }

  async searchAll(keyword, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const searchQuery = {
        $or: [
          { email: { $regex: keyword, $options: 'i' } },
          { username: { $regex: keyword, $options: 'i' } },
          { full_name: { $regex: keyword, $options: 'i' } }
        ]
      };

      const users = await User.find(searchQuery)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await User.countDocuments(searchQuery);

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
      console.error('Error searching all users:', error);
      throw error;
    }
  }

  /*
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

  async restore(id) {
    try {
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

      const query = {
        $or: [
          { deleted_at: null },
          { deleted_at: { $ne: null } }
        ]
      };

      const [users, total] = await Promise.all([
        User.find(query).sort(sort).skip(skip).limit(limit).lean(),
        User.countDocuments(query)
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
      console.error('Error finding all users with deleted:', error);
      throw error;
    }
  }

  async findDeleted(options = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'deleted_at',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // 🔹 Chỉ lấy user đã bị soft delete
    const query = { deleted_at: { $ne: null } };

    // 🔹 Gộp lookup role giống findAll()
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "UserRoles",
          localField: "_id",
          foreignField: "user_id",
          as: "user_roles"
        }
      },
      {
        $lookup: {
          from: "Roles",
          localField: "user_roles.role_id",
          foreignField: "_id",
          as: "roles"
        }
      },
      {
        $addFields: {
          role_name: { $arrayElemAt: ["$roles.name", 0] }
        }
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit }
    ];

    const users = await User.aggregate(pipeline);
    const total = await User.countDocuments(query);

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
    console.error('Error finding deleted users:', error);
    throw error;
  }
}

async isEmailExists(email, excludeUserId = null) {
  try {
    const query = { email: email.toLowerCase().trim() };
    if (excludeUserId) query._id = { $ne: excludeUserId };
    const existingUser = await User.findOne(query).lean();
    return !!existingUser;
  } catch (error) {
    console.error('Error checking existing email:', error);
    throw error;
  }
}

async isUsernameExists(username, excludeUserId = null) {
  try {
    const query = { username: username.trim() };
    if (excludeUserId) query._id = { $ne: excludeUserId };
    const existingUser = await User.findOne(query).lean();
    return !!existingUser;
  } catch (error) {
    console.error('Error checking existing username:', error);
    throw error;
  }
}

async findbyIdSSO(idSSO) {
  try {
    return await User.findOne({ idSSO }).lean();
  } catch (error) {
    console.error('Error finding user by idSSO:', error);
    throw error;
  }
}
async update(id, updateData) {
  return await this.updateById(id, updateData);
}

}

module.exports = new UserRepository();
