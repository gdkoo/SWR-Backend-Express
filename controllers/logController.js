const MorningLog = require('../models/morningLog.js');
const AfternoonLog = require('../models/afternoonLog.js');

exports.getLog = async (req,res) => {
  res.render('log');
}

exports.postMorningLog = async (req,res) => {
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
    res.redirect('/');
  } catch(err) {
    console.log(err);
    res.redirect('/?error=true');
  }
}

exports.postAfternoonLog = async (req,res) => {
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
    res.redirect('/');
  } catch(err) {
    console.log(err);
    res.redirect('/?error=true');
  }
}

//Get specific walk documents on given logDate query
exports.getMorningLog = async (req,res) => {
  try {
      const user_id = req.authorizedData.user_id;
      const userMorningLog = await MorningLog.find({
        user_id: `${user_id}`,
        logDate: `${req.query.logDate}`
      });
      res.send(userMorningLog);
   } catch (err) {
      res.redirect('/?error=true');
   }
}

exports.getAfternoonLog = async (req,res) => {
  try {
    const user_id = req.authorizedData.user_id;
    const userAfternoonLog = await AfternoonLog.find({
      user_id: user_id,
      logDate: `${req.query.logDate}`
    });
    res.send(userAfternoonLog);
  } catch (err) {
    res.redirect('/?error=true');
  }
}