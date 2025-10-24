// repositories/notificationRepo.js
const Notification = require("../models/notification.model");

const notificationRepo = {
  async create(data) {
    return await Notification.create(data);
  },

  async findByUserId(userId) {
    return await Notification.find({ user_id: userId }).sort({
      created_at: -1,
    });
  },

  async findById(id) {
    return await Notification.findById(id);
  },

  async markAsRead(id) {
    return await Notification.findByIdAndUpdate(
      id,
      { read_at: new Date() },
      { new: true }
    );
  },

  async delete(id) {
    return await Notification.findByIdAndDelete(id);
  },
};

module.exports = notificationRepo;
