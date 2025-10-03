const Swimlane = require('../models/swimlane.model');

class SwimlaneRepository {
  async create(data) {
    return await Swimlane.create(data);
  }

  async findById(id) {
    return await Swimlane.findById(id);
  }

  async findAllByBoard(boardId) {
    return await Swimlane.find({ board_id: boardId }).sort({ order: 1 });
  }

  async update(id, data, session = null) {
    const options = { new: true };
    if (session) options.session = session;
    return await Swimlane.findByIdAndUpdate(id, data, options);
  }

  async delete(id) {
    return await Swimlane.findByIdAndDelete(id);
  }

 async insertMany(dataArray, session = null) {
    if (session) {
      return await Swimlane.insertMany(dataArray, { session });
    }
    return await Swimlane.insertMany(dataArray);
  }

  async deleteManyByBoard(boardId, session = null) {
    const query = Swimlane.deleteMany({ board_id: boardId });
    return session ? query.session(session) : query;
  }
}

module.exports = new SwimlaneRepository();
