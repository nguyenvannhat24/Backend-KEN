const swimlaneService = require('../services/swimlane.service');

class SwimlaneController {
  async create(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }
      const { board_id, name, order_index } = req.body;
      const swimlane = await swimlaneService.createSwimlane({ board_id, name, order_index, userId });
      res.status(201).json({ success: true, data: swimlane });
    } catch (error) {
      console.error('❌ Swimlane create error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }
      const swimlane = await swimlaneService.getSwimlane(req.params.id, userId);
      if (!swimlane) return res.status(404).json({ success: false, message: 'Swimlane không tồn tại' });
      res.json({ success: true, data: swimlane });
    } catch (error) {
      console.error('❌ Swimlane getOne error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getByBoard(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }
      const swimlanes = await swimlaneService.getSwimlanesByBoard(req.params.boardId, userId);
      res.json({ success: true, data: swimlanes });
    } catch (error) {
      console.error('❌ Swimlane getByBoard error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }
      const swimlane = await swimlaneService.updateSwimlane(req.params.id, req.body, userId);
      if (!swimlane) return res.status(404).json({ success: false, message: 'Swimlane không tồn tại' });
      res.json({ success: true, data: swimlane });
    } catch (error) {
      console.error('❌ Swimlane update error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }
      const swimlane = await swimlaneService.deleteSwimlane(req.params.id, userId);
      if (!swimlane) return res.status(404).json({ success: false, message: 'Swimlane không tồn tại' });
      res.json({ success: true, message: 'Xóa swimlane thành công' });
    } catch (error) {
      console.error('❌ Swimlane delete error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new SwimlaneController();
