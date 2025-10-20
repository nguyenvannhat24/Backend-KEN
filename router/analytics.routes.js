const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { authenticateAny, authorizeAny } = require('../middlewares/auth');

const router = express.Router();

/**
 * Analytics Routes - Báo cáo & Thống kê (Stories 47-50)
 * Tất cả routes đều cần authentication
 */

// Story 49: Line Chart - Biểu đồ thống kê tiến độ theo thời gian
router.get('/line-chart', authenticateAny, analyticsController.getLineChart);

// Story 47: Dashboard tổng quan (alias cho FE compatibility)
router.get('/dashboard/:board_id', authenticateAny, analyticsController.getDashboard);
router.get('/board-performance/:board_id', authenticateAny, analyticsController.getDashboard);

// Story 48: Tỷ lệ hoàn thành
router.get('/completion-rate', authenticateAny, analyticsController.getCompletionRate);

module.exports = router;

