const mongoose = require('mongoose');

//Schema for each document in the WalkLog Collection

const MorningLog = new mongoose.Schema({ 
	duration: {
		type: Number,
		required: true,
		default: 0,
	},
	logDate: String,
	startTime: {
		type: String,
		required: true,
	},
	dateModified:{
		type: Date,
		required: true,
	},
	user_id: String, //match to user in user collection			
});

module.exports = mongoose.model('MorningLog', MorningLog);