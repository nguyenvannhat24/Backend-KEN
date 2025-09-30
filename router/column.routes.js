const express = require('express');
const router = express.Router();
const columnController = require('../controllers/column.controller');
const { authenticateAny } = require('../middlewares/auth');

// CRUD (bảo vệ bằng auth)
router.post('/', authenticateAny, columnController.create);                  // Create
router.get('/:id', authenticateAny, columnController.getOne);                // Read one
router.get('/board/:boardId', authenticateAny, columnController.getByBoard); // Read all by board
router.put('/:id', authenticateAny, columnController.update);                // Update
router.delete('/:id', authenticateAny, columnController.delete);             // Delete

module.exports = router;
