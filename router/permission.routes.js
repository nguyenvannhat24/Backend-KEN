// router/permission.routes.js
const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permission.controller');

// CRUD routes
router.post('/', permissionController.create);
router.get('/', permissionController.getAll);
router.get('/:id', permissionController.getById);
router.put('/:id', permissionController.update);
router.delete('/:id', permissionController.delete);

module.exports = router;
