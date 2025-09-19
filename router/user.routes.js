const express = require('express');
const userController = require('../controllers/user.controller');

module.exports = function() {
  const router = express.Router();
  router.get('/selectAll', userController.SelectAll);
  return router;
};
