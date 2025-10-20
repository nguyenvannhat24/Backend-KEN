const mongoose = require('mongoose');
const analyticsService = require('./services/analytics.service');

const MONGO_URI = 'mongodb+srv://nhat:123@cluster0.ajpeazo.mongodb.net/CodeGym?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    
    const boardId = '68f04aa8a8d72d344f0b9156';
    
    try {
      // Test Dashboard Stats
      console.log('\n=== DASHBOARD STATS ===');
      const dashboardStats = await analyticsService.getDashboardStats(boardId);
      console.log('Dashboard Stats:', JSON.stringify(dashboardStats, null, 2));
      
      // Test Line Chart
      console.log('\n=== LINE CHART ===');
      const lineChartData = await analyticsService.getLineChartData({
        board_id: boardId,
        start_date: '2025-10-01',
        end_date: '2025-10-31',
        granularity: 'day'
      });
      console.log('Line Chart Data:', JSON.stringify(lineChartData, null, 2));
      
    } catch (error) {
      console.error('Analytics Error:', error.message);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection Error:', err);
    process.exit(1);
  });
