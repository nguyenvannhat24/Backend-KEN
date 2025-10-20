const mongoose = require('mongoose');
const Board = require('./models/board.model');

mongoose.connect('mongodb://localhost:27017/ken', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Lấy tất cả boards
    const boards = await Board.find({}).lean();
    console.log('Total boards in database:', boards.length);
    
    if (boards.length > 0) {
      console.log('\nAll boards:');
      boards.forEach((board, index) => {
        console.log(`${index + 1}. ID: ${board._id}`);
        console.log(`   Title: ${board.title || 'No title'}`);
        console.log(`   Created: ${board.created_at || 'No date'}`);
        console.log('---');
      });
    } else {
      console.log('No boards found in database');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
