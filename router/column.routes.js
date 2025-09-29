const express = require('express');
const router = express.Router();
const columnController = require('../controllers/column.controller');

// CRUD
router.post('/', columnController.create);                  // Create
router.get('/:id', columnController.getOne);                // Read one
router.get('/board/:boardId', columnController.getByBoard); // Read all by board
router.put('/:id', columnController.update);                // Update
router.delete('/:id', columnController.delete);             // Delete

module.exports = router;
