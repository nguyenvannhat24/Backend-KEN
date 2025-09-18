const express = require('express');
const authController = require('../controllers/auth.controller');

module.exports = function(keycloak) {
  const router = express.Router();

  // login thường (DB)
  router.post('/login', authController.login);

  // login SSO bằng Keycloak
  router.get('/sso', keycloak.protect(), (req, res) => {
    res.json({ message: 'Login bằng Keycloak thành công!', user: req.kauth.grant.access_token.content });
  });

//   // logout Keycloak
//   router.get('/logout', keycloak.logout(), (req, res) => {
//     res.json({ message: 'Đăng xuất Keycloak thành công' });
//   });

  return router;
};
