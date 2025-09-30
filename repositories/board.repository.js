const Board = require('../models/board.model');
const BoardMember = require('../models/boardMember.model');

class BoardRepository {
  async selectedAll(){
        return Board.find().lean();
  }
  async findById(boardId) {
    return Board.findById(boardId).lean();
  }

  async findByIds(boardIds) {
    return Board.find({ _id: { $in: boardIds } }).lean();
  }

  // Tìm boards mà user là creator thông qua BoardMember
  async findByCreator(userId) {
    const creatorMembers = await BoardMember.find({ 
      user_id: userId, 
      Creator: true 
    }).lean();
    
    if (creatorMembers.length === 0) return [];
    
    const boardIds = creatorMembers.map(m => m.board_id);
    return Board.find({ _id: { $in: boardIds } }).lean();
  }

  async create(boardData) {
    const board = await Board.create(boardData);
    return board;
  }
    // Tạo board có transaction
  async createWithSession(boardData, session) {
    const boards = await Board.create([boardData], { session });
    return boards[0]; // vì create([]) trả mảng
  }

  async findMembersByUser(userId) {
    return BoardMember.find({ user_id: userId }).lean();
  }

  async isMember(userId, boardId) {
    const doc = await BoardMember.findOne({ user_id: userId, board_id: boardId }).select('_id').lean();
    return !!doc;
  }

  // Kiểm tra user có phải creator thông qua BoardMember
  async isCreatorFromMember(userId, boardId) {
    const doc = await BoardMember.findOne({ 
      user_id: userId, 
      board_id: boardId, 
      Creator: true 
    }).select('_id').lean();
    return !!doc;
  }

  async updateById(boardId, updateData) {
    updateData.updated_at = new Date();
    return Board.findByIdAndUpdate(boardId, updateData, { new: true, runValidators: true }).lean();
  }

  async deleteById(boardId) {
    return Board.findByIdAndDelete(boardId).lean();
  }

  async findByTitleAndUser(title, userId) {
  // tìm board có title này mà user là thành viên
  return await Board.findOne({ title })
    .where("_id")
    .in(
      await BoardMember.find({ user_id: userId }).distinct("board_id")
    )
    .lean();
}
// lấy bảng theo id
async getBoardById(board_id){
try {
      return await Board.findById(board_id).lean();
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
}
}

module.exports = new BoardRepository();


