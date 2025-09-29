const mongoose = require('mongoose');
const templateRepository = require('../repositories/template.repository');

class TemplateService {
  async createTemplate(data) {
    const check = await templateRepository.findByName(data.name , data.created_by);
    if(check){
      throw new Error("mục này đã có trong dữ liệu của bạn rồi");
    }
    return await templateRepository.create(data);
  }

  async getTemplates() {
    return await templateRepository.findAll();
  }

  async getTemplateById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid template id");
    }
    return await templateRepository.findById(id);
  }

  async updateTemplate(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid template id");
    }
    return await templateRepository.update(id, data);
  }

  async deleteTemplate(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid template id");
    }
    return await templateRepository.delete(id);
  }
  async findAll(){
    return await templateRepository.findAll();
  }
}

module.exports = new TemplateService();
