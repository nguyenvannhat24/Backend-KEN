const express = require('express');
const router = express.Router();
const swimlaneController = require('../controllers/swimlane.controller');
const { authenticateAny, authorizeAny, adminAny } = require('../middlewares/auth');

// CRUD
router.post('/', swimlaneController.create);                    // Create
router.get('/:id', swimlaneController.getOne);                  // Read one
router.get('/board/:boardId', swimlaneController.getByBoard);   // Read all by board
router.put('/:id', swimlaneController.update);                  // Update
router.delete('/:id', swimlaneController.delete);               // Delete

module.exports = router;
