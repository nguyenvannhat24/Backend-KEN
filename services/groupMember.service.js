const mongoose = require("mongoose");
const groupMemberRepo = require("../repositories/groupMember.repository");
const userRepo = require("../repositories/user.repository");
const groupRepo = require("../repositories/group.repository");
const UserRole = require("../models/userRole.model"); //
class GroupMemberService {
  async checkOwner(user_id, group_id) {
    if (!mongoose.Types.ObjectId.isValid(group_id)) {
      throw new Error("group_id không hợp lệ");
    }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new Error("user_id không hợp lệ");
    }

    const user = await userRepo.findById(user_id);
    if (!user) throw new Error("Người dùng không tồn tại");

    // ✅ Nếu là System_Manager hoặc Admin thì luôn có quyền
    if (["system_manager", "admin"].includes(user.role?.toLowerCase())) {
      return true;
    }

    const member = await groupMemberRepo.findMember(user_id, group_id);
    if (!member || member.role_in_group.toLowerCase().trim() !== "người tạo") {
      throw new Error("Bạn không có quyền thực hiện hành động này");
    }
  }

  async addMember({ requester_id, user_id, group_id, role_in_group = "Người xem" }) {
    const requester = await userRepo.findById(requester_id);
    if (!requester) throw new Error("Người yêu cầu không tồn tại");

    // ✅ Cho phép System Manager hoặc Admin bỏ qua kiểm tra group
    if (!["system_manager", "admin"].includes(requester.role?.toLowerCase())) {

      const requesterMember = await groupMemberRepo.findMember(requester_id, group_id);
      if (!requesterMember) throw new Error("Bạn không phải thành viên của group này");

      const requesterRole = requesterMember.role_in_group.toLowerCase().trim();
      
      if (requesterRole !== "người tạo" && requesterRole !== "quản trị viên") {
        throw new Error("Chỉ người tạo hoặc quản trị viên mới có thể thêm thành viên :",requesterRole );
      }
      
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

  async updateMember({ requester_id, user_id, group_id, updateData }) {
  const mongoose = require('mongoose');
  
  // 🧩 Kiểm tra ID hợp lệ
  if (!mongoose.Types.ObjectId.isValid(requester_id)) throw new Error("requester_id không hợp lệ");
  if (!mongoose.Types.ObjectId.isValid(user_id)) throw new Error("user_id không hợp lệ");
  if (!mongoose.Types.ObjectId.isValid(group_id)) throw new Error("group_id không hợp lệ");

  // 🧩 Kiểm tra requester có trong group không
  const requesterMember = await groupMemberRepo.findMember(requester_id, group_id);
  if (!requesterMember) throw new Error("Bạn không phải thành viên của group này");

  const requesterRole = requesterMember.role_in_group?.toLowerCase().trim();
  const isOwner = requesterRole === "người tạo";
  const isAdmin = requesterRole === "quản trị viên";
  const isSelf = requester_id === user_id;

  // 🧩 Lấy user requester trong hệ thống (để kiểm tra có phải System_Manager không)
  const systemUser = await UserRole.findOne({ user_id: requester_id }).populate("role_id");
  const isSystemManager = systemUser?.role_id?.name === "System_Manager";

  // 🧩 Kiểm tra quyền cập nhật
  if (!isOwner && !isAdmin && !isSystemManager && !isSelf) {
    throw new Error("Bạn không có quyền cập nhật thông tin thành viên này");
  }

  const allowedFields = {};

  // 🧩 Xử lý cập nhật role_in_group
  if (updateData.role_in_group !== undefined) {
    // Chỉ Người tạo, Quản trị viên hoặc System_Manager mới được đổi role
    if (!isOwner && !isAdmin && !isSystemManager) {
      throw new Error("Chỉ Người tạo, Quản trị viên hoặc System_Manager mới có thể thay đổi role");
    }

    const validRoles = ["Người tạo", "Quản trị viên", "Người xem"];
    const newRole = updateData.role_in_group.trim();

    if (!validRoles.includes(newRole)) {
      throw new Error("role_in_group không hợp lệ");
    }

    // Nếu đang hạ cấp Người tạo xuống role khác, cần kiểm tra group vẫn còn ít nhất 1 Người tạo
    const targetMember = await groupMemberRepo.findMember(user_id, group_id);
    if (!targetMember) throw new Error("Không tìm thấy thành viên để cập nhật");

    const targetCurrentRole = targetMember.role_in_group?.trim();
    if (targetCurrentRole === "Người tạo" && newRole !== "Người tạo") {
      const owners = await groupMemberRepo.findMembersByRole(group_id, "Người tạo");
      if (owners.length <= 1) {
        throw new Error("Không thể hạ cấp Người tạo cuối cùng của group");
      }
    }

    allowedFields.role_in_group = newRole;
  }

  if (Object.keys(allowedFields).length === 0) {
    throw new Error("Không có dữ liệu hợp lệ để cập nhật");
  }

  // 🧩 Cập nhật thành viên
  const updatedMember = await groupMemberRepo.updateMember(user_id, group_id, allowedFields);
  if (!updatedMember) throw new Error("Không thể cập nhật thành viên");

  return updatedMember;
}


  async removeMember({ requester_id, user_id, group_id }) {
  const requester = await userRepo.findById(requester_id);
  if (!requester) throw new Error("Người yêu cầu không tồn tại");

  // ✅ Lấy danh sách thành viên hiện tại
  const members = await groupMemberRepo.findAllByGroup(group_id);
  if (!members || members.length === 0) {
    throw new Error("Nhóm không có thành viên nào");
  }

  // ❗ Nếu nhóm chỉ có 1 người, không cho phép xóa
  if (members.length === 1) {
    throw new Error("Không thể xóa thành viên cuối cùng của nhóm");
  }

  // ✅ System Manager/Admin được phép xóa bất kỳ ai
  if (!["system_manager", "admin"].includes(requester.role?.toLowerCase())) {
    const requesterMember = await groupMemberRepo.findMember(requester_id, group_id);
    if (!requesterMember) throw new Error("Bạn không phải thành viên của group này");

    const requesterRole = requesterMember.role_in_group.toLowerCase().trim();
    if (requesterRole !== "người tạo" && requesterRole !== "quản trị viên") {
      throw new Error("Chỉ người tạo hoặc quản trị viên mới có thể xóa thành viên");
    }

    // ❌ Không cho người tạo xóa chính mình
    if (requester_id === user_id && requesterRole === "người tạo") {
      throw new Error("Người tạo group không thể xóa chính mình");
    }
  }

  // ✅ Thực hiện xóa
  const result = await groupMemberRepo.removeMember(user_id, group_id);
  if (result.deletedCount === 0) {
    throw new Error("Không tìm thấy thành viên để xóa");
  }

  return true;
}


  async getMembers(group_id) {
    const groupRepo = require('../repositories/group.repository');
    const group = await groupRepo.findById(group_id);
    if (!group) throw new Error("Group không tồn tại hoặc đã bị xóa");
    return await groupMemberRepo.getMembersByGroup(group_id);
  }

  async selectAll() {
    const groupMembers = await groupMemberRepo.selectAll();
    if (!groupMembers) throw new Error("Không thể truy xuất dữ liệu");
    return groupMembers;
  }

  async getGroupbyUser(id) {
    const groupUser = await groupMemberRepo.getByGroupMembers(id);
    if (!groupUser) throw new Error("Không thể truy xuất dữ liệu");
    return groupUser;
  }

  async addBulkMembers({ requester_id, group_id, members }) {
    const requester = await userRepo.findById(requester_id);
    if (!requester) throw new Error("Người yêu cầu không tồn tại");

    // ✅ Cho phép System Manager hoặc Admin
    if (!["system_manager", "admin"].includes(requester.role?.toLowerCase())) {
      const requesterMember = await groupMemberRepo.findMember(requester_id, group_id);

      if (!requesterMember) throw new Error("Bạn không phải thành viên của group này");

      const requesterRole = requesterMember.role_in_group.toLowerCase().trim();
if (!["người tạo", "quản trị viên", "người quản lý"].includes(requesterRole.toLowerCase())) {
  throw new Error("Chỉ người tạo, quản trị viên hoặc người quản lý mới có thể thêm thành viên");
}

    }

    if (!Array.isArray(members) || members.length === 0) {
      throw new Error("Danh sách thành viên không hợp lệ");
    }
    if (members.length > 50) {
      throw new Error("Không thể thêm quá 50 thành viên cùng lúc");
    }

    const group = await groupRepo.findById(group_id);
    if (!group) throw new Error("Group không tồn tại");

    const results = { success: [], errors: [], total: members.length };

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      try {
        if (!member.user_id) {
          results.errors.push({ index: i, error: "user_id là bắt buộc" });
          continue;
        }

        const user = await userRepo.findById(member.user_id);
        if (!user) {
          results.errors.push({ index: i, error: "Người dùng không tồn tại" });
          continue;
        }

        const existing = await groupMemberRepo.findMember(member.user_id, group_id);
        if (existing) {
          results.errors.push({ index: i, error: "User đã là thành viên trong group này" });
          continue;
        }

        const role_in_group = member.role_in_group || "Người xem";
        const newMember = await groupMemberRepo.addMember({ user_id: member.user_id, group_id, role_in_group });

        results.success.push({
          index: i,
          user_id: member.user_id,
          username: user.username,
          email: user.email,
          role_in_group: role_in_group,
          member_id: newMember._id
        });
      } catch (error) {
        results.errors.push({ index: i, error: error.message });
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
