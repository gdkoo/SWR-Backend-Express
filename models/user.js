const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
	email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
	password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
}, 
{
  statics: {    
    //this.password refers to the hashed password in User instance
    //enteredPassword will be typed according to user
    //docs suggest (plainTextPassword, hash)
    async comparePassword(enteredPassword, hashPassword) {
      const result = await bcrypt.compare(enteredPassword, hashPassword);
      if (!result) {
        console.log('error comparing password');
      };
      return result;
    }
  }
});

module.exports = mongoose.model('User', UserSchema);