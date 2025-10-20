/**
 * List all boards in database
 * Run: node list-boards.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Board = require('./models/board.model');

async function listBoards() {
  try {
    const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/your_db_name';
    console.log('🔗 Connecting to:', dbUri.substring(0, 30) + '...\n');
    
    await mongoose.connect(dbUri);
    console.log('✅ Connected to DB\n');

    const boards = await Board.find({ deleted_at: null }).lean();
    
    console.log(`📋 Found ${boards.length} boards:\n`);
    
    boards.forEach((board, index) => {
      console.log(`${index + 1}. ${board.title || 'Untitled'}`);
      console.log(`   ID: ${board._id}`);
      console.log(`   Created: ${board.created_at}`);
      console.log('');
    });

    if (boards.length > 0) {
      console.log('\n✅ Use one of these board IDs for testing analytics');
    } else {
      console.log('\n⚠️  No boards found. Create a board first!');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listBoards();

