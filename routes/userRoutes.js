const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');

//get all user data
router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.post('/update/:id', userController.updateUser);
router.delete('/delete/:id', userController.deleteUser);

module.exports = router;