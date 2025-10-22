const analyticsService = require('../services/analytics.service');

class AnalyticsController {
  /**
   * Story 49: GET /api/analytics/line-chart
   * Query params: board_id, start_date, end_date, granularity
   * 
   * ✅ Security: checkBoardAccess middleware đã verify user có quyền truy cập board
   */
  async getLineChart(req, res) {
    try {
      const { board_id, start_date, end_date, granularity = 'day' } = req.query;

      // ✅ board_id validation đã được thực hiện trong middleware
      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'start_date và end_date là bắt buộc'
        });
      }

      // ✅ Audit log: Track who accessed analytics
      console.log('📊 Analytics Access:', {
        user_id: req.user?.id,
        username: req.user?.username,
        board_id,
        board_title: req.board?.title,
        role_in_board: req.boardMembership?.role_in_board,
        endpoint: 'line-chart',
        date_range: `${start_date} to ${end_date}`,
        granularity
      });

      const data = await analyticsService.getLineChartData({
        board_id,
        start_date,
        end_date,
        granularity
      });

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('❌ Analytics Line Chart Error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Story 47: GET /api/analytics/dashboard/:board_id
   * 
   * ✅ Security: checkBoardAccess middleware đã verify user có quyền truy cập board
   */
  async getDashboard(req, res) {
    try {
      const { board_id } = req.params;

      // ✅ Audit log
      console.log('📊 Analytics Access:', {
        user_id: req.user?.id,
        username: req.user?.username,
        board_id,
        board_title: req.board?.title,
        role_in_board: req.boardMembership?.role_in_board,
        endpoint: 'dashboard'
      });

      const stats = await analyticsService.getDashboardStats(board_id);

      // Log stats để debug
      console.log('📊 Dashboard Stats:', {
        board_id,
        totalTasks: stats.stats.totalTasks,
        completedTasks: stats.stats.completedTasks,
        completionRate: stats.stats.completionRate
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Analytics Dashboard Error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message,
        data: {
          board: { id: null, title: null },
          stats: {
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            overdueTasks: 0,
            completionRate: 0
          }
        }
      });
    }
  }

  /**
   * Story 48: GET /api/analytics/completion-rate
   * Query params: board_id, user_id, center_id, group_id
   * 
   * ✅ Security: checkBoardAccess middleware đã verify user có quyền truy cập board
   */
  async getCompletionRate(req, res) {
    try {
      const { board_id, user_id, center_id, group_id } = req.query;

      // ✅ Audit log
      console.log('📊 Analytics Access:', {
        user_id: req.user?.id,
        username: req.user?.username,
        board_id,
        board_title: req.board?.title,
        role_in_board: req.boardMembership?.role_in_board,
        endpoint: 'completion-rate',
        filters: { user_id, center_id, group_id }
      });

      const data = await analyticsService.getCompletionRate({
        board_id,
        user_id,
        center_id,
        group_id
      });

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('❌ Analytics Completion Rate Error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message,
        data: {
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          completionRate: 0
        }
      });
    }
  }
}

module.exports = new AnalyticsController();

