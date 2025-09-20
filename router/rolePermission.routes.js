const express = require('express');
const router = express.Router();
const RolePermissionController = require('../controllers/rolePermission.controller');

router.get('/', RolePermissionController.getAll);
router.post('/', RolePermissionController.create);
router.get('/:id', RolePermissionController.getById);
router.put('/:id', RolePermissionController.update);
router.delete('/:id', RolePermissionController.delete);

module.exports = router;
