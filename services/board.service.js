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
    
    // Soft delete thay vì hard delete
    await boardRepo.softDelete(boardId);
    return true;
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
            order: col.order_index
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
            order: lane.order_index
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

  // Cấu hình Board settings - Story 24
  async configureBoardSettings(boardId, { columns, swimlanes }, userId) {
    try {
      // Kiểm tra quyền truy cập
      const board = await this.getBoardIfPermitted(boardId, userId);
      if (board === null) throw new Error('Board không tồn tại');
      if (board === 'forbidden') throw new Error('Không có quyền cấu hình board này');

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        let result = { board: board };

        // Cấu hình columns nếu có
        if (columns && Array.isArray(columns)) {
          // Soft delete columns cũ
          await columnRepo.softDeleteManyByBoard(boardId, session);
          
          // Tạo columns mới
          if (columns.length > 0) {
            const newColumns = await columnRepo.insertMany(
              columns.map((col, index) => ({
                board_id: boardId,
                name: col.name,
                order: col.order || index
              })),
              session
            );
            result.columns = newColumns;
          }
        }

        // Cấu hình swimlanes nếu có
        if (swimlanes && Array.isArray(swimlanes)) {
          // Soft delete swimlanes cũ
          await swimlaneRepo.softDeleteManyByBoard(boardId, session);
          
          // Tạo swimlanes mới
          if (swimlanes.length > 0) {
            const newSwimlanes = await swimlaneRepo.insertMany(
              swimlanes.map((lane, index) => ({
                board_id: boardId,
                name: lane.name,
                order: lane.order || index
              })),
              session
            );
            result.swimlanes = newSwimlanes;
          }
        }

        await session.commitTransaction();
        session.endSession();

        console.log(`✅ [BoardService] Configured board settings for ${boardId}`);
        return result;
      } catch (txErr) {
        await session.abortTransaction();
        session.endSession();
        throw txErr;
      }
    } catch (error) {
      console.error('❌ [BoardService] configureBoardSettings error:', error);
      throw error;
    }
  }

  // Thu gọn/mở rộng Swimlane - Story 26
  async toggleSwimlaneCollapse(boardId, swimlaneId, collapsed, userId) {
    try {
      // Kiểm tra quyền truy cập
      const board = await this.getBoardIfPermitted(boardId, userId);
      if (board === null) throw new Error('Board không tồn tại');
      if (board === 'forbidden') throw new Error('Không có quyền thao tác trên board này');

      // Kiểm tra swimlane tồn tại
      const swimlane = await swimlaneRepo.findById(swimlaneId);
      if (!swimlane || swimlane.board_id.toString() !== boardId) {
        throw new Error('Swimlane không tồn tại hoặc không thuộc board này');
      }

      // Cập nhật trạng thái collapsed
      const updatedSwimlane = await swimlaneRepo.update(swimlaneId, { collapsed: collapsed });
      
      console.log(`✅ [BoardService] Toggled swimlane ${swimlaneId} collapse to ${collapsed}`);
      return updatedSwimlane;
    } catch (error) {
      console.error('❌ [BoardService] toggleSwimlaneCollapse error:', error);
      throw error;
    }
  }

}

module.exports = new BoardService();


