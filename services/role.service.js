const RoleRepository = require('../repositories/role.repository');

class RoleService {

    async viewRole(userId) {
        const roleName = await RoleRepository.GetRole(userId);
        return roleName;
    }

}

module.exports = new RoleService();