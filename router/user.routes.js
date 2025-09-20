const express = require('express');
const userController = require('../controllers/user.controller');

const router = express.Router();

// Lấy toàn bộ user
router.get('/selectAll', userController.SelectAll);

// Lấy theo id
router.get('/:id', userController.getById);

// Lấy theo email
router.get('/email/:email', userController.getByEmail);

// Lấy theo name
router.get('/name/:name', userController.getByName);

// Lấy theo số điện thoại
router.get('/phone/:numberphone', userController.getByNumberPhone);

// Tạo mới user
router.post('/', userController.create);

// Cập nhật user
router.put('/:id', userController.update);

// Xóa user
router.delete('/:id', userController.delete);

module.exports = router;
