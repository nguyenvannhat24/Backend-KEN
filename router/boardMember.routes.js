const express = require("express");
const router = express.Router();
const boardMemberController = require("../controllers/boardMember.controller");
const { authenticateAny, authorizeAny, adminAny } = require('../middlewares/auth');

// ==================== BOARD MEMBERS API ====================

// Lấy tất cả board members (admin only)
router.get("/all", authenticateAny, boardMemberController.selectAll);

// Lấy members của board cụ thể  
router.get("/board/:board_id", authenticateAny, boardMemberController.getMembers);

// Thêm member vào board
router.post("/board/:board_id", authenticateAny, boardMemberController.addMember);

// Cập nhật role member trong board
router.put("/board/:board_id/user/:user_id", authenticateAny, boardMemberController.updateRole);

// Xóa member khỏi board
router.delete("/board/:board_id/user/:user_id", authenticateAny, boardMemberController.removeMember);

// Lấy boards mà user có quyền
router.get("/user/:user_id/boards", authenticateAny, boardMemberController.getBoardsByUser);

module.exports = router;
