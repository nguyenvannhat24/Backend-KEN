const taskRepo = require('../repositories/task.repository');
const boardRepo = require('../repositories/board.repository');
const columnRepo = require('../repositories/column.repository');
const swimlaneRepo = require('../repositories/swimlane.repository');
const mongoose = require('mongoose');

class TaskService {
  // Tạo task mới
  async createTask(taskData, userId) {
    try {
      // Validate required fields
      if (!taskData.board_id) throw new Error('board_id là bắt buộc');
      if (!taskData.column_id) throw new Error('column_id là bắt buộc');
      if (!taskData.title) throw new Error('title là bắt buộc');

      // Validate ObjectIds
      if (!mongoose.Types.ObjectId.isValid(taskData.board_id)) {
        throw new Error('board_id không hợp lệ');
      }
      if (!mongoose.Types.ObjectId.isValid(taskData.column_id)) {
        throw new Error('column_id không hợp lệ');
      }
      if (taskData.swimlane_id && !mongoose.Types.ObjectId.isValid(taskData.swimlane_id)) {
        throw new Error('swimlane_id không hợp lệ');
      }
      if (taskData.assigned_to && !mongoose.Types.ObjectId.isValid(taskData.assigned_to)) {
        throw new Error('assigned_to không hợp lệ');
      }

      // Kiểm tra board tồn tại
      const board = await boardRepo.findById(taskData.board_id);
      if (!board) throw new Error('Board không tồn tại');

      // Kiểm tra user là thành viên của board
      const isMember = await boardRepo.isMember(userId, taskData.board_id);
      if (!isMember) throw new Error('Bạn không có quyền thao tác trên board này');
      
      // kiểm tra user có quyền trong board hoặc là người tạo hoặc là thành viên
      const isRoleMember = await boardRepo.isRoleMember(userId, taskData.board_id);
      const isCreatorFromMember = await boardRepo.isCreatorFromMember(userId, taskData.board_id);

      if(!isRoleMember && !isCreatorFromMember )throw new Error('Bạn không có quyền thao tác trên board này');

      // Kiểm tra column thuộc board
      const column = await columnRepo.findById(taskData.column_id);
      if (!column || column.board_id.toString() !== taskData.board_id) {
        throw new Error('Column không thuộc board này');
      }

      // Kiểm tra swimlane nếu có
      if (taskData.swimlane_id) {
        const swimlane = await swimlaneRepo.findById(taskData.swimlane_id);
        if (!swimlane || swimlane.board_id.toString() !== taskData.board_id) {
          throw new Error('Swimlane không thuộc board này');
        }
      }

      // Validate dates
      if (taskData.start_date && taskData.due_date) {
        const startDate = new Date(taskData.start_date);
        const dueDate = new Date(taskData.due_date);
        if (startDate >= dueDate) {
          throw new Error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
        }
      }

      // Validate estimate_hours
      if (taskData.estimate_hours && taskData.estimate_hours < 0) {
        throw new Error('Thời gian ước tính phải lớn hơn 0');
      }
let position = 0;
const tasksInColumn = await taskRepo.findByColumn(taskData.column_id);
if (tasksInColumn.length > 0) {
  const lastTask = tasksInColumn[tasksInColumn.length - 1];
  position = lastTask.position + 10;
}
      // Tạo task
      const newTaskData = {
        ...taskData,
        position,
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date()
      };

      return await taskRepo.create(newTaskData);
    } catch (error) {
      throw new Error(`Lỗi tạo task: ${error.message}`);
    }
  }

  // Lấy task theo ID
  async getTaskById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Task ID không hợp lệ');
    }

    const task = await taskRepo.findById(id);
    if (!task) throw new Error('Task không tồn tại');
    
    return task;
  }

  // Lấy tasks của board
  async getTasksByBoard(board_id) {
    if (!mongoose.Types.ObjectId.isValid(board_id)) {
      throw new Error('Board ID không hợp lệ');
    }

    return await taskRepo.findByBoard(board_id);
  }

  // Lấy tasks của column
  async getTasksByColumn(column_id) {
    if (!mongoose.Types.ObjectId.isValid(column_id)) {
      throw new Error('Column ID không hợp lệ');
    }

    return await taskRepo.findByColumn(column_id);
  }

  // Lấy tasks của user (assigned)
  async getTasksByUser(user_id) {
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new Error('User ID không hợp lệ');
    }

    return await taskRepo.findByAssignedUser(user_id);
  }

  // Cập nhật task
  async updateTask(id, updateData, userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Task ID không hợp lệ');
      }

      // Kiểm tra task tồn tại
      const existingTask = await taskRepo.findById(id);
      if (!existingTask) throw new Error('Task không tồn tại');

      //Kiểm tra user là thành viên của board
      const isMember = await boardRepo.isMember(userId, existingTask.board_id._id?.toString?.() || existingTask.board_id.toString());
      if (!isMember) throw new Error('Bạn không có quyền thao tác trên board này');

      // Validate nếu thay đổi column
      if (updateData.column_id) {
        if (!mongoose.Types.ObjectId.isValid(updateData.column_id)) {
          throw new Error('column_id không hợp lệ');
        }
        
        const column = await columnRepo.findById(updateData.column_id);
        if (!column || column.board_id.toString() !== existingTask.board_id.toString()) {
          throw new Error('Column không thuộc board này');
        }
      }

      // Validate nếu thay đổi swimlane
      if (updateData.swimlane_id) {
        if (!mongoose.Types.ObjectId.isValid(updateData.swimlane_id)) {
          throw new Error('swimlane_id không hợp lệ');
        }
        
        const swimlane = await swimlaneRepo.findById(updateData.swimlane_id);
        if (!swimlane || swimlane.board_id.toString() !== existingTask.board_id.toString()) {
          throw new Error('Swimlane không thuộc board này');
        }
      }

      // Validate dates
      if (updateData.start_date || updateData.due_date) {
        const startDate = updateData.start_date ? new Date(updateData.start_date) : new Date(existingTask.start_date);
        const dueDate = updateData.due_date ? new Date(updateData.due_date) : new Date(existingTask.due_date);
        
        if (startDate && dueDate && startDate >= dueDate) {
          throw new Error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
        }
      }

      // Validate estimate_hours
      if (updateData.estimate_hours !== undefined && updateData.estimate_hours < 0) {
        throw new Error('Thời gian ước tính phải lớn hơn 0');
      }

      return await taskRepo.update(id, updateData);
    } catch (error) {
      throw new Error(`Lỗi cập nhật task: ${error.message}`);
    }
  }

  // Xóa task
 // Xóa task
  async deleteTask(id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Task ID không hợp lệ');
    }

    const task = await taskRepo.findById(id);
    if (!task) throw new Error('Task không tồn tại');

    // Convert userId to string for comparison
    const userIdStr = userId?.toString();

    // Kiểm tra user là thành viên của board
    const isMember = await boardRepo.isMember(userId, task.board_id._id?.toString?.() || task.board_id.toString());
    if (!isMember) throw new Error('Bạn không có quyền thao tác trên board này');

    // Chỉ cho phép creator hoặc assigned user xóa
    const createdById = task.created_by?._id?.toString() || task.created_by?.toString();
    const assignedToId = task.assigned_to?._id?.toString() || task.assigned_to?.toString();
    
    if (createdById !== userIdStr && (!assignedToId || assignedToId !== userIdStr)) {
      throw new Error('Bạn không có quyền xóa task này');
    }

    // Soft delete instead of hard delete
    return await taskRepo.softDelete(id);
  }

  // Kéo thả task (drag & drop)
  

  // Tìm kiếm tasks
  async searchTasks(board_id, searchQuery) {
    if (!mongoose.Types.ObjectId.isValid(board_id)) {
      throw new Error('Board ID không hợp lệ');
    }
    
    if (!searchQuery || searchQuery.trim().length < 2) {
      throw new Error('Từ khóa tìm kiếm phải có ít nhất 2 ký tự');
    }

    return await taskRepo.search(board_id, searchQuery.trim());
  }

  // Thống kê tasks theo board
  async getTaskStats(board_id) {
    if (!mongoose.Types.ObjectId.isValid(board_id)) {
      throw new Error('Board ID không hợp lệ');
    }

    const stats = await taskRepo.countByBoard(board_id);
    const allTasks = await taskRepo.findByBoard(board_id);
    
    return {
      total_tasks: allTasks.length,
      by_column: stats,
      overdue_tasks: allTasks.filter(task => 
        task.due_date && new Date(task.due_date) < new Date()
      ).length,
      completed_tasks: allTasks.filter(task => 
        task.column_id.name && task.column_id.name.toLowerCase().includes('done')
      ).length
    };
  }
async moveTask(
  task_id,
  new_column_id,
  prev_task_id = null,
  next_task_id = null,
  new_swimlane_id = null,
  userId
) {
  try {
    // ====== Kiểm tra ID hợp lệ ======
    if (!mongoose.Types.ObjectId.isValid(task_id))
      throw new Error("Task ID không hợp lệ");
    if (!mongoose.Types.ObjectId.isValid(new_column_id))
      throw new Error("Column ID không hợp lệ");

    const task = await taskRepo.findById(task_id);
    if (!task) throw new Error("Task không tồn tại");

    // ====== Kiểm tra column đích thuộc cùng board ======
    const newColumn = await columnRepo.findById(new_column_id);
    if (
      !newColumn ||
      newColumn.board_id.toString() !== task.board_id._id.toString()
    ) {
      throw new Error("Column không thuộc board này");
    }

    // ====== Kiểm tra swimlane (nếu có) ======
    if (new_swimlane_id) {
      if (!mongoose.Types.ObjectId.isValid(new_swimlane_id))
        throw new Error("Swimlane ID không hợp lệ");

      const newSwimlane = await swimlaneRepo.findById(new_swimlane_id);
      if (
        !newSwimlane ||
        newSwimlane.board_id.toString() !== task.board_id._id.toString()
      ) {
        throw new Error("Swimlane không thuộc board này");
      }
    }

    // ====== Lấy prev/next task (nếu có) ======
    const [prevTask, nextTask] = await Promise.all([
      prev_task_id ? taskRepo.findById(prev_task_id) : null,
      next_task_id ? taskRepo.findById(next_task_id) : null,
    ]);

    // ====== Xác định column/swimlane hiện tại ======
    const isSameColumn =
      task.column_id.toString() === new_column_id.toString() &&
      ((task.swimlane_id || null)?.toString() ===
        (new_swimlane_id || null)?.toString());

    // ====== Lấy tất cả task trong column/swimlane đích ======
    const tasksInTarget = await taskRepo.findByColumnAndSwimlane(
      new_column_id,
      new_swimlane_id
    );

    // ====== Tính position mới ======
    let newPosition;

    if (tasksInTarget.length === 0) {
      // Column rỗng
      newPosition = 10;
    } else if (!prevTask && nextTask) {
      // Kéo lên đầu
      newPosition = nextTask.position / 2;
    } else if (prevTask && !nextTask) {
      // Kéo xuống cuối
      newPosition = prevTask.position + 10;
    } else if (prevTask && nextTask) {
      // Kéo vào giữa
      newPosition = (prevTask.position + nextTask.position) / 2;
    } else {
      // Không xác định được thì mặc định cộng 10 vào cuối
      newPosition = tasksInTarget[tasksInTarget.length - 1].position + 10;
    }

    // ====== Cập nhật task ======
    const updateData = {
      position: newPosition,
      updated_at: Date.now(),
    };

    if (!isSameColumn) {
      // Nếu di chuyển sang column/swimlane khác
      updateData.column_id = new_column_id;
      if (new_swimlane_id) updateData.swimlane_id = new_swimlane_id;
    }

    const movedTask = await taskRepo.update(task_id, updateData);

    // ====== Reorder lại position nếu bị trùng hoặc quá sát ======
    const needReorder =
      !prevTask ||
      !nextTask ||
      Math.abs(
        (prevTask?.position || 0) - (nextTask?.position || newPosition)
      ) < 1;

    if (needReorder) {
      await taskRepo.reorderColumnTasks(new_column_id, new_swimlane_id);
      if (!isSameColumn) {
        // Reorder cả column cũ nếu chuyển cột
        await taskRepo.reorderColumnTasks(task.column_id, task.swimlane_id);
      }
    }

    return { success: true, data: movedTask };
  } catch (error) {
    throw new Error(`Lỗi di chuyển task: ${error.message}`);
  }
}



}

module.exports = new TaskService();
