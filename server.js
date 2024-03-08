require ('dotenv').config();
const express = require('express');
const cors = require ('cors');
const mongoose = require ('mongoose');
const User = require('./models/user.js');
const MorningLog = require('./models/morningLog.js');
const AfternoonLog = require('./models/afternoonLog.js');

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

//serve static files
app.use(express.static('public'));

//Middleware: Helps server parse incoming requests 
//Parse JSON requests
app.use(express.json());
//Parse string and arrays
app.use(express.urlencoded({extended: false}));


//using ejs to handle dynamic front end without react
//have to set it as our view engine
//all files that will be rendered dynamically will be in views folder 
app.set('view engine', 'ejs');

//Any requests sent to localhost:8080/ will return message: path incorrect  
// app.use('/', (req, res) => {
// 	res.send({message: "Incorrect path"});
// })

//Routes
app.get('/', (req, res) => {
	//render home page
	//we only use index because we're rendering
	//an ejs file 
	res.render('index');
})

//get user data from database, async
app.get('/user', async (req, res) => {
	const users = await User.find({}) //MONGODB METHOD 
	//user.ejs file can be accessed by EJS with the render method
	//this is saying, render the user.ejs file, and take in the users object
	res.render('user', {users});
})

//get log page from database
app.get('/log', (req,res) => {
	res.render('log');
})

//Create new user 
app.post('/user', async (req,res) => {
	const newUser = new User(req.body);
	try {
		//see if we can save newUser to database 
		await newUser.save(); //(MONGODB METHOD)

		//on success, redirect to /user route
		//not sure why
		res.redirect('/user')
	} catch(err) {
		res.redirect('/user?error=true');
	}
})

//Update new user
app.post('/user/update/:id', async (req,res) => {
	//UNSURE why id is in params, and body is only name and description
	//UNSURE where we defined the request format
	const {id} = req.params;
	const {username, password} = req.body;
	// REQUEST BODY EXAMPLE
	// {
	//		username: ualskdfj,
	//		password: alskdfjl
	//  }
	//destructure to look like 
	// {username, password} = {ualskdfj, alskdfjl}
	//conclusion: using object destructuring for object properties
	//requires taking the keys and turning it into the variable name
	//this isn't like setting typical variables where the name is arbitrary 

	try {
		await User.findByIdAndUpdate(id, {username, password});  //MONGO DB METHOD 
		//i think this sends a get request to /user 
		res.redirect('/user');
	} catch(err) {
		res.redirect('/user?error=true');
	}
})

//Delete New User
//WE ARE MANUALLY WRITING THESE PATHS 
app.delete('/user/delete/:id', async (req,res) => {
	//UNSURE why id is in params, and body is only name and description
	//UNSURE where we defined the request format
	const {id} = req.params;
	try {
		await User.findByIdAndDelete(id);  //MONGO DB METHOD 
		//not sure why we do this-> is it to send the response back? not sure
		res.status(200).json({message: 'item deleted successfully'});
	} catch(err) {
		res.redirect('/user?error=true');
	}
})

//Log Morning Walk 
 app.post('/log/morning', async (req,res) => {
 	const { logDate, startTime, duration } = req.body;
 	//get user id from request
 	//find document with user-id
 	const uid = 1234;
	try {
		await MorningLog.updateOne(
			//filter:find uid and date
			{
				'uid': `${uid}`,
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
		//THIS ERROR ISN'T EVEN LOGGING 
		console.log(err);
		res.redirect('/log?error=true');
	}
})

//Log Afternoon Walk
 app.post('/log/afternoon', async (req,res) => {
 	const { logDate, startTime, duration } = req.body;
 	//get user id from request
 	//find document with user-id
 	const uid = 1234;
	try {
		await AfternoonLog.updateOne(
			//filter:find uid and date
			{
				'uid': `${uid}`,
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
		//THIS ERROR ISN'T EVEN LOGGING 
		console.log(err);
		res.redirect('/log?error=true');
	}
 })

//Get Morning Walk 
//Router should return all data in that walk document
 app.get('/log/morning', async(req,res) => {
	 try {
	 	 	const userMorningLog = await MorningLog.find({
	 	 		uid: `${req.query.uid}`,
	 	 		logDate: `${req.query.date}`
	 	 	});
	 	 	res.send(userMorningLog);
	 } catch (err) {
	 		res.redirect('/log?error=true');
	 }
 })

 //Get Afternoon Walk
 app.get('/log/afternoon', async(req,res)=> {
 	try {
	 	 	const userAfternoonLog = await AfternoonLog.find({
	 	 		uid: `${req.query.uid}`,
	 	 		logDate: `${req.query.date}`
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