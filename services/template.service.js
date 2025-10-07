const mongoose = require('mongoose');
const Template = require('../models/template.model');

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

  async listTemplates() {
    return Template.find().lean();
  }

  async getTemplateById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('ID không hợp lệ');
    const tpl = await Template.findById(id).lean();
    if (!tpl) throw new Error('Template không tồn tại');
    return tpl;
  }

  async updateTemplate(id, data, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('ID không hợp lệ');
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error('userId không hợp lệ');

    const tpl = await Template.findById(id).lean();
    if (!tpl) throw new Error('Template không tồn tại');
    if (String(tpl.created_by) !== String(userId)) throw new Error('Chỉ creator được cập nhật template');

    const update = {};
    if (typeof data.name === 'string' && data.name.trim() !== '') update.name = data.name.trim();
    if (typeof data.description === 'string') update.description = data.description;
    update.updated_at = new Date();

    const updated = await Template.findByIdAndUpdate(id, update, { new: true }).lean();
    return updated;
  }

  async deleteTemplate(id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('ID không hợp lệ');
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error('userId không hợp lệ');

    const tpl = await Template.findById(id).lean();
    if (!tpl) throw new Error('Template không tồn tại');
    if (String(tpl.created_by) !== String(userId)) throw new Error('Chỉ creator được xóa template');

    // Soft delete instead of hard delete
    await templateRepo.softDelete(id);
    return true;
  }

  async getAllTemplatesWithDeleted(options = {}) {
    try {
      const result = await templateRepo.findAllWithDeleted(options);
      return result;
    } catch (error) {
      console.error('Error in getAllTemplatesWithDeleted:', error);
      throw error;
    }
  }
}

module.exports = new TemplateService();