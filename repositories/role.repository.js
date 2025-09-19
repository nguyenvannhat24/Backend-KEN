const roleModel = require('../models/Role.model.js');
const userRoleModel = require('../models/UserRole.model.js');

class RoleRepository {

    async findById(id) {
        return roleModel.findById(id).lean();
    }

    async GetRole(userId) {
        // Tìm trong UserRole để lấy role_id
        const userRole = await userRoleModel.findOne({ user_id: userId }).lean();
        if (!userRole){
            console.log('không tìm thấy id người dùng trong bảng userRole');
            return null
        };

        // Tìm role theo role_id
        const role = await roleModel.findById(userRole.role_id).select('name').lean();
        return role ? role.name : null;
    }

}   

module.exports = new RoleRepository();
