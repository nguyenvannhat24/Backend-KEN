const centerRepo = require('../repositories/center.repository');

class CenterService {
  async viewAll() {
    return await centerRepo.findAll();
  }

  async getById(id) {
    return await centerRepo.findById(id);
  }

  async createCenter(data) {
    return await centerRepo.create(data);
  }

  async updateCenter(id, data) {
    return await centerRepo.update(id, data);
  }

  async deleteCenter(id) {
    return await centerRepo.delete(id);
  }
}

module.exports = new CenterService();
