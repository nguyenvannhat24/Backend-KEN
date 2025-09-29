const Swimlane = require('../models/swimlane.model');

class SwimlaneRepository {
  async create(data) {
    return await Swimlane.create(data);
  }

  async findById(id) {
    return await Swimlane.findById(id);
  }

  async findAllByBoard(boardId) {
    return await Swimlane.find({ board_id: boardId }).sort({ order_index: 1 });
  }

  async update(id, data) {
    return await Swimlane.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Swimlane.findByIdAndDelete(id);
  }
}

module.exports = new SwimlaneRepository();
