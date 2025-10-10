const express = require("express");
const router = express.Router();
const boardMemberController = require("../controllers/boardMember.controller");
const { authenticateAny, authorizeAny } = require('../middlewares/auth');

// ==================== BOARD MEMBERS API ====================

// Lấy tất cả board members (admin only)
router.get(
  "/all",
  authenticateAny,
  authorizeAny('admin System_Manager VIEW_ALL_BOARD VIEW_BOARD'), // chỉ admin mới xem được
  boardMemberController.selectAll
);

// Lấy members của board cụ thể  
router.get(
  "/board/:board_id",
  authenticateAny,
  authorizeAny('System_Manager admin VIEW_ALL_BOARD  VIEW_BOARD'), // user có quyền xem board
  boardMemberController.getMembers
);

// Thêm member vào board
router.post(
  "/board/:board_id",
  authenticateAny,
  authorizeAny('BOARD_MANAGE_MEMBERS admin System_Manager '), // quyền thêm member
  boardMemberController.addMember
);

// Cập nhật role member trong board
router.put(
  "/board/:board_id/user/:user_id",
  authenticateAny,
  authorizeAny('BOARD_MANAGE_MEMBERS System_Manager admin' ), // quyền quản lý role
  boardMemberController.updateRole
);

// Xóa member khỏi board
router.delete(
  "/board/:board_id/user/:user_id",
  authenticateAny,
  authorizeAny('BOARD_MANAGE_MEMBERS System_Manager admin'), // quyền xóa member
  boardMemberController.removeMember
);

// Lấy boards mà user có quyền
router.get(
  "/user/:user_id/boards",
  authenticateAny,
  authorizeAny('VIEW_BOARD System_Manager admin'), // quyền xem board
  boardMemberController.getBoardsByUser
);

module.exports = router;
