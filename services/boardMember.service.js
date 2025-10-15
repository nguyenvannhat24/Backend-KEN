const mongoose = require("mongoose");
const boardMemberRepo = require("../repositories/boardMember.repository");
const userRepo = require("../repositories/user.repository");
const boardRepo = require("../repositories/board.repository");

class BoardMemberService {
  // Xem tất cả BoardMember
  async selectAll() {
    return await boardMemberRepo.selectAll();
  }

  // Thêm user vào board
  async addMember({ user_id, board_id, role_in_board }) {
    
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new Error("user_id không hợp lệ");
    }
    if (!mongoose.Types.ObjectId.isValid(board_id)) {
      throw new Error("board_id không hợp lệ");
    }

    const validRoles = ["Người tạo", "Thành viên", "Khách"];
    if (!validRoles.includes(role_in_board)) {
      throw new Error("role_in_board không hợp lệ");
    }

    const user = await userRepo.findById(user_id);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }

    const board = await boardRepo.getBoardById(board_id);
    if (!board) {
      throw new Error("Board không tồn tại");
    }

    const existing = await boardMemberRepo.findMember(user_id, board_id);
    if (existing) {
      throw new Error("User đã là thành viên trong board này");
    }

    return await boardMemberRepo.addMember({ user_id, board_id, role_in_board });
  }

  async getMembers(board_id) {
    if (!mongoose.Types.ObjectId.isValid(board_id)) {
      throw new Error("board_id không hợp lệ");
    }
    return await boardMemberRepo.getMembersByBoard(board_id);
  }

  // Cập nhật role
  async updateRole(user_id, board_id, role_in_board) {
   
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new Error("user_id không hợp lệ");
    }
    if (!mongoose.Types.ObjectId.isValid(board_id)) {
      throw new Error("board_id không hợp lệ");
    }

  
    const validRoles = ["Người tạo", "Thành viên", "Khách"];
    if (!validRoles.includes(role_in_board)) {
      throw new Error("role_in_board không hợp lệ");
    }

    const user = await userRepo.findById(user_id);
    if (!user) throw new Error("Người dùng không tồn tại");

    const board = await boardRepo.getBoardById(board_id);
    if (!board) throw new Error("Board không tồn tại");

    const member = await boardMemberRepo.updateRole(user_id, board_id, role_in_board);
    if (!member) throw new Error("Không tìm thấy thành viên để cập nhật");
    return member;
  }

  // Xoá thành viên
  async removeMember(user_id, board_id) {
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new Error("user_id không hợp lệ");
    }
    if (!mongoose.Types.ObjectId.isValid(board_id)) {
      throw new Error("board_id không hợp lệ");
    }

    const result = await boardMemberRepo.removeMember(user_id, board_id);
    if (result.deletedCount === 0) throw new Error("Không tìm thấy thành viên để xoá");
    return true;
  }


 
async getBoardsByUser(user_id, roles = []) {

  const user = await userRepo.findById(user_id);
  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  // Tạo filter
  const filter = { user_id };
  if (roles.length > 0) {
    filter.role_in_board = { $in: roles };
  }


  const boards = await boardMemberRepo.getBoardsByUser(filter);

  return boards.map(bm => bm.board_id); 
}

}

module.exports = new BoardMemberService();
