const templateService = require('../services/template.service');

class TemplateController {
  async create(req, res) {
    try {
      const userId = req.user?.id;
      const { name, description } = req.body;
      const tpl = await templateService.createTemplate({ name, description, userId });
      res.status(201).json({ success: true, data: tpl });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async list(req, res) {
    try {
      const id_user = req.user?.id;
      if(!id_user){
        return;
      }

      const tpls = await templateService.listTemplates(id_user);
      res.json({ success: true, data: tpls });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const tpl = await templateService.getTemplateById(req.params.id);
      res.json({ success: true, data: tpl });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const userId = req.user?.id;
      const updated = await templateService.updateTemplate(req.params.id, req.body, userId);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async remove(req, res) {
    try {
      const userId = req.user?.id;
      await templateService.deleteTemplate(req.params.id, userId);
      res.json({ success: true, message: 'Xóa template thành công' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new TemplateController();