const BoardMember = require("../models/boardMember.model");

class BoardMemberRepository {
  // Thêm 1 thành viên vào board
async addMember({ user_id, board_id, role_in_board, Creator = false }, session) {
    const boardMember = new BoardMember({ user_id, board_id, role_in_board, Creator });
    return await boardMember.save({ session });
  }

  // Tìm tất cả thành viên trong 1 board
  async getMembersByBoard(board_id) {
    return await BoardMember.find({ board_id })
      .populate("user_id", "email username") // populate thông tin user (nếu muốn)
      .lean();
  }

  // Kiểm tra 1 user đã ở trong board chưa
  async findMember(user_id, board_id) {
    return await BoardMember.findOne({ user_id, board_id }).lean();
  }

  // Xoá thành viên khỏi board
  async removeMember(user_id, board_id) {
    return await BoardMember.deleteOne({ user_id, board_id });
  }

  // Cập nhật role của thành viên trong board
  async updateRole(user_id, board_id, role_in_board) {
    return await BoardMember.findOneAndUpdate(
      { user_id, board_id },
      { role_in_board },
      { new: true }
    ).lean();
  }

  async selectAll(){
   return await BoardMember.find().lean();
  }


  async findWithBoards(filter) {
    return BoardMember.find(filter)
      .populate("board_id")   // populate sang bảng Board
      .exec();
  }

  // Lấy tất cả board mà user là thành viên
  async getBoardsByUser(user_id) {
    return await BoardMember.find({ user_id })
      .populate("board_id", "title description created_at updated_at is_template")
      .lean();
  }
}

module.exports = new BoardMemberRepository();
