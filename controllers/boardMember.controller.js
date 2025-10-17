const boardMemberService = require("../services/boardMember.service");
const mongoose = require('mongoose');

class BoardMemberController {

// Xem danh sách board mà user có quyền
    // Xem danh sách board mà user có quyền (dùng POST)
  async getBoardsByUser(req, res) {
    try {
      const user_id = req.user?.id || req.user?._id;
      console.log(req.user)
      const { roles = [] } = req.query; // Query params thay vì body

      const boards = await boardMemberService.getBoardsByUser(
        user_id,
        Array.isArray(roles) ? roles : []
      );

      res.json({ success: true, data: boards });
    } catch (error) {
      console.error("❌ Lỗi getBoardsByUser:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }



  async selectAll(req, res) {
    try {
   
      const member = await boardMemberService.selectAll();
      res.status(201).json({ success: true, data: member });
    } catch (err) {
      console.error("❌ select error:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async addMember(req, res) {
    try {
      const board_id = req.params.board_id;
      const { user_id, role_in_board } = req.body;
      
      const member = await boardMemberService.addMember({ user_id, board_id, role_in_board });
      res.status(201).json({ success: true, data: member });
    } catch (err) {
      console.error("❌ addMember error:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getMembers(req, res) {
    try {
      const boardId = req.params.board_id;
      
      if (!boardId) {
        return res.status(400).json({ success: false, message: 'board_id là bắt buộc' });
      }

      const members = await boardMemberService.getMembers(boardId);
      res.json({ success: true, data: members });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

async updateRole(req, res) {
  try {
    const { board_id, user_id } = req.params;
    const { role_in_board } = req.body;
    const requester_id = req.user.id; // người đang thực hiện hành động

    const member = await boardMemberService.updateRole(requester_id, user_id, board_id, role_in_board);
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}


  async removeMember(req, res) {
    try {
      const requester_id = req.user?.id ;
      const { board_id, user_id } = req.params;
      
      await boardMemberService.removeMember(board_id ,user_id, board_id);
      res.json({ success: true, message: "Xoá thành viên thành công" });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  

}

module.exports = new BoardMemberController();
