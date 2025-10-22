const express = require('express');
const router = express.Router();
const columnController = require('../controllers/column.controller');
const { authenticateAny ,authorizeAny } = require('../middlewares/auth');
const { route } = require('./user.routes');

// CRUD (bảo vệ bằng auth)
router.put('/board/:idBoard/isdoneColumn/:idcolumn' ,authenticateAny,authorizeAny('BOARD_UPDATE'), columnController.ColumnIsDone);
router.post('/', authenticateAny, columnController.create);                  // Create
router.get('/:id', authenticateAny, columnController.getOne);                // Read one
router.get('/board/:boardId', authenticateAny, columnController.getByBoard); // Read all by board
router.put('/:id', authenticateAny, columnController.update);                // Update
router.delete('/:id', authenticateAny, columnController.delete);             // Delete
router.put('/:id/move' ,authenticateAny, columnController.move);

// Additional features
router.put('/board/:boardId/reorder', authenticateAny, columnController.reorder); // Reorder columns


module.exports = router;
