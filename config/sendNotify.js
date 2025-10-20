const { sendMail } = require("./mailer");

/**
 * Gửi thông báo email cho nhiều người dùng khi task thay đổi
 * @param {string[]} emails - Danh sách email người nhận
 * @param {string} userSend - Tên người thực hiện thay đổi
 * @param {string} newColumn - Tên cột mới
 * @param {string} newSwimlane - Tên hàng mới (swimlane)
 * @param {string} nameTask - Tên task
 * @param {string} nameBoard - Tên board
 */
async function sendNotificationToAll(emails, userSend, newColumn, newSwimlane, nameTask, nameBoard) {
  const subject = "Thông báo thay đổi trạng thái Task";
  const html = `
    <h3>Xin chào!</h3>
    <p>Hệ thống vừa có cập nhật mới trong board <b>${nameBoard}</b>.</p>
    <p>Task <b>${nameTask}</b> vừa được <b>${userSend}</b> di chuyển đến 
    <b>cột ${newColumn}</b> và <b>hàng ${newSwimlane}</b>.</p>
    <p>Cảm ơn bạn đã đọc.</p>
    <p>— CodeGym Team</p>
  `;

  try {
    if (!Array.isArray(emails) || emails.length === 0) {
      console.warn("⚠️ Không có email nào để gửi thông báo.");
      return;
    }

    await Promise.all(
      emails.map(email => sendMail(email, subject, html))
    );

 
  } catch (err) {
    console.error("❌ Lỗi khi gửi email:", err.message);
  }
}

module.exports = { sendNotificationToAll };
