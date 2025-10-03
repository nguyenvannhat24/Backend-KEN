const express = require('express'); 
const router = express.Router(); 
const templateController = require('../controllers/template.controller'); 
const { authenticateAny, authorizeAny, adminAny } = require('../middlewares/auth');

// CRUD routes
router.get('/', authenticateAny, templateController.list);
router.post('/', authenticateAny, templateController.create); 
router.get('/:id', authenticateAny, templateController.getById);
router.put('/:id', authenticateAny, templateController.update);
router.delete('/:id', authenticateAny, templateController.remove);

module.exports = router;