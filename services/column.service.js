const columnRepo = require('../repositories/column.repository');

class ColumnService {
  async createColumn({ board_id, name, order, userId }) {
    if (!userId) throw new Error('Không xác thực');
    // xác minh thành viên board
    const boardRepo = require('../repositories/board.repository');
    const isMember = await boardRepo.isMember(userId, board_id);
    if (!isMember) throw new Error('Bạn không có quyền thao tác trên board này');
    return await columnRepo.create({ board_id, name, order });
  }

  async getColumn(id, userId) {
    const col = await columnRepo.findById(id);
    if (!col) return null;
    const boardRepo = require('../repositories/board.repository');
    const isMember = await boardRepo.isMember(userId, col.board_id.toString());
    if (!isMember) throw new Error('Bạn không có quyền xem cột này');
    return col;
  }

  async getColumnsByBoard(boardId, userId) {
    const boardRepo = require('../repositories/board.repository');
    const isMember = await boardRepo.isMember(userId, boardId);
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
}

module.exports = new ColumnService();
