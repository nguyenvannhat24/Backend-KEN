const mongoose = require('mongoose');
const Board = require('./models/board.model');
const Column = require('./models/column.model');
const Task = require('./models/task.model');

// Sử dụng connection string thực từ .env
const MONGO_URI = 'mongodb+srv://nhat:123@cluster0.ajpeazo.mongodb.net/CodeGym?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    
    const boardId = '68f04aa8a8d72d344f0b9156';
    
    // Kiểm tra board
    const board = await Board.findById(boardId).lean();
    console.log('Board found:', !!board);
    if (board) {
      console.log('Board title:', board.title);
    }
    
    // Kiểm tra columns của board
    const columns = await Column.find({ board_id: boardId }).lean();
    console.log('Columns in board:', columns.length);
    
    if (columns.length > 0) {
      console.log('Columns:');
      columns.forEach(col => {
        console.log(`- ${col.name} (isDone: ${col.isDone})`);
      });
    }
    
    // Kiểm tra tasks của board
    const allTasks = await Task.find({ board_id: boardId }).lean();
    console.log('Total tasks in board:', allTasks.length);
    
    const activeTasks = await Task.find({ board_id: boardId, deleted_at: null }).lean();
    console.log('Active tasks (not deleted):', activeTasks.length);
    
    const deletedTasks = await Task.find({ board_id: boardId, deleted_at: { $ne: null } }).lean();
    console.log('Deleted tasks:', deletedTasks.length);
    
    if (activeTasks.length > 0) {
      console.log('Sample active task:');
      console.log(JSON.stringify(activeTasks[0], null, 2));
    }
    
    if (deletedTasks.length > 0) {
      console.log('Sample deleted task:');
      console.log(JSON.stringify(deletedTasks[0], null, 2));
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
