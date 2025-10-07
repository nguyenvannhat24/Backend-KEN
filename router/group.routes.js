const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const { authenticateAny, authorizeAny } = require('../middlewares/auth');

/**
 * Group Router - quản lý groups
 * Base path: /api/group
 */

// ==================== GROUP ROUTES ====================

// Tạo group mới (cần quyền quản lý group hoặc admin)
router.post(
  '/',
  authenticateAny,
  authorizeAny('ROLE_MANAGE_GROUP'),
  groupController.create
);

// Lấy tất cả group của user (cần login)
router.get(
  '/',
  authenticateAny,
  groupController.getAll // lọc theo status và groups của user
);

// Lấy group theo ID (cần quyền xem group)
router.get(
  '/:id',
  authenticateAny,
  authorizeAny('ROLE_VIEW_GROUP'),
  groupController.getById
);

// Cập nhật group (cần quyền quản lý group)
router.put(
  '/:id',
  authenticateAny,
  authorizeAny('ROLE_MANAGE_GROUP'),
  groupController.update
);

// Xóa group (cần quyền quản lý group)
router.delete(
  '/:id',
  authenticateAny,
  authorizeAny('ROLE_MANAGE_GROUP'),
  groupController.delete
);

// Admin only - xem tất cả groups
router.get(
  '/admin/all',
  authenticateAny,
  authorizeAny('admin'),
  async (req, res) => {
    try {
      const groupService = require('../services/group.service');
      const groups = await groupService.getAllGroups();
      res.json({ success: true, data: groups });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
