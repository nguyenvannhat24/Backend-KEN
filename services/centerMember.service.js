const centerMemberRepo = require('../repositories/centerMember.repo');
const userRepo = require('../repositories/user.repository');  // nếu có
const centerRepo = require('../repositories/center.repository'); // nếu có

class CenterMemberService {
  async addMember(center_id, user_id, role_in_center) {
    const user = await userRepo.findById(user_id);
    if (!user) throw new Error("Người dùng không tồn tại");

    const center = await centerRepo.findById(center_id);
    if (!center) throw new Error("Trung tâm không tồn tại");

    const exists = await centerMemberRepo.isMember(center_id, user_id);
    if (exists) throw new Error("Thành viên đã tồn tại trong trung tâm");

    return await centerMemberRepo.create({ center_id, user_id, role_in_center });
  }

  async getCentersByUser(user_id) {
    const members = await centerMemberRepo.findByUserId(user_id);
    return members.map(m => ({
      ...m.center_id,
      role_in_center: m.role_in_center,
      member_id: m._id
    }));
  }

  async getMembersByCenter(center_id) {
    const members = await centerMemberRepo.findByCenterId(center_id);
    return members.map(m => ({
      ...m.user_id,
      role_in_center: m.role_in_center,
      member_id: m._id
    }));
  }

  async removeMember(member_id) {
    const member = await centerMemberRepo.findById(member_id);
    if (!member) throw new Error("Không tìm thấy thành viên");
    await centerMemberRepo.delete(member_id);
    return true;
  }
}

module.exports = new CenterMemberService();
