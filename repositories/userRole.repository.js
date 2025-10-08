const UserRole = require("../models/userRole.model");
const Role = require("../models/role.model");

class UserRoleRepository {
    // Tìm role theo user_id
    async findRoleByUser(userId) {
        const userRole = await UserRole.findOne({ user_id: userId.toString() }).lean();
        if (!userRole) return null;

        const role = await Role.findById(userRole.role_id).lean();
        return role;
    }

    // Lấy tất cả UserRole
    async findAll() {
        return await UserRole.find().lean();
    }

    // Lấy tất cả role theo user_id (nếu 1 user có nhiều role)
    async findRolesByUser(userId) {
        return await UserRole.find({ user_id: userId.toString() })
            .populate("role_id") // trả thêm thông tin role
            .lean();
    }

    // Thêm mới user-role
    async create(userRoleData) {
        return await UserRole.create(userRoleData);
    }

    // Cập nhật role của user
    async update(userRoleId, updateData) {
        return await UserRole.findByIdAndUpdate(userRoleId, updateData, { new: true }).lean();
    }

    // Xóa user-role theo id
    async delete(userRoleId) {
        return await UserRole.findByIdAndDelete(userRoleId).lean();
    }

    // Xóa tất cả role của 1 user
    async deleteByUser(userId) {
        return await UserRole.deleteMany({ user_id: userId.toString() });
    }

    async  findByUserAndRole(user_id, role_id){
        return await UserRole.findOne({ user_id, role_id });
    }

}

module.exports = new UserRoleRepository();
