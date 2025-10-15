const groupService = require('../services/group.service');

class GroupController {
  async create(req, res) {
    try {
      
      const userId = req.user?.id;
      const { center_id, name, description } = req.body;
      
      const group = await groupService.createGroup({ 
        center_id, 
        name, 
        description, 
        userId 
      });
      res.json({ success: true, data: group });
    } catch (err) {
      console.error('❌ [GROUP CREATE ERROR]:', err.message);
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
      const userId = req.user?.id;
      const groups = await groupService.getUserGroups(userId);
      res.json({ success: true, data: groups });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const userId = req.user?.id;
      const group = await groupService.updateGroup(req.params.id, req.body, userId);
      res.json({ success: true, data: group });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const userId = req.user?.id;
      await groupService.deleteGroup(req.params.id, userId);
      res.json({ success: true, message: "Xoá group thành công" });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Xóa group (Admin hệ thống)
  async adminDelete(req, res) {
    try {
      const adminId = req.user?.id;
      await groupService.adminDeleteGroup(req.params.id, adminId);
      res.json({ success: true, message: "Admin xóa group thành công" });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new GroupController();
