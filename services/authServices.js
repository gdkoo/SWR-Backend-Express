const jwt = require('jsonwebtoken');

//middleware method used for authenticating access tokens specifically
exports.authenticateUserToken = async (req,res,next) => {
  const authHeaders = req.headers.authorization;
  
  if (!authHeaders) {
    res.status(401).json({ error:'problem with authorization header' });
    return;
  } 

  //get token
  const token = authHeaders.split(' ')[1];

  //validate token with server
  await jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`, (err, authorizedData) => {
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