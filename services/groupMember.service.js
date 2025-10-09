const mongoose = require("mongoose");
const groupMemberRepo = require("../repositories/groupMember.repository");
const userRepo = require("../repositories/user.repository");
const groupRepo = require("../repositories/group.repository");

class GroupMemberService {
  async checkOwner(user_id, group_id) {
    if (!mongoose.Types.ObjectId.isValid(group_id)) {
      throw new Error("group_id không hợp lệ");
    }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new Error("user_id không hợp lệ");
    }

    const member = await groupMemberRepo.findMember(user_id, group_id);
    console.log("⚡ [DEBUG] checkOwner member:", member);

    if (!member || member.role_in_group.trim() !== "Người tạo") {
      throw new Error("Bạn không có quyền thực hiện hành động này");
    }
  }
  async addMember({ requester_id, user_id, group_id, role_in_group = "Người xem" }) {
    // Kiểm tra quyền - người tạo hoặc quản trị viên
    const requesterMember = await groupMemberRepo.findMember(requester_id, group_id);
    if (!requesterMember) throw new Error("Bạn không phải thành viên của group này");
    
    const requesterRole = requesterMember.role_in_group.trim();
    if (requesterRole !== "Người tạo" && requesterRole !== "Quản trị viên") {
      throw new Error("Chỉ người tạo hoặc quản trị viên mới có thể thêm thành viên");
    }

    const user = await userRepo.findById(user_id);
    if (!user) throw new Error("Người dùng không tồn tại");

    const group = await groupRepo.findById(group_id);
    if (!group) throw new Error("Group không tồn tại");

    // Không cần validation center_id theo yêu cầu Backlog

    const existing = await groupMemberRepo.findMember(user_id, group_id);
    if (existing) throw new Error("User đã là thành viên trong group này");

    return await groupMemberRepo.addMember({ user_id, group_id, role_in_group });
  }

  // Cập nhật thông tin thành viên (bao gồm role)
  async updateMember({ requester_id, user_id, group_id, updateData }) {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(requester_id)) throw new Error("requester_id không hợp lệ");
    if (!mongoose.Types.ObjectId.isValid(user_id)) throw new Error("user_id không hợp lệ");
    if (!mongoose.Types.ObjectId.isValid(group_id)) throw new Error("group_id không hợp lệ");
    
    const requesterMember = await groupMemberRepo.findMember(requester_id, group_id);
    if (!requesterMember) throw new Error("Bạn không phải thành viên của group này");
    
    const isOwner = requesterMember.role_in_group.trim() === "Người tạo";
    const isSelf = requester_id === user_id;
    const targetMember = await groupMemberRepo.findMember(user_id, group_id);
    if (!targetMember) throw new Error("Không tìm thấy thành viên để cập nhật");

    const allowedFields = {};
    
    if (updateData.role_in_group !== undefined) {
      if (!isOwner) throw new Error("Chỉ người tạo group mới có thể thay đổi role");
      if (isSelf) throw new Error("Người tạo group không thể thay đổi quyền của chính mình");
      if (updateData.role_in_group.trim() === "Người tạo") throw new Error("Không thể thay đổi role thành 'Người tạo'. Mỗi group chỉ có 1 người tạo");
      
      const isTargetOwner = targetMember.role_in_group.trim() === "Người tạo";
      if (isTargetOwner) throw new Error("Không thể thay đổi role của người tạo group");
      
      const validRoles = ["Quản trị viên", "Người xem"];
      if (!validRoles.includes(updateData.role_in_group.trim())) {
        throw new Error("role_in_group không hợp lệ. Chỉ chấp nhận: Quản trị viên, Người xem");
      }
      allowedFields.role_in_group = updateData.role_in_group.trim();
    }

    if (Object.keys(allowedFields).length === 0) {
      throw new Error("Không có dữ liệu hợp lệ để cập nhật");
    }
    
    const updatedMember = await groupMemberRepo.updateMember(user_id, group_id, allowedFields);
    if (!updatedMember) throw new Error("Không thể cập nhật thành viên");
    return updatedMember;
  }
  async removeMember({ requester_id, user_id, group_id }) {
    // Kiểm tra quyền - người tạo hoặc quản trị viên
    const requesterMember = await groupMemberRepo.findMember(requester_id, group_id);
    if (!requesterMember) throw new Error("Bạn không phải thành viên của group này");
    
    const requesterRole = requesterMember.role_in_group.trim();
    if (requesterRole !== "Người tạo" && requesterRole !== "Quản trị viên") {
      throw new Error("Chỉ người tạo hoặc quản trị viên mới có thể xóa thành viên");
    }

    // Người tạo không thể xóa chính mình
    if (requester_id === user_id && requesterRole === "Người tạo") {
      throw new Error("Người tạo group không thể xóa chính mình");
    }

    const result = await groupMemberRepo.removeMember(user_id, group_id);
    if (result.deletedCount === 0) throw new Error("Không tìm thấy thành viên để xóa");
    return true;
  }
  // Lấy danh sách thành viên theo group
  async getMembers(group_id) {
    const groupRepo = require('../repositories/group.repository');
    const group = await groupRepo.findById(group_id);
    if (!group) throw new Error("Group không tồn tại hoặc đã bị xóa");
    return await groupMemberRepo.getMembersByGroup(group_id);
  }

  // Lấy tất cả group members
  async selectAll() {
    const groupMembers = await groupMemberRepo.selectAll();
    if (!groupMembers) throw new Error("Không thể truy xuất dữ liệu");
    return groupMembers;
  }
  // lấy danh sách group mà người dùng có
  async getGroupbyUser(id){
    const groupUser = await groupMemberRepo.getByGroupMembers(id);
    if(!groupUser){
      throw new Error("Không thể truy xuất dữ liệu");
    };
    return groupUser;
  }
  async addBulkMembers({ requester_id, group_id, members }) {
    // Kiểm tra quyền - người tạo hoặc quản trị viên
    const requesterMember = await groupMemberRepo.findMember(requester_id, group_id);
    if (!requesterMember) throw new Error("Bạn không phải thành viên của group này");
    
    const requesterRole = requesterMember.role_in_group.trim();
    if (requesterRole !== "Người tạo" && requesterRole !== "Quản trị viên") {
      throw new Error("Chỉ người tạo hoặc quản trị viên mới có thể thêm thành viên");
    }

    // Validate input
    if (!Array.isArray(members) || members.length === 0) {
      throw new Error("Danh sách thành viên không hợp lệ");
    }
    if (members.length > 50) {
      throw new Error("Không thể thêm quá 50 thành viên cùng lúc");
    }
    const group = await groupRepo.findById(group_id);
    if (!group) throw new Error("Group không tồn tại");
    const results = {
      success: [],
      errors: [],
      total: members.length
    };

    // Xử lý từng thành viên
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      try {
        // Validate member data
        if (!member.user_id) {
          results.errors.push({
            index: i,
            user_id: member.user_id || 'unknown',
            error: 'user_id là bắt buộc'
          });
          continue;
        }

        // Kiểm tra user tồn tại
        const user = await userRepo.findById(member.user_id);
        if (!user) {
          results.errors.push({
            index: i,
            user_id: member.user_id,
            error: 'Người dùng không tồn tại'
          });
          continue;
        }

        // Không cần validation center_id theo yêu cầu Backlog

        // Kiểm tra đã là thành viên chưa
        const existing = await groupMemberRepo.findMember(member.user_id, group_id);
        if (existing) {
          results.errors.push({
            index: i,
            user_id: member.user_id,
            error: 'User đã là thành viên trong group này'
          });
          continue;
        }

        // Thêm thành viên
        const role_in_group = member.role_in_group || "Người xem";
        const newMember = await groupMemberRepo.addMember({ 
          user_id: member.user_id, 
          group_id, 
          role_in_group 
        });

        results.success.push({
          index: i,
          user_id: member.user_id,
          username: user.username,
          email: user.email,
          role_in_group: role_in_group,
          member_id: newMember._id
        });

      } catch (error) {
        results.errors.push({
          index: i,
          user_id: member.user_id || 'unknown',
          error: error.message
        });
      }
    }

    return results;
  }

  // Xóa thành viên (Admin hệ thống)
  async adminRemoveMember({ admin_id, user_id, group_id }) {
    const mongoose = require('mongoose');
    
    // Validate input
    if (!mongoose.Types.ObjectId.isValid(admin_id)) {
      throw new Error("admin_id không hợp lệ");
    }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new Error("user_id không hợp lệ");
    }
    if (!mongoose.Types.ObjectId.isValid(group_id)) {
      throw new Error("group_id không hợp lệ");
    }

    // Kiểm tra group tồn tại
    const group = await groupRepo.findById(group_id);
    if (!group) throw new Error("Group không tồn tại");

    // Kiểm tra thành viên tồn tại
    const member = await groupMemberRepo.findMember(user_id, group_id);
    if (!member) throw new Error("Thành viên không tồn tại trong group này");

    // Admin có thể xóa bất kỳ thành viên nào (kể cả người tạo)
    const result = await groupMemberRepo.removeMember(user_id, group_id);
    if (result.deletedCount === 0) throw new Error("Không thể xóa thành viên");
    
    return true;
  }

}

module.exports = new GroupMemberService();
