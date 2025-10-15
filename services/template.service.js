const mongoose = require('mongoose');
const Template = require('../models/template.model');
const templateRepo = require('../repositories/template.repository');
const roleRepository = require('../repositories/role.repository');
const userRoleRepo = require('../repositories/userRole.repository');
class TemplateService {
  async createTemplate({ name, description, userId }) {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('userId không hợp lệ');
    }
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Tên template là bắt buộc');
    }
    const doc = await Template.create({ name: name.trim(), description, created_by: userId });
    return doc;
  }

async listTemplates(id_user) {
  // 1️⃣ Lấy role admin
  const adminRole = await roleRepository.findByName("admin");
  if (!adminRole) throw new Error("Không tìm thấy role admin");

 const adminRoleId = adminRole._id;

  // 2️⃣ Lấy danh sách user có role admin
  const adminUsers = await userRoleRepo.findUserByIdRole(adminRoleId);
  const adminIds = adminUsers.map(u => u.user_id); // mảng các _id admin

  // 3️⃣ Lấy template do user hiện tại hoặc admin tạo
  const templates = await Template.find({
    created_by: { $in: [id_user, ...adminIds] }
  }).lean();

  return templates;
}


  async getTemplateById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('ID không hợp lệ');
    const tpl = await Template.findById(id).lean();
    if (!tpl) throw new Error('Template không tồn tại');
    return tpl;
  }
// Kiểm tra quyền update/delete: creator hoặc admin/system
  checkPermission(template, user) {
    const allowedRoles = ['Admin', 'System_Manager'];
    const isCreator = template.created_by.toString() === user.id.toString();
    const hasRole = user.roles.some(r => allowedRoles.includes(r));
    if (!isCreator && !hasRole) {
      throw new Error('Không có quyền thực hiện thao tác này');
    }
  }
  async updateTemplate(id, data, user) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('ID không hợp lệ');

    const tpl = await Template.findById(id).lean();
    if (!tpl) throw new Error('Template không tồn tại');

    this.checkPermission(tpl, user);

    const update = {};
    if (typeof data.name === 'string' && data.name.trim() !== '') update.name = data.name.trim();
    if (typeof data.description === 'string') update.description = data.description;
    update.updated_at = new Date();

    const updated = await Template.findByIdAndUpdate(id, update, { new: true }).lean();
    return updated;
  }

  async deleteTemplate(id, user) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('ID không hợp lệ');

    const tpl = await Template.findById(id).lean();
    if (!tpl) throw new Error('Template không tồn tại');

    this.checkPermission(tpl, user);

    await templateRepo.softDelete(id);
    return true;
  }

 
}

module.exports = new TemplateService();