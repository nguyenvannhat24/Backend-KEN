const columnService = require('../services/column.service');

class ColumnController {
  async create(req, res) {
    try {
      const { board_id, name, order_index } = req.body;
      const column = await columnService.createColumn({ board_id, name, order_index });
      res.status(201).json({ success: true, data: column });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const column = await columnService.getColumn(req.params.id);
      if (!column) return res.status(404).json({ success: false, message: 'Column not found' });
      res.json({ success: true, data: column });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getByBoard(req, res) {
    try {
      const columns = await columnService.getColumnsByBoard(req.params.boardId);
      res.json({ success: true, data: columns });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const column = await columnService.updateColumn(req.params.id, req.body);
      if (!column) return res.status(404).json({ success: false, message: 'Column not found' });
      res.json({ success: true, data: column });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const column = await columnService.deleteColumn(req.params.id);
      if (!column) return res.status(404).json({ success: false, message: 'Column not found' });
      res.json({ success: true, message: 'Column deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new ColumnController();
