const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const { authenticateAny } = require('../middlewares/auth'); // nếu có auth

// CRUD Group
router.post('/', groupController.create);
router.get('/', groupController.getAll);
router.get('/:id', authenticateAny, groupController.getById);
router.put('/:id', authenticateAny, groupController.update);
router.delete('/:id', authenticateAny, groupController.delete);

module.exports = router;
