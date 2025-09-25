const express = require('express');
const userRoleController = require('../controllers/userRole.controller');

const router = express.Router();
const { authenticateAny, authorizeAny } = require('../middlewares/auth');

// Admin only for managing user-role assignments
router.get('/all', authenticateAny, authorizeAny('admin'), userRoleController.SelectAlluserRole);
router.get('/user/:userId', authenticateAny, authorizeAny('admin'), userRoleController.getRoleByUser);
router.post('/', authenticateAny, authorizeAny('admin'), userRoleController.createUserRole);
router.put('/:id', authenticateAny, authorizeAny('admin'), userRoleController.updateUserRole);
router.delete('/:id', authenticateAny, authorizeAny('admin'), userRoleController.deleteUserRole);
router.delete('/user/:userId', authenticateAny, authorizeAny('admin'), userRoleController.deleteRolesByUser);

module.exports = router;
