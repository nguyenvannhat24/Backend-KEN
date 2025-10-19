const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const taskRepo = require('../repositories/task.repository');
const boardRepo = require('../repositories/board.repository');
const columnRepo = require('../repositories/column.repository');
const mongoose = require('mongoose');

class ImportService {
  // Import tasks từ file
  async importTasksFromFile(filePath, { board_id, column_id, user_id }) {
    try {
      // Validate input
      if (!mongoose.Types.ObjectId.isValid(board_id)) {
        throw new Error('board_id không hợp lệ');
      }
      if (!mongoose.Types.ObjectId.isValid(column_id)) {
        throw new Error('column_id không hợp lệ');
      }

      // Kiểm tra board tồn tại
      const board = await boardRepo.findById(board_id);
      if (!board) {
        throw new Error('Board không tồn tại');
      }

      // Kiểm tra column tồn tại và thuộc board
      const column = await columnRepo.findById(column_id);
      if (!column || column.board_id.toString() !== board_id) {
        throw new Error('Column không tồn tại hoặc không thuộc board này');
      }

      // Đọc file dựa trên extension
      const fileExt = path.extname(filePath).toLowerCase();
      let tasks = [];

      if (fileExt === '.csv') {
        tasks = await this.parseCSVFile(filePath);
      } else if (fileExt === '.xlsx' || fileExt === '.xls') {
        tasks = await this.parseExcelFile(filePath);
      } else {
        throw new Error('Định dạng file không được hỗ trợ');
      }

      // Validate và tạo tasks
      const result = await this.createTasksFromData(tasks, { board_id, column_id, user_id });

      // Cleanup file
      fs.unlinkSync(filePath);

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Parse CSV file
  async parseCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  // Parse Excel file
  async parseExcelFile(filePath) {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      return jsonData;
    } catch (error) {
      throw new Error('Không thể đọc file Excel: ' + error.message);
    }
  }

  // Tạo tasks từ data
  async createTasksFromData(tasksData, { board_id, column_id, user_id }) {
    const result = {
      totalRows: tasksData.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
      tasks: []
    };

    for (let i = 0; i < tasksData.length; i++) {
      try {
        const row = tasksData[i];
        const taskData = this.validateAndMapTaskData(row, { board_id, column_id, user_id });
        
        const task = await taskRepo.create(taskData);
        result.tasks.push(task);
        result.successCount++;
      } catch (error) {
        result.errorCount++;
        result.errors.push({
          row: i + 1,
          error: error.message,
          data: tasksData[i]
        });
      }
    }

    return result;
  }

  // Validate và map task data
  validateAndMapTaskData(row, { board_id, column_id, user_id }) {
    const requiredFields = ['title'];
    const taskData = {
      board_id,
      column_id,
      created_by: user_id
    };

    // Validate required fields
    for (const field of requiredFields) {
      if (!row[field] || row[field].toString().trim() === '') {
        throw new Error(`Trường ${field} là bắt buộc`);
      }
    }

    // Map fields
    taskData.title = row.title.toString().trim();
    taskData.description = row.description ? row.description.toString().trim() : '';
    taskData.priority = row.priority ? row.priority.toString().trim() : 'medium';
    taskData.assigned_to = row.assigned_to ? row.assigned_to.toString().trim() : null;

    // Parse dates
    if (row.start_date) {
      const startDate = new Date(row.start_date);
      if (!isNaN(startDate.getTime())) {
        taskData.start_date = startDate;
      }
    }

    if (row.due_date) {
      const dueDate = new Date(row.due_date);
      if (!isNaN(dueDate.getTime())) {
        taskData.due_date = dueDate;
      }
    }

    // Parse estimate hours
    if (row.estimate_hours) {
      const hours = parseFloat(row.estimate_hours);
      if (!isNaN(hours) && hours >= 0) {
        taskData.estimate_hours = hours;
      }
    }

    return taskData;
  }

  // Tạo template file mẫu
  async generateTemplateFile() {
    try {
      const templateData = [
        {
          title: 'Task 1',
          description: 'Mô tả task 1',
          priority: 'high',
          start_date: '2024-01-01',
          due_date: '2024-01-15',
          estimate_hours: '8',
          assigned_to: 'user@example.com'
        },
        {
          title: 'Task 2',
          description: 'Mô tả task 2',
          priority: 'medium',
          start_date: '2024-01-02',
          due_date: '2024-01-20',
          estimate_hours: '16',
          assigned_to: 'user2@example.com'
        }
      ];

      const csvContent = this.convertToCSV(templateData);
      const templatePath = path.join(__dirname, '../uploads/template.csv');
      
      // Đảm bảo thư mục tồn tại
      const uploadDir = path.dirname(templatePath);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      fs.writeFileSync(templatePath, csvContent);
      return templatePath;
    } catch (error) {
      throw error;
    }
  }

  // Convert data to CSV
  convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header] || '';
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }

  // Lấy lịch sử import
  async getImportHistory(userId) {
    try {
      // Tìm các task được tạo bởi user trong 30 ngày qua
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const tasks = await taskRepo.findByUserAndDateRange(userId, thirtyDaysAgo);
      
      // Group by date
      const history = {};
      tasks.forEach(task => {
        const date = task.created_at.toISOString().split('T')[0];
        if (!history[date]) {
          history[date] = [];
        }
        history[date].push(task);
      });

      return history;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ImportService();
