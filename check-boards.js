const mongoose = require('mongoose');
const Board = require('./models/board.model');
const Column = require('./models/column.model');
const Task = require('./models/task.model');

mongoose.connect('mongodb://localhost:27017/ken', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Kiểm tra boards
    const boards = await Board.find({}).lean();
    console.log('Total boards:', boards.length);
    
    if (boards.length > 0) {
      console.log('Sample board:');
      console.log(JSON.stringify(boards[0], null, 2));
    }
    
    // Kiểm tra columns
    const columns = await Column.find({}).lean();
    console.log('Total columns:', columns.length);
    
    if (columns.length > 0) {
      console.log('Sample column:');
      console.log(JSON.stringify(columns[0], null, 2));
    }
    
    // Kiểm tra tasks
    const tasks = await Task.find({}).lean();
    console.log('Total tasks:', tasks.length);
    
    if (tasks.length > 0) {
      console.log('Sample task:');
      console.log(JSON.stringify(tasks[0], null, 2));
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
