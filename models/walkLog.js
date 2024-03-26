const mongoose = require('mongoose');

//Schema for each document in the WalkLog Collection

const WalkLog = new mongoose.Schema({ 
	duration: {
		type: Number,
		required: true,
		default: 0,
	},
	logDate: {
    type: String,
    required: true
  },
	startTime: {
		type: String,
		required: true,
	},
	dateModified: {
		type: Date,
		required: true,
	},
  logType: {
    type: String,
    required: true, 
  },
	user_id: String, //match to user in user collection
});

module.exports = mongoose.model('WalkLog', WalkLog);