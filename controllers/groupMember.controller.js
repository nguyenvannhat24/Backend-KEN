const groupMemberService = require("../services/groupMember.service");

class GroupMemberController {
  // Thêm thành viên
  async addMember(req, res) {
    try {
      const requester_id = req.user?.id; // Lấy từ token
      const { user_id, group_id, role_in_group } = req.body;

      console.log('🔍 [DEBUG] addMember - requester_id:', requester_id);
      console.log('🔍 [DEBUG] addMember - user_id:', user_id);
      console.log('🔍 [DEBUG] addMember - group_id:', group_id);

      const member = await groupMemberService.addMember({
        requester_id,
        user_id,
        group_id,
        role_in_group,
      });

      res.status(201).json({ success: true, data: member });
    } catch (err) {
      console.error('❌ [addMember ERROR]:', err.message);
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

  // Lấy danh sách thành viên theo group_id (URL parameter)
  async getMembersByGroup(req, res) {
    try {
      const { group_id } = req.params;
      console.log('🔍 [DEBUG] getMembersByGroup - group_id:', group_id);
      
      const members = await groupMemberService.getMembers(group_id);
      console.log('🔍 [DEBUG] getMembersByGroup - members:', members);
      
      res.json({ success: true, data: members });
    } catch (err) {
      console.error('❌ [getMembersByGroup ERROR]:', err.message);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Cập nhật role
  async updateRole(req, res) {
    try {
      const requester_id = req.user?.id; // Lấy từ token
      const { user_id, group_id, role_in_group } = req.body;

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
      const requester_id = req.user?.id; // Lấy từ token
      const { user_id, group_id } = req.body;

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
async selecGroupUser(req, res) {
  try {
    let { id_user } = req.body;

    // Nếu frontend không truyền thì lấy id từ token
    if (!id_user) {
      id_user = req.user.id;
    }
    console.log(id_user);
    console.log("idSSO (keycloak):", req.user.idSSO);

    if (!id_user) {
      return res.status(400).json({ success: false, message: "id_user is required" });
    }

    const groups = await groupMemberService.getGroupbyUser(id_user);
    res.json({ success: true, data: groups });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

  
}

module.exports = new GroupMemberController();
