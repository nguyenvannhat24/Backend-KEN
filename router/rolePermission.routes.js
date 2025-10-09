const express = require('express');
const router = express.Router();
const rolePermissionController = require('../controllers/rolePermission.controller');
const { authenticateAny, authorizeAny } = require('../middlewares/auth');
// Tạo liên kết role - permission
router.post('/', rolePermissionController.create);

// Lấy tất cả
router.get('/',authenticateAny , rolePermissionController.getAll);

// Lấy theo ID
router.get('/:id', authenticateAny,rolePermissionController.getById);

// Lấy danh sách permission theo role
router.get('/role/:roleId',authenticateAny , rolePermissionController.getByRole);

// Cập nhật permisson cho từng người dùng
router.put('/RolePermission',authenticateAny , rolePermissionController.update);

// cập nhất permission cho role theo id role 
router.put('/updatePermisson', authenticateAny ,rolePermissionController.updatePermisson);


// Xóa
router.delete('/:id',authenticateAny , rolePermissionController.delete);
// lấy danh sách tên permission theo tên role
router.get('/nameRole/:name',rolePermissionController.getPermissionsByNameRole);
module.exports = router;
