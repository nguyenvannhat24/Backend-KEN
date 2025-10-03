const swimlaneService = require('../services/swimlane.service');

class SwimlaneController {
  async create(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }
      const { board_id, name, order } = req.body;
      const swimlane = await swimlaneService.createSwimlane({ board_id, name, order, userId });
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

  // Thu gọn/mở rộng Swimlane - Story 26
  async toggleCollapse(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }
      
      const { id } = req.params;
      const { collapsed } = req.body;
      
      if (typeof collapsed !== 'boolean') {
        return res.status(400).json({ 
          success: false, 
          message: 'collapsed phải là boolean (true/false)' 
        });
      }

      const swimlane = await swimlaneService.toggleCollapse(id, collapsed, userId);
      if (!swimlane) return res.status(404).json({ success: false, message: 'Swimlane không tồn tại' });
      
      res.json({ 
        success: true, 
        message: `Swimlane đã được ${collapsed ? 'thu gọn' : 'mở rộng'}`,
        data: swimlane 
      });
    } catch (error) {
      console.error('❌ Swimlane toggleCollapse error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Reorder Swimlanes
  async reorder(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
      }
      
      const { boardId } = req.params;
      const { swimlanes } = req.body; // Array of {id, order}
      
      if (!Array.isArray(swimlanes)) {
        return res.status(400).json({ 
          success: false, 
          message: 'swimlanes phải là array' 
        });
      }

      const result = await swimlaneService.reorderSwimlanes(boardId, swimlanes, userId);
      res.json({ 
        success: true, 
        message: 'Sắp xếp lại swimlanes thành công',
        data: result 
      });
    } catch (error) {
      console.error('❌ Swimlane reorder error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new SwimlaneController();
