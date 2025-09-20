const express = require('express');
const router = express.Router();
const PermissionController = require('../controllers/permission.controller');

router.get('/', PermissionController.SelectAll);
router.get('/:id', PermissionController.SelectById);
router.post('/', PermissionController.Create);
router.put('/:id', PermissionController.Update);
router.delete('/:id', PermissionController.Delete);

module.exports = router;
