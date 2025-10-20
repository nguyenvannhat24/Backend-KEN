const mongoose = require('mongoose');
const Board = require('./models/board.model');
const Column = require('./models/column.model');
const Task = require('./models/task.model');

const MONGO_URI = 'mongodb+srv://nhat:123@cluster0.ajpeazo.mongodb.net/CodeGym?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    
    const boardId = '68f04aa8a8d72d344f0b9156';
    
    // Lấy tất cả tasks của board (kể cả deleted)
    const allTasks = await Task.find({ board_id: boardId }).lean();
    console.log('=== ALL TASKS (including deleted) ===');
    console.log('Total:', allTasks.length);
    
    // Lấy tasks không bị deleted
    const activeTasks = await Task.find({ board_id: boardId, deleted_at: null }).lean();
    console.log('\n=== ACTIVE TASKS (not deleted) ===');
    console.log('Total:', activeTasks.length);
    
    // Lấy tasks bị deleted
    const deletedTasks = await Task.find({ board_id: boardId, deleted_at: { $ne: null } }).lean();
    console.log('\n=== DELETED TASKS ===');
    console.log('Total:', deletedTasks.length);
    
    // Chi tiết từng task
    console.log('\n=== ACTIVE TASKS DETAILS ===');
    activeTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.title} (ID: ${task._id})`);
      console.log(`   Column: ${task.column_id}`);
      console.log(`   Swimlane: ${task.swimlane_id}`);
      console.log(`   Created: ${task.created_at}`);
      console.log(`   Updated: ${task.updated_at}`);
      console.log('---');
    });
    
    // Kiểm tra swimlanes
    console.log('\n=== SWIMLANES IN BOARD ===');
    const Swimlane = require('./models/swimlane.model');
    const swimlanes = await Swimlane.find({ board_id: boardId }).lean();
    console.log('Total swimlanes:', swimlanes.length);
    swimlanes.forEach(swim => {
      console.log(`- ${swim.name} (ID: ${swim._id})`);
    });
    
    // Kiểm tra tasks theo swimlane
    console.log('\n=== TASKS BY SWIMLANE ===');
    for (const swimlane of swimlanes) {
      const tasksInSwimlane = await Task.find({ 
        board_id: boardId, 
        swimlane_id: swimlane._id,
        deleted_at: null 
      }).lean();
      console.log(`${swimlane.name}: ${tasksInSwimlane.length} tasks`);
      tasksInSwimlane.forEach(task => {
        console.log(`  - ${task.title}`);
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
