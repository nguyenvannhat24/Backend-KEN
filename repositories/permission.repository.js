// repositories/permission.repository.js
const Permission = require('../models/Permission.model');

class PermissionRepository {
  async create(data) {
    return await Permission.create(data);
  }

  async findAll() {
    return await Permission.find();
  }

  async findById(id) {
    return await Permission.findById(id);
  }

  async findByCode(code) {
    return await Permission.findOne({ code });
  }

  async update(id, data) {
    return await Permission.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Permission.findByIdAndDelete(id);
  }

    async findByIds(ids) {
    return await Permission.find({ _id: { $in: ids } });
  }
}

module.exports = new PermissionRepository();
