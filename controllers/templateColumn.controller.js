const templateColumnService = require('../services/templateColumn.service');

class TemplateColumnController {
  async create(req, res) {
    try {
      const { template_id, name, order_index } = req.body;

      // ✅ Kiểm tra input
      if (!template_id) {
        return res.status(400).json({ message: "template_id is required" });
      }
      if (!name || name.length > 100) {
        return res.status(400).json({ message: "name is required and max 100 characters" });
      }

      // kiểm tra trùng tên ko
      

      const column = await templateColumnService.createColumn({ template_id, name, order_index });
      res.status(201).json(column);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getByTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const columns = await templateColumnService.getColumnsByTemplate(templateId);
      res.json(columns);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const column = await templateColumnService.getColumnById(req.params.id);
      if (!column) {
        return res.status(404).json({ message: "Column not found" });
      }
      res.json(column);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await templateColumnService.updateColumn(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Column not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await templateColumnService.deleteColumn(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Column not found" });
      }
      res.json({ message: "Column deleted" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new TemplateColumnController();
