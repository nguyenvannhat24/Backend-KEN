const express = require('express');
const router = express.Router();
const rolePermissionController = require('../controllers/rolePermission.controller');

// Tạo liên kết role - permission
router.post('/', rolePermissionController.create);

// Lấy tất cả
router.get('/', rolePermissionController.getAll);

// Lấy theo ID
router.get('/:id', rolePermissionController.getById);

// Lấy danh sách permission theo role
router.get('/role/:roleId', rolePermissionController.getByRole);

// Cập nhật
router.put('/RolePermission', rolePermissionController.update);



// Xóa
router.delete('/:id', rolePermissionController.delete);
// lấy danh sách tên permission theo tên role
router.get('/nameRole/:name',rolePermissionController.getPermissionsByNameRole);
module.exports = router;
