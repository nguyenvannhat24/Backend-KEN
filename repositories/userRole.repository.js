const UserRole = require("../models/UserRole.model.js");
const Role = require("../models/Role.model.js");

class UserRoleRepository {
    async findRoleByUser(userId) {
       const userRole = await UserRole.findOne({ user_id: userId.toString() }).lean();
        if (!userRole) return null;

        const role = await Role.findById(userRole.role_id).lean();
        return role;
    }

    async findAll() {
        return await UserRole.find().lean(); // lấy tất cả user-role
    }
}

module.exports = new UserRoleRepository();
