const groupMemberService = require("../services/groupMember.service");

class GroupMemberController {
  // Thêm thành viên
  async addMember(req, res) {
    try {
      const { requester_id, user_id, group_id, role_in_group } = req.body;

      const member = await groupMemberService.addMember({
        requester_id,
        user_id,
        group_id,
        role_in_group,
      });

      res.status(201).json({ success: true, data: member });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Lấy danh sách thành viên theo group
  async getMembers(req, res) {
    try {
      const { group_id } = req.body;
      const members = await groupMemberService.getMembers(group_id);
      res.json({ success: true, data: members });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Cập nhật role
  async updateRole(req, res) {
    try {
      const { requester_id, user_id, group_id, role_in_group } = req.body;

      const member = await groupMemberService.updateRole({
        requester_id,
        user_id,
        group_id,
        role_in_group,
      });

      res.json({ success: true, data: member });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Xóa thành viên
  async removeMember(req, res) {
    try {
      const { requester_id, user_id, group_id } = req.body;

      await groupMemberService.removeMember({
        requester_id,
        user_id,
        group_id,
      });

      res.json({ success: true, message: "Xóa thành công" });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Xem tất cả group members
  async selectAll(req, res) {
    try {
      const groupMembers = await groupMemberService.selectAll();
      res.json({ success: true, data: groupMembers });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // tìm người dùng đang có bao nhiêu group
  async selecGroupUser(req,res){
    try{
      const {id_user} = req.body;
     const Group = await groupMemberService.getGroupbyUser(id_user);
     res.json({success: true, data: Group });
    }catch(err){
     res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new GroupMemberController();
