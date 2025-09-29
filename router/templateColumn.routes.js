const express = require('express');
const router = express.Router();
const templateColumnController = require('../controllers/templateColumn.controller');

// CRUD routes
router.post('/', templateColumnController.create.bind(templateColumnController));
router.get('/template/:templateId', templateColumnController.getByTemplate.bind(templateColumnController));
router.get('/:id', templateColumnController.getById.bind(templateColumnController));
router.put('/:id', templateColumnController.update.bind(templateColumnController));
router.delete('/:id', templateColumnController.delete.bind(templateColumnController));

module.exports = router;
