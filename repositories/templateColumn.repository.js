const TemplateColumn = require('../models/templateColumn.model');

class TemplateColumnRepository {
  async create(data) {
    return await TemplateColumn.create(data);
  }

  async findAllByTemplate(templateId) {
    return await TemplateColumn.find({ template_id: templateId }).sort({ order_index: 1 });
  }

  async findById(id) {
    return await TemplateColumn.findById(id).populate('template_id', 'name');
  }

  async update(id, data) {
    return await TemplateColumn.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await TemplateColumn.findByIdAndDelete(id);
  }

async findByName(templateId, name) {
  return await TemplateColumn.findOne({
    template_id: templateId,
    name: name
  });
}


}

module.exports = new TemplateColumnRepository();
