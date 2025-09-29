const boardRepo = require('../repositories/board.repository');
const boardMemberRepo = require( "../repositories/boardMember.repository"); 
const templateService = require("./template.service");
const columnRepo = require('../repositories/column.repository');
const swimlaneRepo = require('../repositories/swimlane.repository');
const mongoose = require("mongoose");

class BoardService {

async selectedAll(){
  return boardRepo.selectedAll();
}

  async listBoardsForUser(userId) {
    const memberships = await boardRepo.findMembersByUser(userId);
    const memberBoardIds = memberships.map(m => m.board_id);
    const createdBoards = await boardRepo.findByCreator(userId);
    const allBoardIds = new Set([
      ...memberBoardIds.map(id => String(id)),
      ...createdBoards.map(b => String(b._id))
    ]);
    if (allBoardIds.size === 0) return [];
    return boardRepo.findByIds(Array.from(allBoardIds));
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
    const permitted = (String(board.created_by) === String(userId)) || await boardRepo.isMember(userId, boardId);
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
    const isCreator = await boardRepo.isCreator(userId, boardId);
    if (!isCreator) throw new Error('FORBIDDEN');
    return boardRepo.deleteById(boardId);
  }

 async cloneBoard(id_template, { title, description, userId }) {
  try {
    // 0. Validate input
    if (!id_template) {
      throw new Error('Thiếu id_template');
    }
    if (!title || title.trim() === '') {
      throw new Error('Tên board không được để trống');
    }
    if (!userId) {
      throw new Error('Thiếu userId');
    }

    

    // 2. Lấy cấu trúc từ template
    const columns = (await templateService.ColumbyTemplateId(id_template)) || [];
    const swimlanes = (await templateService.swinlaneByTemplateId(id_template)) || [];

    if (!Array.isArray(columns) || !Array.isArray(swimlanes)) {
      throw new Error('Template không hợp lệ: dữ liệu không phải mảng');
    }

    // 3. Tạo board mới (board thật, không phải template)
    const newBoard = await this.createBoard({
      title,
      description,
      userId,
      is_template: false
    });

    // 4. Clone nhiều column 1 lúc
    let newColumns = [];
    if (columns.length > 0) {
      newColumns = await columnRepo.insertMany(
        columns.map(col => ({
          board_id: newBoard._id,
          name: col.name,
          order_index: col.order_index
        }))
      );
    }

    // 5. Clone nhiều swimlane 1 lúc
    let newSwimlanes = [];
    if (swimlanes.length > 0) {
      newSwimlanes = await swimlaneRepo.insertMany(
        swimlanes.map(lane => ({
          board_id: newBoard._id,
          name: lane.name,
          order_index: lane.order_index
        }))
      );
    }

    return {
      board: newBoard,
      columns: newColumns,
      swimlanes: newSwimlanes
    };
  } catch (error) {
    throw new Error(`Clone board failed: ${error.message}`);
  }
}


}

module.exports = new BoardService();


