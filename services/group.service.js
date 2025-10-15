const mongoose = require('mongoose');
const groupRepo = require('../repositories/group.repository');
const groupMemberService = require("./groupMember.service");
const groupMemberRepo = require('../repositories/groupMember.repository');

class GroupService {
  async createGroup({ center_id, name, userId, description }) {
    if (!userId) throw new Error("userId là bắt buộc");
    if (!name || typeof name !== "string" || name.trim() === "")
      throw new Error("Tên group là bắt buộc và phải là chuỗi hợp lệ");

    try {
      center_id = new mongoose.Types.ObjectId(center_id);
    } catch (err) {
      throw new Error("center_id không hợp lệ");
    }

    try {
      userId = new mongoose.Types.ObjectId(userId);
    } catch (err) {
      throw new Error("userId không hợp lệ");
    }

    const existing = await groupRepo.findOne(center_id, name.trim());
    if (existing) throw new Error("Tên group đã tồn tại trong center này");

    const group = await groupRepo.create({ center_id, name: name.trim(), description });

  
  await groupMemberRepo.addMember({
    group_id: group._id,
    user_id: userId,
    role_in_group: "Người tạo",
  });

  return group;
}

  async getGroupById(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID group không hợp lệ");
    }

    const group = await groupRepo.findById(id);
    if (!group) throw new Error("Group không tồn tại");
    return group;
  }

  async getAllGroups() {
    return await groupRepo.findAll();
  }

  async getUserGroups(userId) {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("userId không hợp lệ");
    }

    return await groupMemberRepo.getByGroupMembers(userId);
  }

  async updateGroup(id, data, userId) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID group không hợp lệ");
    }

    const groupMember = await groupMemberRepo.findMember(userId, id);
    if (!groupMember || groupMember.role_in_group !== 'Người tạo') {
      throw new Error("Chỉ người tạo group mới được cập nhật group");
    }

    const updateData = {};

    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || data.name.trim() === '') {
        throw new Error("Tên group phải là chuỗi hợp lệ");
      }
      if (data.name.length > 200) {
        throw new Error("Tên group không được dài quá 200 ký tự");
      }
      updateData.name = data.name.trim();
    }

    if (data.description !== undefined) {
      if (data.description.length > 300) {
        throw new Error("Description không được dài quá 300 ký tự");
      }
      updateData.description = data.description;
    }

    if (data.center_id !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(data.center_id)) {
        throw new Error("center_id không hợp lệ");
      }
      updateData.center_id = data.center_id;
    }

    const updated = await groupRepo.update(id, updateData);
    if (!updated) throw new Error("Không tìm thấy group để cập nhật");
    return updated;
  }

  async deleteGroup(id, userId) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID group không hợp lệ");
    }

    const groupMember = await groupMemberRepo.findMember(userId, id);
    if (!groupMember || groupMember.role_in_group !== 'Người tạo') {
      throw new Error("Chỉ người tạo group mới được xóa group");
    }

    const deleted = await groupRepo.softDelete(id);
    if (!deleted) throw new Error("Không tìm thấy group để xoá");

    await groupMemberRepo.deleteAllByGroup(id);

    return true;
  }

  async adminDeleteGroup(id, adminId) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID group không hợp lệ");
    }

    const admin = await userService.getUserById(adminId);
    if (!admin || !admin.roles.includes('admin')) {
      throw new Error("Chỉ admin hệ thống mới có quyền này");
    }

    const group = await groupRepo.findById(id);
    if (!group) throw new Error("Group không tồn tại");

    const deleted = await groupRepo.softDelete(id);
    if (!deleted) throw new Error("Không thể xóa group");

    await groupMemberRepo.deleteAllByGroup(id);

    return true;
  }

}

module.exports = new GroupService();
