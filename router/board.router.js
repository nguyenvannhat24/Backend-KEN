const express = require('express');
const router = express.Router();
const { authenticateAny, authorizeAny } = require('../middlewares/auth');
const boardController = require('../controllers/board.controller');

// ==================== BOARD ROUTES ====================

// Xem danh sách board của user (member)
router.get(
  '/my',
  authenticateAny,
  authorizeAny('BOARD_VIEW'), // user có quyền xem board
  boardController.listMyBoards
);

// Tạo board mới
router.post(
  '/',
  authenticateAny,
  authorizeAny('BOARD_CREATE'), // user có quyền tạo board
  boardController.createBoard
);

// Clone board từ template
router.post(
  '/clone/:templateId',
  authenticateAny,
  authorizeAny('BOARD_CREATE'), // user có quyền tạo board
  boardController.cloneBoard
);

// Xem chi tiết board
router.get(
  '/:id',
  authenticateAny,
  authorizeAny('BOARD_VIEW'), // member hoặc creator có quyền xem
  boardController.getBoardDetail
);

// Cập nhật board
router.put(
  '/:id',
  authenticateAny,
  authorizeAny('BOARD_CONFIG'), // member hoặc creator có quyền chỉnh sửa
  boardController.updateBoard
);

// Xóa board
router.delete(
  '/:id',
  authenticateAny,
  authorizeAny('BOARD_CONFIG'), // chỉ creator có quyền xóa
  boardController.deleteBoard
);

// Cấu hình Board settings
router.put(
  '/:id/settings',
  authenticateAny,
  authorizeAny('BOARD_CONFIG'),
  boardController.configureBoardSettings
);

// Thu gọn/mở rộng Swimlane
router.put(
  '/:boardId/swimlanes/:swimlaneId/toggle',
  authenticateAny,
  authorizeAny('BOARD_CONFIG'),
  boardController.toggleSwimlane
);

module.exports = router;
