const express = require('express');
const centerController = require('../controllers/center.controller');

const router = express.Router();

router.get('/', centerController.getAllCenters);
router.get('/:id', centerController.getCenterById);
router.post('/', centerController.createCenter);
router.put('/:id', centerController.updateCenter);
router.delete('/:id', centerController.deleteCenter);

module.exports = router;
