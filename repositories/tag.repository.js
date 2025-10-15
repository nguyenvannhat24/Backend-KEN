const Tag = require('../models/tag.model');
const mongoose = require('mongoose');

class TagRepository {
  // Tạo tag mới
  async create(data) {
    return await Tag.create(data);
  }

  // Lấy tất cả tags
  async findAll() {
    return await Tag.find().sort({ name: 1 });
  }

  // Lấy tag theo ID
  async findById(id) {
    return await Tag.findById(id);
  }

  // Lấy tag theo tên
  async findByName(name) {
    return await Tag.findOne({ name: name });
  }

  // Cập nhật tag
  async update(id, data) {
    return await Tag.findByIdAndUpdate(id, data, { new: true });
  }

  // Xóa tag
  async delete(id) {
    return await Tag.findByIdAndDelete(id);
  }

  // Lấy tags của task
  async findByTaskId(taskId) {
    return await Tag.aggregate([
      {
        $lookup: {
          from: 'tasktags',
          localField: '_id',
          foreignField: 'tag_id',
          as: 'taskTags'
        }
      },
      {
        $match: {
          'taskTags.task_id': new mongoose.Types.ObjectId(taskId)
        }
      },
      {
        $project: {
          taskTags: 0
        }
      }
    ]);
  }

  // ==================== SOFT DELETE METHODS ====================

  async softDelete(id) {
    try {
      return await Tag.findByIdAndUpdate(
        id,
        { deleted_at: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('Error soft deleting tag:', error);
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

      const query = {
        $or: [
          { deleted_at: null },
          { deleted_at: { $ne: null } }
        ]
      };

      const [tags, total] = await Promise.all([
        Tag.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Tag.countDocuments(query)
      ]);

      return {
        tags,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error finding all tags with deleted:', error);
      throw error;
    }
  }
  async findByNameAndBoardId(nameTag , boardId) {
    try {
      const tags = await Tag.findOne({ 
        board_id: boardId ,
        name : nameTag

      }).lean();
      return tags;
    } catch (error) {
        console.error('Error finding all tags with deleted:', error);
      throw error;
    }
   
  }

}

module.exports = new TagRepository();
