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
    // Soft delete instead of hard delete
    return await centerRepo.softDelete(id);
  }

  async getAllCentersWithDeleted(options = {}) {
    try {
      const result = await centerRepo.findAllWithDeleted(options);
      return result;
    } catch (error) {
      console.error('Error in getAllCentersWithDeleted:', error);
      throw error;
    }
  }
}

module.exports = new CenterService();
