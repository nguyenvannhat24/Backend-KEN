const swimlaneRepo = require('../repositories/swimlane.repository');

class SwimlaneService {
  async createSwimlane({ board_id, name, order_index }) {
    return await swimlaneRepo.create({ board_id, name, order_index });
  }

  async getSwimlane(id) {
    return await swimlaneRepo.findById(id);
  }

  async getSwimlanesByBoard(boardId) {
    return await swimlaneRepo.findAllByBoard(boardId);
  }

  async updateSwimlane(id, data) {
    return await swimlaneRepo.update(id, data);
  }

  async deleteSwimlane(id) {
    return await swimlaneRepo.delete(id);
  }
}

module.exports = new SwimlaneService();
