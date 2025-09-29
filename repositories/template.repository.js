const Template = require('../models/template.model');

class TemplateRepository {
  async create(data) {
    return await Template.create(data);
  }

  async findAll() {
    return await Template.find().populate('created_by', 'username email full_name');
  }

  async findById(id) {
    return await Template.findById(id).populate('created_by', 'username email');
  }

  async update(id, data) {
    return await Template.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Template.findByIdAndDelete(id);
  }
  
  async findByName(name , created_by){
   return await Template.findOne({
    name: name ,
    created_by: created_by
  });
  }

  async selectAll(){
    return await Template.findAll();
  }
}

module.exports = new TemplateRepository();
