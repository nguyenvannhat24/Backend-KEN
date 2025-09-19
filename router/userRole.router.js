const express = require('express');
const userRoleController = require('../controllers/userRole.controller');

module.exports = function() {
  const router = express.Router();
  router.get('/selectAlluserRole', userRoleController.SelectAlluserRole);
  return router;
};
