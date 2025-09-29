const TemplateColumn = require('../models/templateColumn.model');

class TemplateColumnRepository {
  async create(data) {
    return await TemplateColumn.create(data);
  }

  async findAll() {
    return await TemplateColumn.find().lean();
  }

  async findById(id) {
    return await TemplateColumn.findById(id).lean();
  }

  async findByTemplate(templateId) {
    return await TemplateColumn.find({ template_id: templateId }).lean();
  }

  async findByName(templateId, name) {
    return await TemplateColumn.findOne({ template_id: templateId, name }).lean();
  }

  async update(id, data) {
    return await TemplateColumn.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id) {
    return await TemplateColumn.findByIdAndDelete(id).lean();
  }

  async findByTemplateId(templateId) {
    return await TemplateColumn.find({ template_id: templateId }).lean();
  }
}

module.exports = new TemplateColumnRepository();
