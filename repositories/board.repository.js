const Board = require('../models/board.model');
const BoardMember = require('../models/boardMember.model');

class BoardRepository {
  async findById(boardId) {
    return Board.findById(boardId).lean();
  }

  async findByIds(boardIds) {
    return Board.find({ _id: { $in: boardIds } }).lean();
  }

  async findByCreator(userId) {
    return Board.find({ created_by: userId }).lean();
  }

  async create(boardData) {
    const board = await Board.create(boardData);
    return board.toObject();
  }

  async findMembersByUser(userId) {
    return BoardMember.find({ user_id: userId }).lean();
  }

  async isMember(userId, boardId) {
    const doc = await BoardMember.findOne({ user_id: userId, board_id: boardId }).select('_id').lean();
    return !!doc;
  }

  async isCreator(userId, boardId) {
    const doc = await Board.findOne({ _id: boardId, created_by: userId }).select('_id').lean();
    return !!doc;
  }

  async updateById(boardId, updateData) {
    updateData.updated_at = new Date();
    return Board.findByIdAndUpdate(boardId, updateData, { new: true, runValidators: true }).lean();
  }

  async deleteById(boardId) {
    return Board.findByIdAndDelete(boardId).lean();
  }
}

module.exports = new BoardRepository();


