const express = require('express');
const router = express.Router();
const { authenticateAny } = require('../middlewares/auth');
const boardController = require('../controllers/board.controller');

// Xem danh tất cả các bảng có trogn database
router.get('/my', authenticateAny, boardController.selectedAll);



// Tạo board mới (user đã đăng nhập)
router.post('/', authenticateAny, boardController.createBoard);

// Xem chi tiết board (member hoặc creator)
router.get('/:id', authenticateAny, boardController.getBoardDetail);

// Cập nhật board (member hoặc creator)
router.put('/:id', authenticateAny, boardController.updateBoard);

// Xóa board (chỉ creator)
router.delete('/:id', authenticateAny, boardController.deleteBoard);

module.exports = router;


    