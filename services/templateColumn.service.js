const mongoose = require('mongoose');
const templateColumnRepository = require('../repositories/templateColumn.repository');

class TemplateColumnService {
async createColumn(data) {
  if (!mongoose.Types.ObjectId.isValid(data.template_id)) {
    throw new Error("Invalid template_id");
  }

  // kiểm tra trùng tên trong cùng template
  const check = await templateColumnRepository.findByName(data.template_id, data.name);
  if (check) {
    throw new Error("Tên cột đã tồn tại trong template này");
  }

  return await templateColumnRepository.create(data);
}


  async getColumnsByTemplate(templateId) {
    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      throw new Error("Invalid template id");
    }
    return await templateColumnRepository.findAllByTemplate(templateId);
  }

  async getColumnById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid column id");
    }
    return await templateColumnRepository.findById(id);
  }

  async updateColumn(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid column id");
    }
    return await templateColumnRepository.update(id, data);
  }

  async deleteColumn(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid column id");
    }
    return await templateColumnRepository.delete(id);
  }
}

module.exports = new TemplateColumnService();
