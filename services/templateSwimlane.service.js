const mongoose = require("mongoose");
const templateSwimlaneRepository = require("../repositories/templateSwimlane.repository");

class TemplateSwimlaneService {
  async createSwimlane(data) {
    if (!mongoose.Types.ObjectId.isValid(data.template_id)) {
      throw new Error("Invalid template_id");
    }

    // kiểm tra trùng tên trong cùng 1 template
    const exists = await templateSwimlaneRepository.findByName(data.template_id, data.name);
    if (exists) {
      throw new Error("Tên swimlane đã tồn tại trong template này");
    }

    return await templateSwimlaneRepository.create(data);
  }

  async getSwimlanes() {
    return await templateSwimlaneRepository.findAll();
  }

  async getSwimlaneById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid id");
    }
    return await templateSwimlaneRepository.findById(id);
  }

  async getSwimlanesByTemplate(templateId) {
    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      throw new Error("Invalid templateId");
    }
    return await templateSwimlaneRepository.findByTemplate(templateId);
  }

  async updateSwimlane(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid id");
    }
    return await templateSwimlaneRepository.update(id, data);
  }

  async deleteSwimlane(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid id");
    }
    return await templateSwimlaneRepository.delete(id);
  }
}

module.exports = new TemplateSwimlaneService();
