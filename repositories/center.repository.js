const Center = require('../models/center.model');

class CenterRepository {
  async findAll() {
    return Center.find().lean();
  }

  async findById(id) {
    return Center.findById(id).lean();
  }

  async create(centerData) {
    return Center.create(centerData);
  }

  async update(id, updateData) {
    return Center.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }

  async delete(id) {
    return Center.findByIdAndDelete(id).lean();
  }

  async softDelete(id) {
    try {
      return await Center.findByIdAndUpdate(
        id,
        { deleted_at: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('Error soft deleting center:', error);
      throw error;
    }
  }

  async findAllWithDeleted(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const centers = await Center.find({
        $or: [
          { deleted_at: null },
          { deleted_at: { $ne: null } }
        ]
      })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Center.countDocuments({
        $or: [
          { deleted_at: null },
          { deleted_at: { $ne: null } }
        ]
      });

      return {
        centers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error finding all centers with deleted:', error);
      throw error;
    }
  }
}

module.exports = new CenterRepository();
