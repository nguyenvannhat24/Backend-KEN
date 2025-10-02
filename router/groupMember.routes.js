const express = require("express");
const router = express.Router();
const groupMemberController = require("../controllers/groupMember.controller");
const { authenticateAny } = require("../middlewares/auth");

// Thêm thành viên vào group
router.post("/", authenticateAny, groupMemberController.addMember);

// Lấy danh sách thành viên trong group
router.get("/", authenticateAny, groupMemberController.getMembers);

// Lấy danh sách thành viên theo group_id
router.get("/:group_id", authenticateAny, groupMemberController.getMembersByGroup);

// Cập nhật role
router.put("/", authenticateAny, groupMemberController.updateRole);

// Xóa thành viên
router.delete("/", authenticateAny, groupMemberController.removeMember);

// kiểm tra mình đang ở group nào


// xem bảng groupmember (admin only)
router.get("/admin/all", authenticateAny, groupMemberController.selectAll);

//
router.post("/getGroupUser",authenticateAny ,groupMemberController.selecGroupUser);
module.exports = router;
