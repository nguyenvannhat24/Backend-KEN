// router/permission.routes.js
const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permission.controller');
const { authenticateAny, authorizeAny } = require('../middlewares/auth');

// ==================== PERMISSION ROUTES ====================

// Tạo permission mới (chỉ admin / manage permission)
router.post(
  '/',
  authenticateAny,
  authorizeAny('ROLE_MANAGE_PERMISSION'),
  permissionController.create
);

// Lấy tất cả permission (xem permission)
router.get(
  '/',
  authenticateAny,
  authorizeAny('ROLE_VIEW'),
  permissionController.getAll
);

// Lấy permission theo ID
router.get(
  '/:id',
  authenticateAny,
  authorizeAny('ROLE_VIEW'),
  permissionController.getById
);

// Cập nhật permission (chỉ admin / manage permission)
router.put(
  '/:id',
  authenticateAny,
  authorizeAny('ROLE_MANAGE_PERMISSION'),
  permissionController.update
);

// Xóa permission (chỉ admin / manage permission)
router.delete(
  '/:id',
  authenticateAny,
  authorizeAny('ROLE_MANAGE_PERMISSION'),
  permissionController.delete
);

module.exports = router;
