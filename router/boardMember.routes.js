const express = require("express");
const router = express.Router();
const boardMemberController = require("../controllers/boardMember.controller");
const { authenticateAny, authorizeAny, adminAny } = require('../middlewares/auth');
// Thêm user vào board
router.post("/", authenticateAny, boardMemberController.addMember);

// Lấy danh sách thành viên trong board
router.post("/viewUser",authenticateAny, boardMemberController.getMembers);

// Cập nhật role của thành viên
router.put("/:board_id/:user_id",authenticateAny , boardMemberController.updateRole);

// Xoá thành viên khỏi board
router.delete("/:board_id/:user_id",authenticateAny, boardMemberController.removeMember);

// xem các bảng mà người dùng có quyền kiểu như người tạo ...
router.post("/boards-by-user", authenticateAny, boardMemberController.getBoardsByUser);

// xem bảng
router.get("/select",boardMemberController.selectAll);
module.exports = router;
