const express = require('express');
const userPointController = require('../controllers/userPoint.controller');

const router = express.Router();

router.get('/', userPointController.getAllUserPoints);
router.get('/user/:userId', userPointController.getByUser);
router.get('/user/:userId/center/:centerId', userPointController.getByUserAndCenter);
router.post('/', userPointController.createUserPoint);
router.put('/:id', userPointController.updateUserPoint);
router.delete('/:id', userPointController.deleteUserPoint);

module.exports = router;
