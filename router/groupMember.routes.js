const express = require("express");
const router = express.Router();
const groupMemberController = require("../controllers/groupMember.controller");
const { authenticateAny } = require("../middlewares/auth");

// Thêm thành viên vào group
router.post("/add", authenticateAny, groupMemberController.addMember);

// Lấy danh sách thành viên trong group
router.post("/list", authenticateAny, groupMemberController.getMembers);

// Cập nhật role
router.put("/update", authenticateAny, groupMemberController.updateRole);

// Xóa thành viên
router.delete("/remove", authenticateAny, groupMemberController.removeMember);

// xem bảng groupmember
router.get("/",groupMemberController.selectAll );

module.exports = router;
