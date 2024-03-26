const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const logController = require('../controllers/logController.js');

//middleware method used for authenticating access tokens specifically
const authenticateUserToken = (req,res,next) => {
  const authHeaders = req.headers.authorization;
  
  if (!authHeaders) {
    res.status(401).json({ error:'problem with authorization header' });
    return;
  } 

  //get token
  const token = authHeaders.split(' ')[1];

  //validate token with server
  const verifiedToken = jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`, (err, authorizedData) => {
    if (err && err.name == 'TokenExpiredError') {
      res.status(403).json({ error: 'Access token expired' });
    } else if (err) {
      console.log('error connecting to protected route. unauthorized access');
      res.status(403).json({ error:'unauthorized access' });
    } else {
      req.authorizedData = authorizedData;
      next();
    }
  });
}

router.get('/', logController.getLog);
router.post('/morning', authenticateUserToken, logController.postMorningLog);
router.post('/afternoon', authenticateUserToken, logController.postAfternoonLog);
router.get('/morning', authenticateUserToken, logController.getMorningLog);
router.get('/afternoon', authenticateUserToken, logController.getAfternoonLog);

module.exports = router;