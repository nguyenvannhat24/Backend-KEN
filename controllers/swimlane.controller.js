const swimlaneService = require('../services/swimlane.service');

class SwimlaneController {
  async create(req, res) {
    try {
      const userId = req.user?.id;
      const { board_id, name, order_index } = req.body;
      const swimlane = await swimlaneService.createSwimlane({ board_id, name, order_index, userId });
      res.status(201).json({ success: true, data: swimlane });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const userId = req.user?.id;
      const swimlane = await swimlaneService.getSwimlane(req.params.id, userId);
      if (!swimlane) return res.status(404).json({ success: false, message: 'Swimlane not found' });
      res.json({ success: true, data: swimlane });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getByBoard(req, res) {
    try {
      const userId = req.user?.id;
      const swimlanes = await swimlaneService.getSwimlanesByBoard(req.params.boardId, userId);
      res.json({ success: true, data: swimlanes });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const userId = req.user?.id;
      const swimlane = await swimlaneService.updateSwimlane(req.params.id, req.body, userId);
      if (!swimlane) return res.status(404).json({ success: false, message: 'Swimlane not found' });
      res.json({ success: true, data: swimlane });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const userId = req.user?.id;
      const swimlane = await swimlaneService.deleteSwimlane(req.params.id, userId);
      if (!swimlane) return res.status(404).json({ success: false, message: 'Swimlane not found' });
      res.json({ success: true, message: 'Swimlane deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new SwimlaneController();
