const mongoose = require("mongoose");
const groupMemberRepo = require("../repositories/groupMember.repository");
const userRepo = require("../repositories/user.repository");
const groupRepo = require("../repositories/group.repository");

class GroupMemberService {
  // Kiểm tra quyền "Người tạo"
  async checkOwner(user_id, group_id) {
    if (!mongoose.Types.ObjectId.isValid(group_id)) {
      throw new Error("group_id không hợp lệ");
    }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new Error("user_id không hợp lệ");
    }

    const member = await groupMemberRepo.findMember(user_id, group_id);
    console.log("⚡ [DEBUG] checkOwner member:", member);

    if (!member || member.role_in_group.toLowerCase().trim() !== "người tạo") {
      throw new Error("Bạn không có quyền thực hiện hành động này");
    }
  }

  // Thêm thành viên vào group (mặc định role là "Người xem")
  async addMember({ requester_id, user_id, group_id, role_in_group = "Người xem" }) {
    console.log('🔍 [DEBUG] addMember params:', { requester_id, user_id, group_id, role_in_group });
    
    // Validate ObjectId trước
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new Error("user_id không hợp lệ");
    }
    if (!mongoose.Types.ObjectId.isValid(group_id)) {
      throw new Error("group_id không hợp lệ");
    }
    if (!mongoose.Types.ObjectId.isValid(requester_id)) {
      throw new Error("requester_id không hợp lệ");
    }

    const user = await userRepo.findById(user_id);
    if (!user) throw new Error("Người dùng không tồn tại");

    const group = await groupRepo.findById(group_id);
    if (!group) throw new Error("Group không tồn tại");

    const existing = await groupMemberRepo.findMember(user_id, group_id);
    if (existing) throw new Error("User đã là thành viên trong group này");

    // Kiểm tra quyền sau khi validate
    await this.checkOwner(requester_id, group_id);

    return await groupMemberRepo.addMember({ user_id, group_id, role_in_group });
  }

  // Cập nhật role
 async updateRole({ requester_id, user_id, group_id, role_in_group }) {
    // Kiểm tra hợp lệ
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(requester_id)) throw new Error("requester_id không hợp lệ");
    if (!mongoose.Types.ObjectId.isValid(user_id)) throw new Error("user_id không hợp lệ");
    if (!mongoose.Types.ObjectId.isValid(group_id)) throw new Error("group_id không hợp lệ");

    const validRoles = ["Người tạo", "Quản trị viên", "Người xem"];
    if (!role_in_group || !validRoles.includes(role_in_group.trim())) 
        throw new Error("role_in_group không hợp lệ");

    // Kiểm tra quyền owner
    await this.checkOwner(requester_id, group_id);

    // Cập nhật role
    const member = await groupMemberRepo.updateRole(user_id, group_id, role_in_group.trim());
    if (!member) throw new Error("Không tìm thấy thành viên để cập nhật");

    return member;
}


  // Xóa thành viên
  async removeMember({ requester_id, user_id, group_id }) {
    await this.checkOwner(requester_id, group_id);

    const result = await groupMemberRepo.removeMember(user_id, group_id);
    if (result.deletedCount === 0) throw new Error("Không tìm thấy thành viên để xóa");

    return true;
  }

  // Lấy danh sách thành viên theo group
  async getMembers(group_id) {
    return await groupMemberRepo.getMembersByGroup(group_id);
  }

  // Lấy tất cả group members
  async selectAll() {
    const groupMembers = await groupMemberRepo.selectAll();
    if (!groupMembers) throw new Error("Không thể truy xuất dữ liệu");
    return groupMembers;
  }
}

module.exports = new GroupMemberService();
