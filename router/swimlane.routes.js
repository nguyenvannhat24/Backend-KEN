const express = require('express');
const router = express.Router();
const swimlaneController = require('../controllers/swimlane.controller');
const { authenticateAny } = require('../middlewares/auth');

// CRUD (bảo vệ membership ở service, auth tại route)
router.post('/', authenticateAny, swimlaneController.create);                    // Create
router.get('/:id', authenticateAny, swimlaneController.getOne);                  // Read one
router.get('/board/:boardId', authenticateAny, swimlaneController.getByBoard);   // Read all by board
router.put('/:id', authenticateAny, swimlaneController.update);                  // Update
router.delete('/:id', authenticateAny, swimlaneController.delete);               // Delete

module.exports = router;
