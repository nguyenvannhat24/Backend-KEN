const express = require("express");
const router = express.Router();
const groupMemberController = require("../controllers/groupMember.controller");
const { authenticateAny } = require("../middlewares/auth");

// ==================== GROUP MEMBERS API ====================

// Thêm member vào group
router.post("/", authenticateAny, groupMemberController.addMember);
router.post("/add", authenticateAny, groupMemberController.addMember); // Backward compatibility

// Lấy members của group
router.get("/:group_id", authenticateAny, groupMemberController.getMembers);
router.post("/list", authenticateAny, groupMemberController.getMembers); // Backward compatibility

// Cập nhật role member
router.put("/:group_id/:user_id", authenticateAny, groupMemberController.updateRole);
router.put("/update", authenticateAny, groupMemberController.updateRole); // Backward compatibility

// Xóa member khỏi group  
router.delete("/:group_id/:user_id", authenticateAny, groupMemberController.removeMember);
router.delete("/remove", authenticateAny, groupMemberController.removeMember); // Backward compatibility

// Xem tất cả group members (admin)
router.get("/", authenticateAny, groupMemberController.selectAll);

module.exports = router;
