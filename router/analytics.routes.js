const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { authenticateAny, authorizeAny } = require('../middlewares/auth');
const { checkBoardAccess } = require('../middlewares/boardAccess');

const router = express.Router();

/**
 * Analytics Routes - Báo cáo & Thống kê (Stories 47-50)
 * 
 * ✅ Security: Tất cả routes đều cần:
 * 1. Authentication (đã đăng nhập)
 * 2. Board Access (là member của board hoặc admin/System_Manager)
 */

// Story 49: Line Chart - Biểu đồ thống kê tiến độ theo thời gian
// Query params: board_id, start_date, end_date, granularity
router.get(
  '/line-chart',
  authenticateAny,              // ✅ Check đã login
  checkBoardAccess,             // ✅ Check có quyền truy cập board (từ query.board_id)
  analyticsController.getLineChart
);

// Story 47: Dashboard tổng quan
// Params: board_id
router.get(
  '/dashboard/:board_id',
  authenticateAny,              // ✅ Check đã login
  checkBoardAccess,             // ✅ Check có quyền truy cập board
  analyticsController.getDashboard
);

// Alias cho FE compatibility
router.get(
  '/board-performance/:board_id',
  authenticateAny,
  checkBoardAccess,
  analyticsController.getDashboard
);

// Story 48: Tỷ lệ hoàn thành
// Query params: board_id (required), user_id, center_id, group_id
router.get(
  '/completion-rate',
  authenticateAny,              // ✅ Check đã login
  checkBoardAccess,             // ✅ Check có quyền truy cập board (từ query.board_id)
  analyticsController.getCompletionRate
);

module.exports = router;

