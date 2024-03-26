const walkLog = require('../models/walkLog.js');

exports.getLog = async (req,res) => {
  res.render('log');
}

exports.postMorningLog = async (req,res) => {
  const { logDate, startTime, duration, logType } = req.body;
  const user_id = req.authorizedData.user_id;
  try {
    await walkLog.updateOne(
      //filter:find uid and date
      {
        'user_id': user_id,
        'logDate': `${logDate}`,
        'logType': `${logType}`,
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
  const { logDate, startTime, duration, logType } = req.body;
  const user_id = req.authorizedData.user_id;
  try {
    await walkLog.updateOne(
      //filter:find uid and date
      {
        'user_id': user_id,
        'logDate': `${logDate}`,
        'logType': `${logType}`,
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
      const userMorningLog = await walkLog.find({
        user_id: `${user_id}`,
        logDate: `${req.query.logDate}`,
        logType: `${req.query.logType}`,
      });
      res.send(userMorningLog);
   } catch (err) {
      res.redirect('/?error=true');
   }
}

exports.getAfternoonLog = async (req,res) => {
  try {
    const user_id = req.authorizedData.user_id;
    const userAfternoonLog = await walkLog.find({
      user_id: user_id,
      logDate: `${req.query.logDate}`,
      logType: `${req.query.logType}`,
    });
    res.send(userAfternoonLog);
  } catch (err) {
    res.redirect('/?error=true');
  }
}