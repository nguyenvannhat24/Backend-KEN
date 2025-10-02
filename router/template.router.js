const express = require('express');
const router = express.Router();
const { authenticateAny } = require('../middlewares/auth');
const templateController = require('../controllers/template.controller');
const templateColumnRouter = require('./templateColumn.router');
const templateSwimlaneRouter = require('./templateSwimlane.router');

// List templates
router.get('/', authenticateAny, templateController.list);

// Create template
router.post('/', authenticateAny, templateController.create);

// Get template by id
router.get('/:id', authenticateAny, templateController.getById);

// Update template
router.put('/:id', authenticateAny, templateController.update);

// Delete template
router.delete('/:id', authenticateAny, templateController.remove);

// Nested routes - phải đặt sau các routes chính
router.use('/:template_id/columns', templateColumnRouter);
router.use('/:template_id/swimlanes', templateSwimlaneRouter);

module.exports = router;


