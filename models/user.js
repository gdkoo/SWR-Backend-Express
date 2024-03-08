const mongoose = require('mongoose');

//each schema is for an individual collection 
//use schema to force typing, unsure why the type is capitalized though
const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	}
});

module.exports = mongoose.model('User', UserSchema);