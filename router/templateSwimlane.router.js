const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateAny } = require('../middlewares/auth');
const ctrl = require('../controllers/templateSwimlane.controller');

router.get('/', authenticateAny, ctrl.list);
router.post('/', authenticateAny, ctrl.create);
router.put('/:id', authenticateAny, ctrl.update);
router.delete('/:id', authenticateAny, ctrl.remove);

module.exports = router;


