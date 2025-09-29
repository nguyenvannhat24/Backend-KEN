const express = require('express'); 
const router = express.Router(); 
const templateController = require('../controllers/template.controller'); 
// CRUD routes
//
router.get('/',templateController.getAll)
router.post('/', templateController.create); 
router.get('/:id', templateController.getById);
router.put('/:id', templateController.update);
router.delete('/:id', templateController.delete);

module.exports = router;