const groupService = require('../services/group.service');

class GroupController {
  async create(req, res) {
    try {
        
      const group = await groupService.createGroup(req.body);
      res.json({ success: true, data: group });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const group = await groupService.getGroupById(req.params.id);
      res.json({ success: true, data: group });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const groups = await groupService.getAllGroups();
      res.json({ success: true, data: groups });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const group = await groupService.updateGroup(req.params.id, req.body);
      res.json({ success: true, data: group });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      await groupService.deleteGroup(req.params.id);
      res.json({ success: true, message: "Xoá group thành công" });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new GroupController();
