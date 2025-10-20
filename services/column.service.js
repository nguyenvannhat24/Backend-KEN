const columnRepo = require('../repositories/column.repository');

class ColumnService {
  async createColumn({ board_id, name, order, userId, isdone }) {
    if (!userId) throw new Error('Không xác thực');
    // xác minh thành viên board
    const boardRepo = require('../repositories/board.repository');
    const isMember = await boardRepo.isMember(userId, board_id);
    if (!isMember) throw new Error('Bạn không có quyền thao tác trên board này');
    return await columnRepo.create({ board_id, name, order ,isdone });
  }

  async getColumn(id, userId) {
    const col = await columnRepo.findById(id);
    if (!col) return null;
    const boardRepo = require('../repositories/board.repository');
    const isMember = await boardRepo.isMember(userId, col.board_id.toString());
    if (!isMember) throw new Error('Bạn không có quyền xem cột này');
    return col;
  }

  async getColumnsByBoard(boardId, userId ,roles = []) {
    const boardRepo = require('../repositories/board.repository');
    const isMember = await boardRepo.isMember(userId, boardId);
      if (roles.includes('admin') || roles.includes('System_Manager')) {
    return await columnRepo.findAllByBoard(boardId);
  }
    if (!isMember) throw new Error('Bạn không có quyền xem board này');
    return await columnRepo.findAllByBoard(boardId);
  }

  async updateColumn(id, data, userId) {
    const col = await columnRepo.findById(id);
    if (!col) return null;
    const boardRepo = require('../repositories/board.repository');
    const isMember = await boardRepo.isMember(userId, col.board_id.toString());
    if (!isMember) throw new Error('Bạn không có quyền thao tác trên board này');
    return await columnRepo.update(id, data);
  }

  async deleteColumn(id, userId) {
    const col = await columnRepo.findById(id);
    if (!col) return null;
    const boardRepo = require('../repositories/board.repository');
    const isMember = await boardRepo.isMember(userId, col.board_id.toString());
    if (!isMember) throw new Error('Bạn không có quyền thao tác trên board này');
    // Soft delete instead of hard delete
    return await columnRepo.softDelete(id);
  }

  // Reorder columns
  async reorderColumns(boardId, columns, userId) {
    const boardRepo = require('../repositories/board.repository');
    const isMember = await boardRepo.isMember(userId, boardId);
    if (!isMember) throw new Error('Bạn không có quyền thao tác trên board này');

    const mongoose = require('mongoose');
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const results = [];
      for (const { id, order } of columns) {
        const result = await columnRepo.update(id, { order }, session);
        if (result) results.push(result);
      }
      
      await session.commitTransaction();
      session.endSession();
      
      return results;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

 async  moveService(idUser, idBoard, data) {
  try {

    if (!idUser || !idBoard) {
      throw new Error("Thiếu thông tin người dùng hoặc bảng.");
    }

    const arrayData = Array.isArray(data)
      ? data
      : Array.isArray(data?.ids)
      ? data.ids
      : [];

    if (arrayData.length === 0) {
      throw new Error("Không có dữ liệu để cập nhật thứ tự cột.");
    }

    for (let i = 0; i < arrayData.length; i++) {
      const columnId = arrayData[i];
      if (!columnId) continue;

      await columnRepo.update(columnId, { order: i + 1 }); 
    }

    return {
      success: true,
      message: `Đã cập nhật thứ tự ${arrayData.length} cột cho board ${idBoard}.`,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
async updateIsDone(idColumn, idBoard, idUser) {
  const boardRepo = require('../repositories/board.repository');
  const columnRepo = require('../repositories/column.repository');
  const Column = require('../models/column.model');

  try {
    // 1️⃣ Kiểm tra column tồn tại
    const col = await columnRepo.findById(idColumn);
    if (!col) throw new Error('Không tìm thấy column');

    // 2️⃣ Kiểm tra user có phải là member của board không
    const isMember = await boardRepo.isMember(idUser, idBoard);
    if (!isMember) throw new Error('Bạn không có quyền thao tác trên board này');

    // 3️⃣ Bỏ trạng thái Done của các cột khác trong cùng board
    await columnRepo.updateMany(
      { board_id: idBoard, _id: { $ne: idColumn } },
      { isDone: false }
    );

    // 4️⃣ Đặt cột hiện tại là Done
    const updated = await columnRepo.update(idColumn, { isDone: true });

    return updated;
  } catch (error) {
    console.error('❌ Lỗi updateIsDone:', error.message);
    throw error;
  }
}

  
}

module.exports = new ColumnService();
