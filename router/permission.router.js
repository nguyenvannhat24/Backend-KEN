const express = require('express');
const router = express.Router();
const { authenticateAny, authorizeAny } = require('../middlewares/auth');
const PermissionController = require('../controllers/permission.controller');

// Admin only for permission management
router.get('/', authenticateAny, authorizeAny('admin'), PermissionController.SelectAll);
router.get('/:id', authenticateAny, authorizeAny('admin'), PermissionController.SelectById);
router.post('/', authenticateAny, authorizeAny('admin'), PermissionController.Create);
router.put('/:id', authenticateAny, authorizeAny('admin'), PermissionController.Update);
router.delete('/:id', authenticateAny, authorizeAny('admin'), PermissionController.Delete);

module.exports = router;
