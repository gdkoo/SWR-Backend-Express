require ('dotenv').config();
const express = require('express');
const cors = require ('cors');
const mongoose = require ('mongoose');
const connectDatabase = require('./config/database');

const userRoutes = require('./routes/userRoutes.js');
const logRoutes = require('./routes/logRoutes.js');
const authRoutes = require('./routes/authRoutes.js');

const app = express();

const port = process.env.PORT || 4000;

//Connect to database
connectDatabase();

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

//Use Routes
app.use('/user', userRoutes);
app.use('/log', logRoutes);
app.use('/auth', authRoutes);

//Render home page route
app.get('/', (req, res) => {
	res.render('index');
})

//Start the server
//App listens for requests on localhost:8080
app.listen(8080,() => {
	console.log('Application listening to port 8080');
})