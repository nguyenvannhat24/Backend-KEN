const service = require('../services/templateSwimlane.service');

class TemplateSwimlaneController {
  async list(req, res) {
    try {
      const rows = await service.findAll();
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    try {
      const { template_id } = req.body;
      const row = await service.create(template_id, req.body);
      res.status(201).json({ success: true, data: row });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Thêm các methods còn thiếu
  async getAll(req, res) {
    try {
      const rows = await service.findAll();
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const row = await service.findById(req.params.id);
      res.json({ success: true, data: row });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async getByTemplate(req, res) {
    try {
      const rows = await service.findByTemplate(req.params.templateId);
      res.json({ success: true, data: rows });
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

  async delete(req, res) {
    try {
      await service.remove(req.params.id);
      res.json({ success: true, message: 'Xóa TemplateSwimlane thành công' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new TemplateSwimlaneController();