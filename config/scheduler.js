const { sendNotificationToAll } = require("../config/sendNotify");
const cron = require("node-cron");
const Tasks = require("../models/task.model");
const moment = require("moment-timezone");
const startOfDay = moment().tz("Asia/Ho_Chi_Minh").startOf("day").toDate();
const endOfDay = moment().tz("Asia/Ho_Chi_Minh").endOf("day").toDate();
const { sendMailToUser } = require("../config/sendNotify");
const boardService = require("../services/board.service");
cron.schedule("0 7 * * *", async () => {
  // gửi lúc 7h sáng
  try {
    const tasks = await Tasks.find({
      due_date: { $gte: startOfDay, $lte: endOfDay },
      deleted_at: null,
    });

    if (tasks.length === 0) {
      console.log("✅ Không có task nào đến hạn hôm nay.");
      return;
    }

    tasks.forEach(async (t) => {
      const subject = `Bạn có task sắp hết hạn`;
      const IdBoard = t.board_id;

      if (!IdBoard) return;
      const nameBoard = await boardService.getBoardById(IdBoard);
      if (!nameBoard) return;

      const html = `
          <h3>Xin chào!</h3>
          <p>Task <b>${t.title}</b> trong bảng <b>${nameBoard.title}  
          </b> sắp hết hạn
          <p>hãy hoàn thành trước: ${t.due_date.toLocaleString()}</p>
          <p>— CodeGym Team</p>
        `;

      await sendMailToUser(t.assigned_to, subject, html);
    });
  } catch (error) {
    console.error("❌ Lỗi khi chạy cron job:", error);
  }
});
