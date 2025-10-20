const mongoose = require('mongoose');
const Task = require('./models/task.model');

mongoose.connect('mongodb://localhost:27017/ken', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Lấy tất cả tasks (kể cả deleted)
    const allTasks = await Task.find({}).lean();
    console.log('Total tasks (including deleted):', allTasks.length);
    
    // Lấy tasks không bị deleted
    const activeTasks = await Task.find({ deleted_at: null }).lean();
    console.log('Active tasks (not deleted):', activeTasks.length);
    
    // Lấy tasks bị deleted
    const deletedTasks = await Task.find({ deleted_at: { $ne: null } }).lean();
    console.log('Deleted tasks:', deletedTasks.length);
    
    // Hiển thị một vài task bị deleted
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
