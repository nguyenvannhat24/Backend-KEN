const TemplateSwimlane = require('../models/templateSwimlane.model');

class TemplateSwimlaneRepository {
  async create(data) {
    return await TemplateSwimlane.create(data);
  }

  async findAll() {
    return await TemplateSwimlane.find().lean();
  }

  async findById(id) {
    return await TemplateSwimlane.findById(id).lean();
  }

  async findByTemplate(templateId) {
    return await TemplateSwimlane.find({ template_id: templateId }).lean();
  }

  async findByName(templateId, name) {
    return await TemplateSwimlane.findOne({ template_id: templateId, name }).lean();
  }

  async update(id, data) {
    return await TemplateSwimlane.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id) {
    return await TemplateSwimlane.findByIdAndDelete(id).lean();
  }

    async findByTemplateId(templateId) {
      return await TemplateSwimlane.find({ template_id: templateId }).lean();
    }
}

module.exports = new TemplateSwimlaneRepository();
