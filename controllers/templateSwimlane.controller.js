const service = require('../services/templateSwimlane.service');

class TemplateSwimlaneController {
  async list(req, res) {
    try {
      const rows = await service.list(req.params.template_id);
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    try {
      const row = await service.create(req.params.template_id, req.body);
      res.status(201).json({ success: true, data: row });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const row = await service.update(req.params.id, req.body);
      res.json({ success: true, data: row });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async remove(req, res) {
    try {
      await service.remove(req.params.id);
      res.json({ success: true, message: 'Xóa TemplateSwimlane thành công' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new TemplateSwimlaneController();