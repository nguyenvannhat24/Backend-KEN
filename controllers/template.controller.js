const templateService = require('../services/template.service');

class TemplateController {
  async create(req, res) {
    try {
      const { name, description, created_by } = req.body;

      // ✅ Kiểm tra dữ liệu đầu vào
      if (!name || name.length > 200) {
        return res.status(400).json({ message: "Name is required and max 200 characters" });
      }
      if (description && description.length > 500) {
        return res.status(400).json({ message: "Description max 500 characters" });
      }
      if (!created_by) {
        return res.status(400).json({ message: "created_by is required" });
      }

      const template = await templateService.createTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const templates = await templateService.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      // ✅ Kiểm tra id
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid template id" });
      }

      const template = await templateService.getTemplateById(id);
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      // ✅ Kiểm tra id
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid template id" });
      }

      // ✅ Kiểm tra input
      if (name && name.length > 200) {
        return res.status(400).json({ message: "Name max 200 characters" });
      }
      if (description && description.length > 500) {
        return res.status(400).json({ message: "Description max 500 characters" });
      }

      const updated = await templateService.updateTemplate(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: 'Template not found' });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      // ✅ Kiểm tra id
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid template id" });
      }

      const deleted = await templateService.deleteTemplate(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Template not found' });
      }
      res.json({ message: 'Template deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
 


}

module.exports = new TemplateController();
