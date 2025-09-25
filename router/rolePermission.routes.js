const express = require('express');
const router = express.Router();
const { authenticateAny, authorizeAny } = require('../middlewares/auth');
const RolePermissionController = require('../controllers/rolePermission.controller');

// Admin only for role-permission management
router.get('/', authenticateAny, authorizeAny('admin'), RolePermissionController.getAll);
router.post('/', authenticateAny, authorizeAny('admin'), RolePermissionController.create);
router.get('/:id', authenticateAny, authorizeAny('admin'), RolePermissionController.getById);
router.put('/:id', authenticateAny, authorizeAny('admin'), RolePermissionController.update);
router.delete('/:id', authenticateAny, authorizeAny('admin'), RolePermissionController.delete);

module.exports = router;
