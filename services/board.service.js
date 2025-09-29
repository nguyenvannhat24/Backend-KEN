const boardRepo = require('../repositories/board.repository');
const boardMemberRepo = require("../repositories/boardMember.repository");
const mongoose = require("mongoose");

class BoardService {

  async selectedAll() {
    return boardRepo.selectedAll();
  }

  async listBoardsForUser(userId) {
    // Chỉ lấy boards mà user là thành viên
    const memberships = await boardRepo.findMembersByUser(userId);
    const memberBoardIds = memberships.map(m => m.board_id);
    if (memberBoardIds.length === 0) return [];
    return boardRepo.findByIds(memberBoardIds);
  }

  async createBoard({ title, description, userId, is_template }) {
    if (!title || !userId) {
      throw new Error("title và userId là bắt buộc");
    }

    // Kiểm tra trùng tên
    const existingBoard = await boardRepo.findByTitleAndUser(title, userId);
    if (existingBoard) {
      throw new Error("Bạn đã có board với tên này rồi!");
    }

    // Bắt đầu session transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Tạo mới board
      const board = await boardRepo.createWithSession(
        { title, description, is_template },
        session
      );

      // Thêm vào BoardMembers
      await boardMemberRepo.addMember(
        {
          board_id: board._id,
          user_id: userId,
          role_in_board: "Người tạo",
          Creator: true
        },
        session
      );

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return board;
    } catch (err) {
      // Rollback
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }


  async getBoardIfPermitted(boardId, userId) {
    const board = await boardRepo.findById(boardId);
    if (!board) return null;
    const permitted = await boardRepo.isMember(userId, boardId);
    return permitted ? board : 'forbidden';
  }

  async updateBoard(boardId, updateData, userId) {
    const board = await this.getBoardIfPermitted(boardId, userId);
    if (board === null) return null;
    if (board === 'forbidden') throw new Error('FORBIDDEN');
    const allowed = {};
    if (typeof updateData.title === 'string') allowed.title = updateData.title;
    if (typeof updateData.description === 'string') allowed.description = updateData.description;
    if (updateData.center_id) allowed.center_id = updateData.center_id;
    return boardRepo.updateById(boardId, allowed);
  }

  async deleteBoard(boardId, userId) {
    const isCreator = await boardRepo.isCreatorFromMember(userId, boardId);
    if (!isCreator) throw new Error('FORBIDDEN');
    return boardRepo.deleteById(boardId);
  }
}

module.exports = new BoardService();
