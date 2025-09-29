const templateSwimlaneService = require("../services/templateSwimlane.service");

class TemplateSwimlaneController {
  async create(req, res) {
    try {
      const { template_id, name, order_index } = req.body;
      const swimlane = await templateSwimlaneService.createSwimlane({ template_id, name, order_index });
      res.status(201).json({ success: true, data: swimlane });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const swimlanes = await templateSwimlaneService.getSwimlanes();
      res.json({ success: true, data: swimlanes });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const swimlane = await templateSwimlaneService.getSwimlaneById(req.params.id);
      if (!swimlane) {
        return res.status(404).json({ success: false, message: "Swimlane not found" });
      }
      res.json({ success: true, data: swimlane });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getByTemplate(req, res) {
    try {
      const swimlanes = await templateSwimlaneService.getSwimlanesByTemplate(req.params.templateId);
      res.json({ success: true, data: swimlanes });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await templateSwimlaneService.updateSwimlane(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Swimlane not found" });
      }
      res.json({ success: true, data: updated });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await templateSwimlaneService.deleteSwimlane(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Swimlane not found" });
      }
      res.json({ success: true, message: "Swimlane deleted" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new TemplateSwimlaneController();
