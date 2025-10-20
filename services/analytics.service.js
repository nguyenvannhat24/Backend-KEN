const Task = require('../models/task.model');
const Board = require('../models/board.model');
const Column = require('../models/column.model');
const mongoose = require('mongoose');

class AnalyticsService {
  /**
   * Story 49: Line Chart - Thống kê tiến độ theo thời gian
   * @param {Object} params - { board_id, start_date, end_date, granularity }
   * @returns {Object} Data cho line chart
   */
  async getLineChartData(params) {
    const { board_id, start_date, end_date, granularity = 'day' } = params;

    // Validate board_id
    if (!board_id || !mongoose.Types.ObjectId.isValid(board_id)) {
      throw new Error('Board ID không hợp lệ');
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Ngày không hợp lệ');
    }

    if (startDate >= endDate) {
      throw new Error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
    }

    // Kiểm tra board tồn tại
    const board = await Board.findById(board_id);
    if (!board) {
      throw new Error('Board không tồn tại');
    }

    // Lấy Done column của board
    const doneColumn = await Column.findOne({ 
      board_id, 
      isDone: true 
    });

    // Tạo date range theo granularity
    const dateRanges = this._generateDateRanges(startDate, endDate, granularity);

    // Lấy tasks của board
    const tasks = await Task.find({
      board_id,
      deleted_at: null
    }).populate('column_id').lean();

    // Tính toán metrics cho từng time point
    const chartData = dateRanges.map(range => {
      // Tasks đã tồn tại tại thời điểm này (created_at <= range.end)
      const tasksAtPoint = tasks.filter(task => {
        const taskCreatedAt = new Date(task.created_at);
        return taskCreatedAt <= range.end;
      });

      // Tasks đã complete tại thời điểm này
      const completedTasks = tasksAtPoint.filter(task => {
        if (!doneColumn || !task.column_id) return false;
        
        const columnId = task.column_id._id || task.column_id;
        const isDone = columnId.toString() === doneColumn._id.toString();
        if (!isDone) return false;
        
        // Task đã được move vào Done column trước hoặc tại range.end
        const updatedAt = new Date(task.updated_at);
        return updatedAt <= range.end;
      });

      // Tasks đang overdue tại thời điểm này
      const overdueTasks = tasksAtPoint.filter(task => {
        if (!task.due_date || !task.column_id) return false;
        
        const dueDate = new Date(task.due_date);
        const columnId = task.column_id._id || task.column_id;
        const isDone = doneColumn && columnId.toString() === doneColumn._id.toString();
        
        // Overdue nếu: due_date < range.end VÀ chưa complete
        return dueDate < range.end && !isDone;
      });

      const inProgressTasks = tasksAtPoint.length - completedTasks.length;

      return {
        date: range.label,
        total: tasksAtPoint.length || 0,
        completed: completedTasks.length || 0,
        overdue: overdueTasks.length || 0,
        inProgress: (inProgressTasks >= 0 ? inProgressTasks : 0)
      };
    });

    return {
      board: {
        id: board._id,
        title: board.title
      },
      dateRange: {
        start: start_date,
        end: end_date,
        granularity
      },
      data: chartData
    };
  }

  /**
   * Story 47: Dashboard tổng quan
   * @param {String} board_id 
   * @returns {Object} Dashboard statistics
   */
  async getDashboardStats(board_id) {
    if (!board_id || !mongoose.Types.ObjectId.isValid(board_id)) {
      throw new Error('Board ID không hợp lệ');
    }

    const board = await Board.findById(board_id);
    if (!board) {
      throw new Error('Board không tồn tại');
    }

    // Lấy Done column
    const doneColumn = await Column.findOne({ 
      board_id, 
      isDone: true 
    });

    // Lấy tất cả tasks
    const tasks = await Task.find({
      board_id,
      deleted_at: null
    }).populate('column_id').lean();

    const now = new Date();

    // Tính toán statistics
    const totalTasks = tasks.length;
    const completedTasks = doneColumn 
      ? tasks.filter(t => {
          if (!t.column_id) return false;
          const columnId = t.column_id._id || t.column_id;
          return columnId.toString() === doneColumn._id.toString();
        }).length 
      : 0;
    
    const overdueTasks = tasks.filter(task => {
      if (!task.due_date || !task.column_id) return false;
      const dueDate = new Date(task.due_date);
      const columnId = task.column_id._id || task.column_id;
      const isDone = doneColumn && columnId.toString() === doneColumn._id.toString();
      return dueDate < now && !isDone;
    }).length;

    const completionRate = totalTasks > 0 
      ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(2))
      : 0;

    return {
      board: {
        id: board._id,
        title: board.title
      },
      stats: {
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0,
        inProgressTasks: (totalTasks - completedTasks) || 0,
        overdueTasks: overdueTasks || 0,
        completionRate: completionRate || 0
      }
    };
  }

  /**
   * Story 48: Tỷ lệ hoàn thành theo Board/User/Center/Group
   */
  async getCompletionRate(params) {
    const { board_id, user_id, center_id, group_id } = params;

    let query = { deleted_at: null };

    if (board_id) {
      if (!mongoose.Types.ObjectId.isValid(board_id)) {
        throw new Error('Board ID không hợp lệ');
      }
      query.board_id = board_id;
    }

    if (user_id) {
      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        throw new Error('User ID không hợp lệ');
      }
      query.assigned_to = user_id;
    }

    // Lấy tasks
    const tasks = await Task.find(query).populate('column_id').lean();

    // Lấy Done column
    let doneColumn = null;
    if (board_id) {
      doneColumn = await Column.findOne({ 
        board_id, 
        isDoneColumn: true 
      });
    }

    const totalTasks = tasks.length;
    const completedTasks = doneColumn 
      ? tasks.filter(t => {
          if (!t.column_id) return false;
          const columnId = t.column_id._id || t.column_id;
          return columnId.toString() === doneColumn._id.toString();
        }).length 
      : tasks.filter(t => t.column_id && t.column_id.name && t.column_id.name.toLowerCase().includes('done')).length;

    const completionRate = totalTasks > 0 
      ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(2))
      : 0;

    return {
      totalTasks: totalTasks || 0,
      completedTasks: completedTasks || 0,
      inProgressTasks: (totalTasks - completedTasks) || 0,
      completionRate: completionRate || 0
    };
  }

  /**
   * Helper: Generate date ranges based on granularity
   */
  _generateDateRanges(startDate, endDate, granularity) {
    const ranges = [];
    let current = new Date(startDate);

    while (current <= endDate) {
      let next = new Date(current);
      let label = '';

      switch (granularity) {
        case 'day':
          next.setDate(next.getDate() + 1);
          label = current.toISOString().split('T')[0];
          break;
        case 'week':
          next.setDate(next.getDate() + 7);
          label = `Week ${this._getWeekNumber(current)}`;
          break;
        case 'month':
          next.setMonth(next.getMonth() + 1);
          label = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          next.setDate(next.getDate() + 1);
          label = current.toISOString().split('T')[0];
      }

      ranges.push({
        start: new Date(current),
        end: next > endDate ? new Date(endDate) : new Date(next),
        label
      });

      current = next;
    }

    return ranges;
  }

  /**
   * Helper: Get week number of the year
   */
  _getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }
}

module.exports = new AnalyticsService();

