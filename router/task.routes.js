const express = require('express');
const taskController = require('../controllers/task.controller');
const { authenticateAny, authorizeAny } = require('../middlewares/auth');
const { sendMail } = require ("../config/mailer");
const router = express.Router();

/**
 * Task Routes - Quản lý công việc
 * Tất cả routes đều cần authentication
 */

// ==================== AUTHENTICATED ROUTES ====================

// Tạo task mới - Story 17
router.post('/', authenticateAny, taskController.create);

// Lấy task theo ID
router.get('/:id', authenticateAny, taskController.getById);

// Cập nhật task - Story 18
router.put('/:id', authenticateAny, taskController.update);

// Xóa task - Story 19
router.delete('/:id', authenticateAny, taskController.delete);

// ==================== BOARD RELATED ROUTES ====================

// Lấy tất cả tasks của board
router.get('/board/:board_id', authenticateAny, taskController.getByBoard);

// Tìm kiếm tasks trong board
router.get('/board/:board_id/search', authenticateAny, taskController.search);

// Thống kê tasks theo board
router.get('/board/:board_id/stats', authenticateAny, taskController.getStats);

// ==================== COLUMN RELATED ROUTES ====================

// Lấy tasks của column
router.get('/column/:column_id', authenticateAny, taskController.getByColumn);
    
// ==================== USER RELATED ROUTES ====================

// Lấy tasks được assign cho user hiện tại
router.get('/my/assigned', authenticateAny, taskController.getMyTasks);

// Lấy tasks của user theo ID (admin hoặc chính mình)
router.get('/user/:user_id', authenticateAny, taskController.getByUser);

// ==================== DRAG & DROP ROUTES ====================
// Cập nhật vị trí task (kéo thả)

// Kéo thả task giữa các cột - Story 16
router.put('/:id/move', authenticateAny, taskController.moveTask);

// ==================== DATE & TIME ROUTES ====================

// Cập nhật ngày bắt đầu/kết thúc - Story 21
router.put('/:id/dates', authenticateAny, taskController.updateDates);

// Cập nhật thời gian ước tính - Story 22
router.put('/:id/estimate', authenticateAny, taskController.updateEstimate);
// Lấy tất cả tasks của column theo board
router.get('/board/:board_id/column/:column_id', authenticateAny, taskController.getByBoardAndColumn);

// lấy ra các dữ liệu để xây dựng biểu đồ linechart
router.post('/board/:board_id/lineChart', authenticateAny, taskController.getDataLineChart);



router.post("/send-mail", async (req, res) => {
  const { email } = req.body;

  await sendMail(
    email,
    "Xác nhận đăng ký tài khoản",
    "<h3>Chào mừng bạn đến với hệ thống!</h3><p>Tài khoản của bạn đã được tạo thành công.</p>"
  );

  res.json({ message: "Mail đã được gửi thành công" });
});


module.exports = router;
