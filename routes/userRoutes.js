const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userController = require('../controllers/userController.js');
const authServices = require('../services/authServices.js');

//get all user data
router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.post('/update', authServices.authenticateUserToken, userController.updateUser);
router.delete('/delete', authServices.authenticateUserToken, userController.deleteUser);

module.exports = router;