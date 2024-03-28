const User = require('../models/user.js');
const RefreshToken = require('../models/refreshToken.js');
const jwt = require('jsonwebtoken');

//Authentication Middleware Functions
const generateAccessToken = function (user) {
  const accessToken = jwt.sign({ user_id: user._id }, `${process.env.ACCESS_TOKEN_SECRET}`, { expiresIn: '1h' });
  return accessToken;
}

const generateRefreshToken = function (user) {
  const refreshToken = jwt.sign({ user_id: user._id }, `${process.env.REFRESH_TOKEN_SECRET}`, { expiresIn: '1h'});
  return refreshToken;
}

//User Tries to Login -> Generate JWT Token 
exports.loginUser = async (req,res) => {
  try {
    //check if user exists, get user doc from mongodb 
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
    }

    //validate password using User model static function 
    const verifyPassword = await User.comparePassword(password, user.password);
    if (!verifyPassword) {
      res.status(401).json({ error: `Password didn't match` });
      return;
    }
    
    //generate and send JWT token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    //save refresh token
    const expiresAt = Date.now() + (1000); //1 second expiry
    const newRefreshToken = new RefreshToken({
      token: refreshToken,
      user_id: user._id,
      expiryDate: expiresAt,
    })
    await newRefreshToken.save();
    
    res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken});
  } catch(err) {
    console.log(`${err}: error logging in`);
    res.status(500).json({ error: 'An error occured while logging in' })
  }
}

//Delete refresh tokens and logout user
//this filters out the refresh token in the request body from the refreshTokens array
exports.logoutUser = async (req,res) => {
  let clientRequestToken = req.body.token;
  
  //check if document exists with request token
  let dbRefreshToken = await RefreshToken.find({ token: clientRequestToken });

  if (dbRefreshToken == []) {
    res.status(204);
    return;
  } else {
    let refreshToken = await dbRefreshToken[0].token;
  
    //if refresh token exists in database, delete
    RefreshToken.deleteOne({ token: refreshToken })
      .then(res.status(204));
      return;
  }
}

//HAVE NOT TESTED THIS SINCE REFACTOR
//Router takes in refresh token, checks if refresh token is stored in database, 
//then validates the refresh token before generating access token
exports.refreshToken = async (req,res) => {
  //take in refresh token
  const clientRequestToken = req.body.token;
  let accessToken = '';

  if (!refreshToken) {
    res.status(401).json({ error: 'No refresh token in request' });
  }

  //refresh token not in stored tokens
  try {
    const dbRefreshToken = await RefreshToken.find({ token: clientRequestToken });
    const refreshToken = dbRefreshToken[0].token;

    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token not in database' });
      return;
    }
    //verify refresh token
    const verifiedRefreshTokenData = jwt.verify(refreshToken, `${process.env.REFRESH_TOKEN_SECRET}`, (err, authorizedData) => {
      if (err) {
        if (err.name == 'TokenExpiredError') {
          RefreshToken.deleteOne({ token: refreshToken })
          .then(
            res.status(403).json({ error: 'Refresh token has expired, login again.' })
          );
          return;
        }
      }
    });
    
    if (verifiedRefreshTokenData) {
      const user = verifiedRefreshTokenData.user_id;
      accessToken = generateAccessToken(user);
      res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken });
    }
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error' });
  }
}