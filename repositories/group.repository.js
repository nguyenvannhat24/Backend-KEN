const Group = require('../models/group.model');

class GroupRepository {
  async create(data) {
    return await Group.create(data);
  }

  async findById(id) {
    return await Group.findById(id).lean();
  }

  async findAll() {
    return await Group.find().lean();
  }

  async update(id, data) {
    return await Group.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id) {
    return await Group.findByIdAndDelete(id);
  }

  async findbyName(name){
    return await Group.findOne({name});
  }
  
 async findOne(center_id, name) {
  return await Group.findOne({
    center_id: center_id, // ObjectId
    name: name
  }).lean();
}

  async softDelete(id) {
    try {
      return await Group.findByIdAndUpdate(
        id,
        { deleted_at: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('Error soft deleting group:', error);
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

      const groups = await Group.find({
        $or: [
          { deleted_at: null },
          { deleted_at: { $ne: null } }
        ]
      })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Group.countDocuments({
        $or: [
          { deleted_at: null },
          { deleted_at: { $ne: null } }
        ]
      });

      return {
        groups,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error finding all groups with deleted:', error);
      throw error;
    }
  }
}

module.exports = new GroupRepository();
