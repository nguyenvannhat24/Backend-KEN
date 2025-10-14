const taskService = require('../services/task.service');
const Task = require('../models/task.model');
class TaskController {
  // Tạo task mới
  async create(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }

      const taskData = req.body;
      const task = await taskService.createTask(taskData, userId);
      
      res.status(201).json({
        success: true,
        message: 'Tạo task thành công',
        data: task
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy task theo ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);
      
      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy tất cả tasks của board
  async getByBoard(req, res) {
    try {
      const { board_id } = req.params;
      const tasks = await taskService.getTasksByBoard(board_id);
      
      res.json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy tasks của column
  async getByColumn(req, res) {
    try {
      const { column_id } = req.params;
      const tasks = await taskService.getTasksByColumn(column_id);
      
      res.json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy tasks được assign cho user hiện tại
  async getMyTasks(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }

      const tasks = await taskService.getTasksByUser(userId);
      
      res.json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy tasks của user theo ID (admin hoặc chính mình)
  async getByUser(req, res) {
    try {
      const { user_id } = req.params;
      const currentUserId = req.user?.id;
      
      // Kiểm tra quyền: chỉ admin hoặc chính user đó mới xem được
      if (currentUserId !== user_id) {
        // TODO: Kiểm tra role admin ở đây nếu cần
      }

      const tasks = await taskService.getTasksByUser(user_id);
      
      res.json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Cập nhật task
  async update(req, res) {
    try {
      const { id } = req.params;
     const userId = req.user?.id;
      const updateData = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }

      const updatedTask = await taskService.updateTask(id, updateData ,userId);
      
      res.json({
        success: true,
        message: 'Cập nhật task thành công',
        data: updatedTask
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Xóa task
  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }

      await taskService.deleteTask(id, userId);
      
      res.json({
        success: true,
        message: 'Xóa task thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Kéo thả task (drag & drop) - Story 16
  async moveTask(req, res) {
  try {
    const { id } = req.params;
    const { new_column_id, new_swimlane_id, prev_task_id, next_task_id } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });

    const movedTask = await taskService.moveTask(
      id,
      new_column_id,
      prev_task_id,
      next_task_id,
      new_swimlane_id,
      userId
    );

    res.json({
      success: true,
      message: 'Di chuyển task thành công',
      data: movedTask
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}


  // Tìm kiếm tasks
  async search(req, res) {
    try {
      const { board_id } = req.params;
      const { q: searchQuery } = req.query;

      if (!searchQuery) {
        return res.status(400).json({
          success: false,
          message: 'Từ khóa tìm kiếm là bắt buộc'
        });
      }

      const tasks = await taskService.searchTasks(board_id, searchQuery);
      
      res.json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Thống kê tasks theo board
  async getStats(req, res) {
    try {
      const { board_id } = req.params;
      const stats = await taskService.getTaskStats(board_id);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Cập nhật ngày bắt đầu/kết thúc - Story 21
  async updateDates(req, res) {
    try {
      const { id } = req.params;
      const { start_date, due_date } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }

      const updatedTask = await taskService.updateTask(id, { start_date, due_date }, userId);
      
      res.json({
        success: true,
        message: 'Cập nhật ngày thành công',
        data: updatedTask
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Cập nhật thời gian ước tính - Story 22
  async updateEstimate(req, res) {
    try {
      const { id } = req.params;
      const { estimate_hours } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }

      if (estimate_hours === undefined || estimate_hours === null) {
        return res.status(400).json({
          success: false,
          message: 'estimate_hours là bắt buộc'
        });
      }

      const updatedTask = await taskService.updateTask(id, { estimate_hours }, userId);
      
      res.json({
        success: true,
        message: 'Cập nhật thời gian ước tính thành công',
        data: updatedTask
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // controllers/task.controller.js

// Lấy task theo board_id và column_id
 async getByBoardAndColumn(req, res) {
  try {
    const { board_id, column_id } = req.params;

    const tasks = await Task.find({
      board_id,
      column_id,
      deleted_at: null // nếu bạn lưu soft delete
    })
      .populate('created_by', 'username full_name')
      .populate('assigned_to', 'username full_name')
      .populate('swimlane_id', 'name')
      
tasks.sort((a, b) => {
  if (a.swimlane_id.name < b.swimlane_id.name) return -1;
  if (a.swimlane_id.name > b.swimlane_id.name) return 1;
  return a.position - b.position; // cùng swimlane thì sort theo position
});
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy task theo column trong board'
    });
  }
};

}

module.exports = new TaskController();
