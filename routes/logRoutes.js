const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const logController = require('../controllers/logController.js');
const authServices = require('../services/authServices.js');

router.get('/', authServices.authenticateUserToken, logController.getLog);
router.post('/morning', authServices.authenticateUserToken, logController.postMorningLog);
router.post('/afternoon', authServices.authenticateUserToken, logController.postAfternoonLog);
router.get('/morning', authServices.authenticateUserToken, logController.getMorningLog);
router.get('/afternoon', authServices.authenticateUserToken, logController.getAfternoonLog);
router.get('/month', authServices.authenticateUserToken, logController.getMonthLogs);

module.exports = router;