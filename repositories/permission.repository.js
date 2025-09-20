const PermissionModel = require('../models/permission.model');

class PermissionRepository {
  // Lấy tất cả permissions
  async findAll() {
    return await PermissionModel.find();
  }

  // Tìm 1 permission theo ID
  async findById(id) {
    return await PermissionModel.findById(id);
  }

  // Tìm 1 permission theo code
  async findByCode(code) {
    return await PermissionModel.findOne({ code });
  }

  // Tạo mới permission
  async create(permissionData) {
    const permission = new PermissionModel(permissionData);
    return await permission.save();
  }

  // Cập nhật permission theo ID
  async update(id, updateData) {
    return await PermissionModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  // Xóa permission theo ID
  async delete(id) {
    return await PermissionModel.findByIdAndDelete(id);
  }
}

module.exports = new PermissionRepository();
