const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');

router.post('/token/refresh', authController.refreshToken);
router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser);

module.exports = router;