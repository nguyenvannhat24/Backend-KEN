const RolePermissionModel = require('../models/rolePermission.model');

class RolePermissionRepository {
  async getAll() {
    return RolePermissionModel.find()
      .populate('role_id')         // load thông tin Role
      .populate('permission_id');  // load thông tin Permission
  }

  async create(data) {
    const rp = new RolePermissionModel(data);
    return rp.save();
  }

  async getById(id) {
    return RolePermissionModel.findById(id)
      .populate('role_id')
      .populate('permission_id');
  }

  async update(id, data) {
    return RolePermissionModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return RolePermissionModel.findByIdAndDelete(id);
  }
}

module.exports = new RolePermissionRepository();
