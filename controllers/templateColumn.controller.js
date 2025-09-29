const templateColumnService = require("../services/templateColumn.service");

class TemplateColumnController {
  async create(req, res) {
    try {
      const { template_id, name, order_index } = req.body;
      const column = await templateColumnService.createColumn({ template_id, name, order_index });
      res.status(201).json({ success: true, data: column });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const columns = await templateColumnService.getColumns();
      res.json({ success: true, data: columns });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const column = await templateColumnService.getColumnById(req.params.id);
      if (!column) {
        return res.status(404).json({ success: false, message: "Column not found" });
      }
      res.json({ success: true, data: column });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getByTemplate(req, res) {
    try {
      const columns = await templateColumnService.getColumnsByTemplate(req.params.templateId);
      res.json({ success: true, data: columns });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await templateColumnService.updateColumn(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Column not found" });
      }
      res.json({ success: true, data: updated });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await templateColumnService.deleteColumn(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Column not found" });
      }
      res.json({ success: true, message: "Column deleted" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new TemplateColumnController();
