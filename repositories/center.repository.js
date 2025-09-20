const Center = require('../models/center.model');

class CenterRepository {
  async findAll() {
    return Center.find().lean();
  }

  async findById(id) {
    return Center.findById(id).lean();
  }

  async create(centerData) {
    return Center.create(centerData);
  }

  async update(id, updateData) {
    return Center.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }

  async delete(id) {
    return Center.findByIdAndDelete(id).lean();
  }
}

module.exports = new CenterRepository();
