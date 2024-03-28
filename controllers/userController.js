const User = require('../models/user.js');
const WalkLog = require('../models/walkLog.js');
const RefreshToken = require('../models/refreshToken.js');
const bcrypt = require('bcrypt');


exports.getUsers = async (req,res) => {
  const users = await User.find({});
  //user.ejs file can be accessed by EJS with the render method
  res.render('user', {users});
}

exports.createUser = async (req,res) => {
  try {
    const { email, password } = req.body;

    //check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ error:'Email already registered' });
      return;
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
}

exports.updateUser = async (req,res) => {
  const user_id = req.authorizedData.user_id;
  const { email, password } = req.body;

  try {
    await User.findByIdAndUpdate( user_id, { email, password });
    res.redirect('/user');
  } catch(err) {
    res.redirect('/user?error=true');
  }
}

exports.deleteUser = async (req,res) => {
  const user_id = req.authorizedData.user_id;
  // const { email } = req.body;
  
  try {
    await User.findByIdAndDelete(user_id);
    await WalkLog.deleteMany({ user_id: `${user_id}` });
    await RefreshToken.deleteMany({ user_id: `${user_id}` });

    res.status(200).json({ message: 'item deleted successfully' });
  } catch(err) {
    res.redirect('/user?error=true');
  }
}