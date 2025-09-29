const columnRepo = require('../repositories/column.repository');

class ColumnService {
  async createColumn({ board_id, name, order_index }) {
    return await columnRepo.create({ board_id, name, order_index });
  }

  async getColumn(id) {
    return await columnRepo.findById(id);
  }

  async getColumnsByBoard(boardId) {
    return await columnRepo.findAllByBoard(boardId);
  }

  async updateColumn(id, data) {
    return await columnRepo.update(id, data);
  }

  async deleteColumn(id) {
    return await columnRepo.delete(id);
  }
  
}

module.exports = new ColumnService();
