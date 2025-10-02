const express = require('express');
const commentController = require('../controllers/comment.controller');
const { authenticateAny } = require('../middlewares/auth');

const router = express.Router();

/**
 * Comment Routes - Quản lý comments cho tasks
 * Tất cả routes đều cần authentication
 */

// ==================== AUTHENTICATED ROUTES ====================

// Tạo comment mới - Story 23
router.post('/', authenticateAny, commentController.create);

// Lấy comments của task - Story 23
router.get('/task/:taskId', authenticateAny, commentController.getByTask);

// Lấy comment theo ID
router.get('/:id', authenticateAny, commentController.getById);

// Cập nhật comment - Story 23
router.put('/:id', authenticateAny, commentController.update);

// Xóa comment - Story 23
router.delete('/:id', authenticateAny, commentController.delete);

// Lấy comments của user hiện tại
router.get('/user/my', authenticateAny, commentController.getByUser);

module.exports = router;
