const express = require('express');
const userPointController = require('../controllers/userPoint.controller');

const router = express.Router();
const { authenticateAny, authorizeAny } = require('../middlewares/auth');

// UserPoints: read own or admin; write admin (tùy yêu cầu, tạm admin)
router.get('/', authenticateAny, authorizeAny('admin'), userPointController.getAllUserPoints);
router.get('/user/:userId', authenticateAny, userPointController.getByUser);
router.get('/user/:userId/center/:centerId', authenticateAny, userPointController.getByUserAndCenter);
router.post('/', authenticateAny, authorizeAny('admin'), userPointController.createUserPoint);
router.put('/:id', authenticateAny, authorizeAny('admin'), userPointController.updateUserPoint);
router.delete('/:id', authenticateAny, authorizeAny('admin'), userPointController.deleteUserPoint);

module.exports = router;
