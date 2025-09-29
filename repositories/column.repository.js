const Column = require('../models/column.model');

class ColumnRepository {
  async create(data) {
    return await Column.create(data);
  }

  async findById(id) {
    return await Column.findById(id);
  }

  async findAllByBoard(boardId) {
    return await Column.find({ board_id: boardId }).sort({ order_index: 1 });
  }

  async update(id, data) {
    return await Column.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Column.findByIdAndDelete(id);
  }
  
    async insertMany(dataArray) {
    return await Column.insertMany(dataArray);
  }

}

module.exports = new ColumnRepository();
