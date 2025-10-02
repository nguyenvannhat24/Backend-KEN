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
}

module.exports = new TagRepository();
