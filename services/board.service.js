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
        { title, description, is_template, created_by: userId },
        session
      );

      // Thêm vào BoardMembers
      await boardMemberRepo.addMember(
        {
          board_id: board._id,
          user_id: userId,
          role_in_board: "Người tạo",
          Creator: true,
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
    // Quyền truy cập dựa trên BoardMember (Creator/Member)
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
    // Chỉ Creator (trong BoardMember) mới được xóa
    const isCreator = await boardRepo.isCreatorFromMember(userId, boardId);
    if (!isCreator) throw new Error('FORBIDDEN');
    // Cascade delete theo Backlog: BoardMembers, Columns, Swimlanes, Tasks
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await require('../repositories/boardMember.repository').deleteManyByBoard(boardId, session);
      await require('../repositories/column.repository').deleteManyByBoard(boardId, session);
      await require('../repositories/swimlane.repository').deleteManyByBoard(boardId, session);
      await require('../repositories/task.repository').deleteManyByBoard(boardId, session);
      await boardRepo.deleteById(boardId);
      await session.commitTransaction();
      session.endSession();
      return true;
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      throw e;
    }
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

    

    // 1. Kiểm tra template tồn tại
    await require('./template.service').getTemplateById(id_template);

    // 2. Lấy cấu trúc từ template (đảm bảo có thứ tự ổn định)
    const templateColumnService = require('./templateColumn.service');
    const templateSwimlaneService = require('./templateSwimlane.service');
    const columns = (await templateColumnService.list(id_template)) || [];
    const swimlanes = (await templateSwimlaneService.list(id_template)) || [];

    if (!Array.isArray(columns) || !Array.isArray(swimlanes)) {
      throw new Error('Template không hợp lệ: dữ liệu không phải mảng');
    }

    // 3. Clone trong 1 transaction để đảm bảo toàn vẹn
    const session = await mongoose.startSession();
    session.startTransaction();
    let newBoard, newColumns = [], newSwimlanes = [];
    try {
      // 3.1 Tạo board mới (board thật, không phải template)
      newBoard = await boardRepo.createWithSession({
        title,
        description,
        is_template: false,
        created_by: userId
      }, session);

      // 3.2 Thêm creator vào BoardMembers
      await boardMemberRepo.addMember({
        board_id: newBoard._id,
        user_id: userId,
        role_in_board: "Người tạo",
        Creator: true,
      }, session);

      // 3.3 Clone columns
      if (columns.length > 0) {
        newColumns = await columnRepo.insertMany(
          columns.map(col => ({
            board_id: newBoard._id,
            name: col.name,
            order_index: col.order_index
          })),
          session
        );
      }

      // 3.4 Clone swimlanes
      if (swimlanes.length > 0) {
        newSwimlanes = await swimlaneRepo.insertMany(
          swimlanes.map(lane => ({
            board_id: newBoard._id,
            name: lane.name,
            order_index: lane.order_index
          })),
          session
        );
      }

      await session.commitTransaction();
      session.endSession();
    } catch (txErr) {
      await session.abortTransaction();
      session.endSession();
      throw txErr;
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


