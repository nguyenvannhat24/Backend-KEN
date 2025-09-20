const UserPoint = require('../models/userPoint.model');

class UserPointRepository {
  async findAll() {
    return UserPoint.find().populate('user_id').populate('center_id').lean();
  }

  async findByUser(userId) {
    return UserPoint.find({ user_id: userId }).populate('center_id').lean();
  }

  async findByUserAndCenter(userId, centerId) {
    return UserPoint.findOne({ user_id: userId, center_id: centerId }).lean();
  }

  async create(data) {
    return UserPoint.create(data);
  }

  async update(id, data) {
    return UserPoint.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id) {
    return UserPoint.findByIdAndDelete(id).lean();
  }
}

module.exports = new UserPointRepository();
