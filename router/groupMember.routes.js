const express = require("express");
const router = express.Router();
const groupMemberController = require("../controllers/groupMember.controller");
const { authenticateAny } = require("../middlewares/auth");

// Thêm thành viên vào group (1 hoặc nhiều thành viên)
router.post("/", authenticateAny, groupMemberController.addMember);

// Lấy danh sách thành viên trong group
router.get("/", authenticateAny, groupMemberController.getMembers);

// Lấy danh sách thành viên theo group_id
router.get("/:group_id", authenticateAny, groupMemberController.getMembersByGroup);

// Cập nhật thông tin thành viên (bao gồm role)
router.put("/member", authenticateAny, groupMemberController.updateMember);

// Xóa thành viên
router.delete("/", authenticateAny, groupMemberController.removeMember);

// Xóa thành viên (Admin hệ thống)
router.delete("/admin", authenticateAny, groupMemberController.adminRemoveMember);

// kiểm tra mình đang ở group nào


// xem bảng groupmember (admin only)
router.get("/admin/all", authenticateAny, groupMemberController.selectAll);

//
router.post("/getGroupUser",authenticateAny ,groupMemberController.selecGroupUser);
module.exports = router;
