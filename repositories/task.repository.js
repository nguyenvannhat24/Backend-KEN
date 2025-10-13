const Task = require('../models/task.model');

class TaskRepository {
  // Tạo task mới
  async create(taskData) {
    const task = new Task(taskData);
    return await task.save();
  }

  // Lấy task theo ID
  async findById(id) {
    return await Task.findById(id)
      .populate('board_id', 'title description')
      .populate('column_id', 'name')
      .populate('swimlane_id', 'name')
      .populate('created_by', 'username full_name email')
      .populate('assigned_to', 'username full_name email')
      .lean();
  }

  // Lấy tất cả tasks của board
  async findByBoard(board_id) {
    return await Task.find({ board_id })
      .populate('column_id', 'name order')
      .populate('swimlane_id', 'name order')
      .populate('created_by', 'username full_name')
      .populate('assigned_to', 'username full_name')
      .sort({ created_at: -1 })
      .lean();
  }

  // Lấy tasks theo column
  async findByColumn(column_id) {
    return await Task.find({ column_id })
      .populate('swimlane_id', 'name')
      .populate('created_by', 'username full_name')
      .populate('assigned_to', 'username full_name')
      .sort({ created_at: -1 })
      .lean();
  }

  // Lấy tasks theo swimlane
  async findBySwimlane(swimlane_id) {
    return await Task.find({ swimlane_id })
      .populate('column_id', 'name')
      .populate('created_by', 'username full_name')
      .populate('assigned_to', 'username full_name')
      .sort({ created_at: -1 })
      .lean();
  }

  // Lấy tasks được assign cho user
  async findByAssignedUser(user_id) {
    return await Task.find({ assigned_to: user_id })
      .populate('board_id', 'title')
      .populate('column_id', 'name')
      .populate('created_by', 'username full_name')
      .sort({ due_date: 1, created_at: -1 })
      .lean();
  }

  // Lấy tasks được tạo bởi user
  async findByCreator(user_id) {
    return await Task.find({ created_by: user_id })
      .populate('board_id', 'title')
      .populate('column_id', 'name')
      .populate('assigned_to', 'username full_name')
      .sort({ created_at: -1 })
      .lean();
  }

  // Cập nhật task
  async update(id, updateData) {
    return await Task.findByIdAndUpdate(
      id, 
      { ...updateData, updated_at: Date.now() }, 
      { new: true }
    ).lean();
  }

  // Xóa task
  async delete(id) {
    return await Task.findByIdAndDelete(id).lean();
  }

  // Chuyển task sang column khác (drag & drop)
  async moveToColumn(task_id, new_column_id, new_swimlane_id = null) {
    const updateData = { 
      column_id: new_column_id,
      updated_at: Date.now()
    };
    
    if (new_swimlane_id) {
      updateData.swimlane_id = new_swimlane_id;
    }

    return await Task.findByIdAndUpdate(task_id, updateData, { new: true }).lean();
  }

  // Đếm tasks theo trạng thái
  async countByBoard(board_id) {
    return await Task.aggregate([
      { $match: { board_id: board_id } },
      { 
        $group: {
          _id: '$column_id',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  // Tìm kiếm tasks
  async search(board_id, searchQuery) {
    return await Task.find({
      board_id,
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    })
    .populate('column_id', 'name')
    .populate('assigned_to', 'username full_name')
    .lean();
  }

  async deleteManyByBoard(board_id, session = null) {
    const query = Task.deleteMany({ board_id });
    return session ? query.session(session) : query;
  }

// ==================== SOFT DELETE METHODS ====================

async softDelete(id) {
  try {
    return await Task.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true }
    );
  } catch (error) {
    console.error('Error soft deleting task:', error);
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

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(query)
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error finding all tasks with deleted:', error);
    throw error;
  }
}

}

module.exports = new TaskRepository();
