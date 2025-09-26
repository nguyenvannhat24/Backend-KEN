const boardService = require('../services/board.service');

class BoardController {
  // đang xem theo kiêu người dùng 
  // selectALl


   async selectedAll (req, res)  {
  try {
    const boards = await boardService.selectedAll();   // gọi service
    res.json({
      success: true,
      data: boards
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách board:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
  };
  async listMyBoards(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const boards = await boardService.listBoardsForUser(userId);
      res.json({ success: true, count: boards.length, data: boards });
    } catch (err) {
      console.error('❌ listMyBoards error:', err);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  async createBoard(req, res) {
    try {
     
      const { title, description, is_template , userId} = req.body;
      const board = await boardService.createBoard({ title, description, is_template ,userId});// tao\j bảng vừa lưu vừa lấy id của bảng

      // add chính nó vào boardMember 
      // id user id bảng
      res.status(201).json({ success: true, data: board });
    } catch (err) {
      console.error('❌ createBoard error:', err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getBoardDetail(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { id } = req.params;
      const board = await boardService.getBoardIfPermitted(id, userId);
      if (board === null) return res.status(404).json({ success: false, message: 'Board không tồn tại' });
      if (board === 'forbidden') return res.status(403).json({ success: false, message: 'Không có quyền truy cập board này' });
      res.json({ success: true, data: board });
    } catch (err) {
      console.error('❌ getBoardDetail error:', err);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  async updateBoard(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { id } = req.params;
      const updated = await boardService.updateBoard(id, req.body, userId);
      if (updated === null) return res.status(404).json({ success: false, message: 'Board không tồn tại' });
      res.json({ success: true, data: updated });
    } catch (err) {
      if (err.message === 'FORBIDDEN') {
        return res.status(403).json({ success: false, message: 'Không có quyền cập nhật board này' });
      }
      console.error('❌ updateBoard error:', err);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  async deleteBoard(req, res) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { id } = req.params;
      await boardService.deleteBoard(id, userId);
      res.json({ success: true, message: 'Xóa board thành công' });
    } catch (err) {
      if (err.message === 'FORBIDDEN') {
        return res.status(403).json({ success: false, message: 'Chỉ creator được phép xóa board' });
      }
      console.error('❌ deleteBoard error:', err);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  
}

module.exports = new BoardController();


