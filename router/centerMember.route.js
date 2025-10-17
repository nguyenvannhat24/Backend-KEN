const express = require('express');
const router = express.Router();
const centerMemberController = require('../controllers/centerMember.controller');
const { authenticateAny, authorizeAny } = require('../middlewares/auth');

// thêm thành viên
router.post('/', authenticateAny , centerMemberController.addMember);

// lấy các trung tâm mà user là thành viên
router.get('/my-centers', authenticateAny, centerMemberController.getCentersByUser);

// lấy danh sách thành viên trong một trung tâm
router.get('/:center_id/members',authenticateAny , centerMemberController.getMembersByCenter);

// xóa thành viên khỏi trung tâm
router.delete('/:id', authenticateAny, centerMemberController.removeMember);

module.exports = router;
