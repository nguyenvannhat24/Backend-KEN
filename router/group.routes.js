const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const { authenticateAny, authorizeAny } = require('../middlewares/auth');

// CRUD Group
router.post('/', authenticateAny, groupController.create);
router.get('/', authenticateAny, groupController.getAll); // Chỉ groups của user
router.get('/:id', authenticateAny, groupController.getById);
router.put('/:id', authenticateAny, groupController.update);
router.delete('/:id', authenticateAny, groupController.delete);

// Admin only - xem tất cả groups
router.get('/admin/all', authorizeAny('admin'), async (req, res) => {
  try {
    const groupService = require('../services/group.service');
    const groups = await groupService.getAllGroups();
    res.json({ success: true, data: groups });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
