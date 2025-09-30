const Group = require('../models/group.model');

class GroupRepository {
  async create(data) {
    return await Group.create(data);
  }

  async findById(id) {
    return await Group.findById(id).lean();
  }

  async findAll() {
    return await Group.find().lean();
  }

  async update(id, data) {
    return await Group.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id) {
    return await Group.findByIdAndDelete(id);
  }

  async findbyName(name){
    return await Group.findOne({name});
  }
  
 async findOne(center_id, name) {
  return await Group.findOne({
    center_id: center_id, // ObjectId
    name: name
  }).lean();
}
}

module.exports = new GroupRepository();
