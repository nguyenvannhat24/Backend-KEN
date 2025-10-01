const columnRepo = require('../repositories/column.repository');

class ColumnService {
  async createColumn({ board_id, name, order_index, userId }) {
    if (!userId) throw new Error('Không xác thực');
    // xác minh thành viên board
    const boardRepo = require('../repositories/board.repository');
    const isMember = await boardRepo.isMember(userId, board_id);
    if (!isMember) throw new Error('Bạn không có quyền thao tác trên board này');
    return await columnRepo.create({ board_id, name, order_index });
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
    return await columnRepo.delete(id);
  }
  
}

module.exports = new ColumnService();
