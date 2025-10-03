const Column = require('../models/column.model');

class ColumnRepository {
  async create(data) {
    return await Column.create(data);
  }

  async findById(id) {
    return await Column.findById(id);
  }

  async findAllByBoard(boardId) {
    return await Column.find({ board_id: boardId }).sort({ order: 1 });
  }

  async update(id, data, session = null) {
    const options = { new: true };
    if (session) options.session = session;
    return await Column.findByIdAndUpdate(id, data, options);
  }

  async delete(id) {
    return await Column.findByIdAndDelete(id);
  }
  
  async insertMany(dataArray, session = null) {
    if (session) {
      return await Column.insertMany(dataArray, { session });
    }
    return await Column.insertMany(dataArray);
  }

  async deleteManyByBoard(boardId, session = null) {
    const query = Column.deleteMany({ board_id: boardId });
    return session ? query.session(session) : query;
  }

}

module.exports = new ColumnRepository();
