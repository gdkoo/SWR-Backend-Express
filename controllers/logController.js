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
          'logMonth': Number(),
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

exports.getMonthLogs = async (req,res) => {
  try {
    const user_id = req.authorizedData.user_id;
    //set current month in user location 
    //update regex expression when current month changes 
    const currMonth = 3;
    
    //filter all documents in given month, organize these documents by increasing date 
    //using sample month of march in regex 
    const monthLogs = await walkLog.aggregate([
      {
        $match:
          {
            user_id: `${user_id}`,
            logDate: { $regex: /(^3\/)/m },
          },
      },
      {
        $sort: 
          //if there are two logs on the same date, it won't be returned in sorted order
          //have to include another field for sorting further
          {
            logDate: 1,
          },
      },
    ]);
    res.send(monthLogs);
  } catch (err) {
    console.log(err);
    res.redirect('/?error=true');
  }
}