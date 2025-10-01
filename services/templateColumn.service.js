const mongoose = require('mongoose');
const TemplateColumn = require('../models/templateColumn.model');

class TemplateColumnService {
  async list(template_id) {
    if (!mongoose.Types.ObjectId.isValid(template_id)) throw new Error('template_id không hợp lệ');
    return TemplateColumn.find({ template_id }).sort({ order_index: 1 }).lean();
  }

  async create(template_id, { name, order_index }) {
    if (!mongoose.Types.ObjectId.isValid(template_id)) throw new Error('template_id không hợp lệ');
    if (!name || !name.trim()) throw new Error('name là bắt buộc');
    const doc = await TemplateColumn.create({ template_id, name: name.trim(), order_index: Number(order_index) || 0 });
    return doc;
  }

  async update(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('id không hợp lệ');
    const update = {};
    if (typeof data.name === 'string') update.name = data.name.trim();
    if (data.order_index !== undefined) update.order_index = Number(data.order_index) || 0;
    const doc = await TemplateColumn.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!doc) throw new Error('Không tìm thấy TemplateColumn');
    return doc;
  }

  async remove(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('id không hợp lệ');
    const res = await TemplateColumn.findByIdAndDelete(id).lean();
    if (!res) throw new Error('Không tìm thấy TemplateColumn');
    return true;
  }
}

module.exports = new TemplateColumnService();