// services/notificationService.js
const notificationRepo = require("../repositories/notification.repository");

const notificationService = {
  async createNotification(data) {
    if (!data.user_id || !data.title) {
      throw new Error("Thiếu thông tin bắt buộc: user_id hoặc title");
    }
    return await notificationRepo.create(data);
  },

  async getNotificationsByUser(userId) {
    if (!userId) throw new Error("Thiếu userId");
    return await notificationRepo.findByUserId(userId);
  },

  async markAsRead(notificationId) {
    const notification = await notificationRepo.findById(notificationId);
    if (!notification) throw new Error("Không tìm thấy thông báo");
    return await notificationRepo.markAsRead(notificationId);
  },

  async deleteNotification(notificationId) {
    const notification = await notificationRepo.findById(notificationId);
    if (!notification) throw new Error("Không tìm thấy thông báo để xóa");
    return await notificationRepo.delete(notificationId);
  },
};

module.exports = notificationService;
