const User = require('../models/usersModel');

class UserRepository {
  async findById(id) {
    try {
      return await User.findById(id).lean();
    } catch (error) {
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
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      return await User.findOne({ email: email.toLowerCase().trim() }).exec();
    } catch (error) {
      throw error;
    }
  }

  async findByUsername(username) {
    try {
      return await User.findOne({ username: username.trim() }).lean();
    } catch (error) {
      throw error;
    }
  }

  async findByPhoneNumber(phoneNumber) {
    try {
      return await User.findOne({ phone_number: phoneNumber }).lean();
    } catch (error) {
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
      sortOrder = 'desc',
      filter = {},
      search = null
    } = options;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Build match query with filters
    const matchQuery = { deleted_at: null };

    // Apply filters
    if (filter.status) matchQuery.status = filter.status;
    if (filter.typeAccount) matchQuery.typeAccount = filter.typeAccount;
    
    // Handle any other filters
    Object.keys(filter).forEach(key => {
      if (!['status', 'typeAccount', 'role'].includes(key)) {
        matchQuery[key] = filter[key];
      }
    });

    const pipeline = [
      { $match: matchQuery },
      
      // Lookup UserRoles and Roles
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
      }
    ];

    // Apply search filter AFTER lookups
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { email: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } },
            { full_name: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Apply role filter AFTER role_name is populated
    if (filter.role) {
      pipeline.push({
        $match: {
          role_name: { $regex: `^${filter.role}$`, $options: 'i' }
        }
      });
    }

    // Count total BEFORE sort/skip/limit
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await User.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add sort and pagination
    pipeline.push({ $sort: sort });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Project để format response rõ ràng hơn
    pipeline.push({
      $project: {
        _id: 1,
        email: 1,
        username: 1,
        full_name: 1,
        avatar_url: 1,
        status: 1,
        typeAccount: 1,
        created_at: 1,
        updated_at: 1,
        // Role info ngắn gọn
        role: {
          name: "$role_name",
          id: { $arrayElemAt: ["$roles._id", 0] }
        },
        // Giữ lại fields cũ cho backward compatible
        role_name: 1,
        user_roles: 1,
        roles: 1
      }
    });

    const users = await User.aggregate(pipeline);

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
    throw error;
  }
}

  async create(userData) {
    try {
      return await User.create(userData);
    } catch (error) {
      throw error;
    }
  }

  async updateById(id, updateData) {
    try {
      updateData.updated_at = new Date();
      return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
    } catch (error) {
      throw error;
    }
  }

  async deleteById(id) {
    try {
      return await User.findByIdAndDelete(id).lean();
    } catch (error) {
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
    throw error;
  }
}

async findbyIdSSO(idSSO) {
  try {
    return await User.findOne({ idSSO }).lean();
  } catch (error) {
    throw error;
  }
}
async update(id, updateData) {
  return await this.updateById(id, updateData);
}
async findUserSimilar(infor) {
  try {
    const keyword = infor?.trim();
    if (!keyword) return [];

    const users = await User.find({
       deleted_at: { $ne: true }, 
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } }
      ]
    }).lean();

    return users;
  } catch (error) {
    throw error;
  }
}


}

module.exports = new UserRepository();
