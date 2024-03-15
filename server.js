require ('dotenv').config();
const express = require('express');
const cors = require ('cors');
const mongoose = require ('mongoose');
const User = require('./models/user.js');
const MorningLog = require('./models/morningLog.js');
const AfternoonLog = require('./models/afternoonLog.js');
const RefreshToken = require('./models/RefreshToken.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();

const port = process.env.PORT || 4000;

//Connect to MongoDB
mongoose.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.9ynsuyw.mongodb.net/${process.env.MONGODB_DATABASE_NAME}?retryWrites=true&w=majority`)
	.then(() => {
		console.log('MongoDB connected')
	})
	.catch((err) => {
		console.log(err);
	})

//NON-ROUTE MIDDLEWARE 

//CORS middleware (cross-origin browsers, prevents spam requests)
app.use(cors());

//Serve static files
app.use(express.static('public'));

//Middleware: Helps server parse incoming requests 
//Parse JSON requests
app.use(express.json());
//Parse string and arrays
app.use(express.urlencoded({extended: false}));


//using ejs to handle dynamic front end without react, we have to set it as our view engine
//all files that will be rendered dynamically will be in views folder 
app.set('view engine', 'ejs');

//Authentication Middleware
//generate access token
const generateAccessToken = function (user) {
  const accessToken = jwt.sign({ user_id: user._id }, `${process.env.ACCESS_TOKEN_SECRET}`, { expiresIn: '15s' });
  return accessToken;
}

const generateRefreshToken = function (user) {
  const refreshToken = jwt.sign({ user_id: user._id }, `${process.env.REFRESH_TOKEN_SECRET}`, { expiresIn: '1s'});
  return refreshToken;
}

//used for authenticating access tokens specifically
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

//Router takes in refresh token, checks if refresh token is stored in database, 
//then validates the refresh token before generating access token
app.post('/token/refresh', async (req, res) => {
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
});

//Routes
app.get('/', (req, res) => {
	//render home page
	res.render('index');
})

//get user data from database, async
app.get('/user', async (req, res) => {
	const users = await User.find({})
	//user.ejs file can be accessed by EJS with the render method
	res.render('user', {users});
})

//get log page from database
app.get('/log', (req,res) => {
	res.render('log');
})

//Create/Register new user 
app.post('/user', async (req,res) => {
	try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ error:'Email already registered' });
    };

    //encrypt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create new user
    const newUser = new User({ email, password: hashedPassword });
		await newUser.save();

    res.status(201).json({ message:'User registered successfully' });
	} catch(err) {
      console.log(`${err}: error registering user`);
		  res.status(500).json({ error: 'An error occurred while registering the user' });
	}
})

//Update new user
app.post('/user/update/:id', async (req,res) => {
	const { id } = req.params;
	const { email, password } = req.body;

	try {
		await User.findByIdAndUpdate( id, { email, password });
		res.redirect('/user');
	} catch(err) {
		res.redirect('/user?error=true');
	}
})

//Delete New User
app.delete('/user/delete/:id', async (req,res) => {
	const { id } = req.params;
	try {
		await User.findByIdAndDelete(id);
		res.status(200).json({ message: 'item deleted successfully' });
	} catch(err) {
		res.redirect('/user?error=true');
	}
})

//User Tries to Login -> Generate JWT Token 
app.post('/login', async(req,res) => {
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
      user: user._id,
      expiryDate: expiresAt,
    })
    await newRefreshToken.save();
    
    res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken});
  } catch(err) {
    console.log(`${err}: error logging in`);
    res.status(500).json({ error: 'An error occured while logging in' })
  }
})

//Delete refresh tokens and logout user
//this filters out the refresh token in the request body from the refreshTokens array
app.post('/logout', async (req,res) => {
  let clientRequestToken = req.body.token;
  //check if document exists with request token
  let dbRefreshToken = await RefreshToken.find({ token: clientRequestToken });
  let refreshToken = dbRefreshToken[0].token;

  if (!refreshToken) {
    res.status(204);
    return;
  }
  
  //if refresh token exists in database, delete
  RefreshToken.deleteOne({ token: refreshToken })
    .then(res.status(204));
});

//Log Morning Walk 
app.post('/log/morning', authenticateUserToken, async (req,res) => {
  const { logDate, startTime, duration } = req.body;
  const user_id = req.authorizedData.user_id;
	try {
		await MorningLog.updateOne(
			//filter:find uid and date
			{
				'user_id': user_id,
				'logDate': `${logDate}`,
			},
			//update: set new values
			{
				$currentDate: {
					'dateModified': true,
				},
			 	$set: {
					'startTime': `${startTime}`,
					'duration': Number(duration),
				}
			},
			//option: upsert:true will create document if doesn't exist
		 	{ upsert: true });
		res.redirect('/log');
	} catch(err) {
		console.log(err);
		res.redirect('/log?error=true');
	}
})

//Log Afternoon Walk
app.post('/log/afternoon', authenticateUserToken, async (req,res) => {
 	const { logDate, startTime, duration } = req.body;
  const user_id = req.authorizedData.user_id;
	try {
		await AfternoonLog.updateOne(
			//filter:find uid and date
			{
				'user_id': user_id,
				'logDate': `${logDate}`,
			},
			//update: set new values
			{
				$currentDate: {
					'dateModified': true,
				},
			 	$set: {
					'startTime': `${startTime}`,
					'duration': Number(duration),
				}
			},
			//option: upsert:true will create document if doesn't exist
		 	{ upsert: true });
		res.redirect('/log');
	} catch(err) {
		console.log(err);
		res.redirect('/log?error=true');
	}
})

//Get Morning Walk 
//Router should return all data in that walk document
app.get('/log/morning', authenticateUserToken, async(req,res) => {
	 try {
      const user_id = req.authorizedData.user_id;
	 	 	const userMorningLog = await MorningLog.find({
	 	 		user_id: `${user_id}`,
	 	 		logDate: `${req.query.logDate}`
	 	 	});
	 	 	res.send(userMorningLog);
	 } catch (err) {
	 		res.redirect('/log?error=true');
	 }
})

 //Get Afternoon Walk
app.get('/log/afternoon', authenticateUserToken, async(req,res)=> {
 	try {
      const user_id = req.authorizedData.user_id;
	 	 	const userAfternoonLog = await AfternoonLog.find({
	 	 		user_id: user_id,
	 	 		logDate: `${req.query.logDate}`
	 	 	});
	 	 	res.send(userAfternoonLog);
	 } catch (err) {
	 		res.redirect('/log?error=true');
	 }
})

//Start the server
//App listens for requests on localhost:8080
app.listen(8080,() => {
	console.log('Application listening to port 8080');
})