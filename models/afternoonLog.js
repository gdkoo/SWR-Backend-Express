const mongoose = require('mongoose');

const AfternoonLog = new mongoose.Schema({ 
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

module.exports = mongoose.model('AfternoonLog', AfternoonLog);