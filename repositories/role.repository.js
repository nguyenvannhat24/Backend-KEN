const roleModel = require('../models/role.model');
const userRoleModel = require('../models/userRole.model');

/**
 * Role Repository - Xử lý logic tương tác với database cho Role
 * Chứa các methods CRUD cơ bản và tìm kiếm role
 */
class RoleRepository {

  /**
   * Tìm role theo ID
   * @param {String} id - ID của role
   * @returns {Object|null} Thông tin role hoặc null
   */
  async findById(id) {
    try {
      console.log(`📋 [RoleRepository] findById - Finding role with ID: ${id}`);
      const role = await roleModel.findById(id).lean();
      if (role) {
        console.log(`✅ [RoleRepository] findById - Found role: ${role.name}`);
      } else {
        console.log(`⚠️ [RoleRepository] findById - Role not found with ID: ${id}`);
      }
      return role;
    } catch (error) {
      console.error('❌ [RoleRepository] findById - Error:', error);
      throw error;
    }
  }

  /**
   * Tìm role theo tên
   * @param {String} name - Tên của role
   * @returns {Object|null} Thông tin role hoặc null
   */
  async findByName(name) {
    try {
      console.log(`📋 [RoleRepository] findByName - Finding role with name: ${name}`);
      const role = await roleModel.findOne({ name: name.trim() }).lean();
      if (role) {
        console.log(`✅ [RoleRepository] findByName - Found role: ${role.name}`);
      } else {
        console.log(`⚠️ [RoleRepository] findByName - Role not found with name: ${name}`);
      }
      return role;
    } catch (error) {
      console.error('❌ [RoleRepository] findByName - Error:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả roles
   * @returns {Array} Danh sách tất cả roles
   */
  async findAll() {
    try {
      console.log('📋 [RoleRepository] findAll - Getting all roles');
      const roles = await roleModel.find().lean();
      console.log(`✅ [RoleRepository] findAll - Found ${roles.length} roles`);
      return roles;
    } catch (error) {
      console.error('❌ [RoleRepository] findAll - Error:', error);
      throw error;
    }
  }

  /**
   * Tạo role mới
   * @param {Object} roleData - Dữ liệu role mới
   * @returns {Object} Role đã tạo
   */
  async create(roleData) {
    try {
      console.log('📋 [RoleRepository] create - Creating new role:', roleData);
      const newRole = await roleModel.create(roleData);
      console.log(`✅ [RoleRepository] create - Created role: ${newRole.name}`);
      return newRole;
    } catch (error) {
      console.error('❌ [RoleRepository] create - Error:', error);
      throw error;
    }
  }

  /**
   * Cập nhật role
   * @param {String} id - ID của role
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Object|null} Role đã cập nhật hoặc null
   */
  async update(id, updateData) {
    try {
      console.log(`📋 [RoleRepository] update - Updating role ID: ${id}`, updateData);
      const updatedRole = await roleModel.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      ).lean();
      
      if (updatedRole) {
        console.log(`✅ [RoleRepository] update - Updated role: ${updatedRole.name}`);
      } else {
        console.log(`⚠️ [RoleRepository] update - Role not found with ID: ${id}`);
      }
      return updatedRole;
    } catch (error) {
      console.error('❌ [RoleRepository] update - Error:', error);
      throw error;
    }
  }

  /**
   * Xóa role
   * @param {String} id - ID của role
   * @returns {Object|null} Role đã xóa hoặc null
   */
  async delete(id) {
    try {
      console.log(`📋 [RoleRepository] delete - Deleting role ID: ${id}`);
      const deletedRole = await roleModel.findByIdAndDelete(id).lean();
      
      if (deletedRole) {
        console.log(`✅ [RoleRepository] delete - Deleted role: ${deletedRole.name}`);
      } else {
        console.log(`⚠️ [RoleRepository] delete - Role not found with ID: ${id}`);
      }
      return deletedRole;
    } catch (error) {
      console.error('❌ [RoleRepository] delete - Error:', error);
      throw error;
    }
  }

  /**
   * Lấy role của user
   * @param {String} userId - ID của user
   * @returns {String|null} Tên role hoặc null
   */
  async GetRoles(userId) {
  try {
    console.log(`📋 [RoleRepository] GetRoles - Getting roles for user ID: ${userId}`);

    // Lấy tất cả role_id của user
    const userRoles = await userRoleModel.find({ user_id: userId }).lean();
    if (!userRoles || userRoles.length === 0) {
      console.log('⚠️ [RoleRepository] GetRoles - User has no roles');
      return [];
    }

    // Lấy thông tin name của từng role
    const roleIds = userRoles.map(ur => ur.role_id);
    const roles = await roleModel.find({ _id: { $in: roleIds } }).select('name').lean();

    const roleNames = roles.map(r => r.name);
    console.log(`✅ [RoleRepository] GetRoles - User ${userId} has roles: ${roleNames.join(', ')}`);
    return roleNames;

  } catch (error) {
    console.error('❌ [RoleRepository] GetRoles - Error:', error);
    throw error;
  }
}


  /**
   * Kiểm tra role có tồn tại không
   * @param {String} id - ID của role
   * @returns {Boolean} True nếu tồn tại, false nếu không
   */
  async exists(id) {
    try {
      console.log(`📋 [RoleRepository] exists - Checking if role exists with ID: ${id}`);
      const count = await roleModel.countDocuments({ _id: id });
      const exists = count > 0;
      console.log(`✅ [RoleRepository] exists - Role ${id} exists: ${exists}`);
      return exists;
    } catch (error) {
      console.error('❌ [RoleRepository] exists - Error:', error);
      throw error;
    }
  }

  /**
   * Đếm số lượng roles
   * @returns {Number} Số lượng roles
   */
  async count() {
    try {
      console.log('📋 [RoleRepository] count - Counting roles');
      const count = await roleModel.countDocuments();
      console.log(`✅ [RoleRepository] count - Total roles: ${count}`);
      return count;
    } catch (error) {
      console.error('❌ [RoleRepository] count - Error:', error);
      throw error;
    }
  }
  async getIdByName(nameRole){
    try {
       const Role = await this.findByName(nameRole);
       const RoleId = Role._id;
  return RoleId ;
    } catch (error) {
      console.error('❌ [RoleRepository] getbyID - Error:', error);
       throw error;
    }
 
  }
}


module.exports = new RoleRepository();