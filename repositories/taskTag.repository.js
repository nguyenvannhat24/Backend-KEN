const TaskTag = require('../models/taskTag.model');

class TaskTagRepository {
  // Tạo TaskTag mới
  async create(data) {
    return await TaskTag.create(data);
  }

  // Lấy tất cả TaskTags
  async findAll() {
    return await TaskTag.find().populate('task_id').populate('tag_id');
  }

  // Lấy TaskTag theo task và tag
  async findByTaskAndTag(taskId, tagId) {
    return await TaskTag.findOne({ task_id: taskId, tag_id: tagId });
  }

  // Lấy TaskTags theo task
  async findByTaskId(taskId) {
    return await TaskTag.find({ task_id: taskId }).populate('tag_id');
  }

  // Lấy TaskTags theo tag
  async findByTagId(tagId) {
    return await TaskTag.find({ tag_id: tagId }).populate('task_id');
  }

  // Xóa TaskTag theo task và tag
  async deleteByTaskAndTag(taskId, tagId) {
    return await TaskTag.findOneAndDelete({ task_id: taskId, tag_id: tagId });
  }

  // Xóa tất cả TaskTags theo tag
  async deleteByTagId(tagId) {
    return await TaskTag.deleteMany({ tag_id: tagId });
  }

  // Xóa tất cả TaskTags theo task
  async deleteByTaskId(taskId) {
    return await TaskTag.deleteMany({ task_id: taskId });
  }
}

module.exports = new TaskTagRepository();
