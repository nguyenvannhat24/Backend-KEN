const express = require('express');
const userRoleController = require('../controllers/userRole.controller');

const router = express.Router();

router.get('/all', userRoleController.SelectAlluserRole);
router.get('/user/:userId', userRoleController.getRoleByUser);
router.post('/', userRoleController.createUserRole);
router.put('/:id', userRoleController.updateUserRole);
router.delete('/:id', userRoleController.deleteUserRole);
router.delete('/user/:userId', userRoleController.deleteRolesByUser);

module.exports = router;
