const mongoose = require('mongoose');
const groupRepo = require('../repositories/group.repository');
const groupMemberService = require("./groupMember.service");
const groupMemberRepo = require('../repositories/groupMember.repository');
class GroupService {
  // Tạo group mới
  async createGroup({ center_id, name,  userId ,description }) {
    

    if (!userId) throw new Error("userId là bắt buộc");

    // Kiểm tra name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error("Tên group là bắt buộc và phải là chuỗi hợp lệ");
    }

    // Kiểm tra độ dài name
    if (name.length > 200) {
      throw new Error("Tên group không được dài quá 200 ký tự");
    }

    // Kiểm tra description
    if (description && description.length > 300) {
      throw new Error("Description không được dài quá 300 ký tự");
    }

    // Kiểm tra center_id hợp lệ
    if (center_id && !mongoose.Types.ObjectId.isValid(center_id)) {
      throw new Error("center_id không hợp lệ");
    }
     if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("center_id không hợp lệ");
    }

        // ❌ Kiểm tra trùng tên group trong cùng center
    const existing = await groupRepo.findOne({ center_id, name: name.trim() });
    if (existing) {
      throw new Error("Tên group đã tồn tại trong center này");
    }
    
    // Tạo group mới
    const group = await groupRepo.create({ center_id, name, description });

    // Thêm người tạo vào GroupMember
   await groupMemberRepo.addMember({
    group_id: group._id,
    user_id: userId,
    role_in_group: "Người tạo",
  });

    return group;
  }

  // Lấy group theo ID
  async getGroupById(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID group không hợp lệ");
    }

    const group = await groupRepo.findById(id);
    if (!group) throw new Error("Group không tồn tại");
    return group;
  }

  // Lấy tất cả group
  async getAllGroups() {
    return await groupRepo.findAll();
  }

  // Cập nhật group
  async updateGroup(id, data) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID group không hợp lệ");
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

  // Xoá group
  async deleteGroup(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID group không hợp lệ");
    }

    const deleted = await groupRepo.delete(id);
    if (!deleted) throw new Error("Không tìm thấy group để xoá");
    return true;
  }
}

module.exports = new GroupService();
