const GroupMember = require("../models/groupMember.model");

class GroupMemberRepository {
  // Thêm thành viên vào group
  async addMember({ group_id, user_id, role_in_group }) {
    const member = new GroupMember({ group_id, user_id, role_in_group });
    return await member.save();
  }

  // Kiểm tra thành viên đã có trong group chưa
 // Kiểm tra thành viên đã có trong group chưa
async findMember(user_id, group_id) {
  const member = await GroupMember.findOne({ user_id, group_id }).lean();
  console.log("⚡ [DEBUG] findMember result:", member); // log ra kết quả
  return member;
}


  // Lấy danh sách thành viên theo group
  async getMembersByGroup(group_id) {
    console.log('🔍 [DEBUG] getMembersByGroup - group_id:', group_id);
    
    const members = await GroupMember.find({ group_id })
      .populate("user_id", "username email full_name")
      .lean();
    
    console.log('🔍 [DEBUG] getMembersByGroup - found members:', members);
    return members;
  }

  // Cập nhật role
  async updateRole(user_id, group_id, role_in_group) {
    return await GroupMember.findOneAndUpdate(
      { user_id, group_id },
      { role_in_group },
      { new: true }
    ).lean();
  }

  // Cập nhật thông tin thành viên (tổng quát)
  async updateMember(user_id, group_id, updateData) {
    return await GroupMember.findOneAndUpdate(
      { user_id, group_id },
      updateData,
      { new: true }
    ).lean();
  }

  // Xóa thành viên khỏi group
  async removeMember(user_id, group_id) {
    return await GroupMember.deleteOne({ user_id, group_id });
  }

  // xem membergroup
async selectAll() {
    return await GroupMember.find().lean();
  }

  // lấy danh sách group theo id người dùng
  async getByGroupMembers(user_id){
     return await GroupMember.find({ user_id })
      .populate("group_id", "id name description ")
      .lean();
  }

  // Xóa tất cả group members của một group
  async deleteAllByGroup(group_id) {
    return await GroupMember.deleteMany({ group_id });
  }
}

module.exports = new GroupMemberRepository();
