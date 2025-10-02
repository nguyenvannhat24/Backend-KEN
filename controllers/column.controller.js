const columnService = require('../services/column.service');

class ColumnController {
  async create(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }
      const { board_id, name, order_index } = req.body;
      const column = await columnService.createColumn({ board_id, name, order_index, userId });
      res.status(201).json({ success: true, data: column });
    } catch (error) {
      console.error('❌ Column create error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }
      const column = await columnService.getColumn(req.params.id, userId);
      if (!column) return res.status(404).json({ success: false, message: 'Column không tồn tại' });
      res.json({ success: true, data: column });
    } catch (error) {
      console.error('❌ Column getOne error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getByBoard(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }
      const columns = await columnService.getColumnsByBoard(req.params.boardId, userId);
      res.json({ success: true, data: columns });
    } catch (error) {
      console.error('❌ Column getByBoard error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }
      const column = await columnService.updateColumn(req.params.id, req.body, userId);
      if (!column) return res.status(404).json({ success: false, message: 'Column không tồn tại' });
      res.json({ success: true, data: column });
    } catch (error) {
      console.error('❌ Column update error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }
      const column = await columnService.deleteColumn(req.params.id, userId);
      if (!column) return res.status(404).json({ success: false, message: 'Column không tồn tại' });
      res.json({ success: true, message: 'Xóa column thành công' });
    } catch (error) {
      console.error('❌ Column delete error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ColumnController();
