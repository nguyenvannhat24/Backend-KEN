const mongoose = require("mongoose");
const templateColumnRepository = require("../repositories/templateColumn.repository");

class TemplateColumnService {
  async createColumn(data) {
    if (!mongoose.Types.ObjectId.isValid(data.template_id)) {
      throw new Error("Invalid template_id");
    }

    // kiểm tra trùng tên trong cùng 1 template
    const exists = await templateColumnRepository.findByName(data.template_id, data.name);
    if (exists) {
      throw new Error("Tên cột đã tồn tại trong template này");
    }

    return await templateColumnRepository.create(data);
  }

  async getColumns() {
    return await templateColumnRepository.findAll();
  }

  async getColumnById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid id");
    }
    return await templateColumnRepository.findById(id);
  }

  async getColumnsByTemplate(templateId) {
    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      throw new Error("Invalid templateId");
    }
    return await templateColumnRepository.findByTemplate(templateId);
  }

  async updateColumn(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid id");
    }
    return await templateColumnRepository.update(id, data);
  }

  async deleteColumn(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid id");
    }
    return await templateColumnRepository.delete(id);
  }
}

module.exports = new TemplateColumnService();
