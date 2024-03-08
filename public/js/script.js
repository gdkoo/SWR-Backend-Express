//walkType can be either 'morning' or 'afternoon'
async function getLog (walkType) {
  try {
    //1. Get current day in user's location, correctly formatted 
    const date = new Date();
    
    let day = date.getDate();
    if (day < 10) {
      day = `0${day}`
    } else {
      day = day.toString();
    }
    
    let month = (date.getMonth() + 1);
    if (month < 10) {
      month = `0${month}`
    } else {
      month = month.toString();
    }

    const year = date.getFullYear();
    
    const currentDay = `${year}-${month}-${day}`
    const uid = 1234; //temp variable

    //2. Include date and user id in query params
    //`localhost:8080/log/morning/?user=1234&date=YYYY-MM-DD`
    const response = await fetch(`http://localhost:8080/log/${walkType}/?uid=${uid}&date=${currentDay}`);
    const data = await response.json();
    const userLog = data[0];
    return userLog;
  } catch(err) {
    console.log('error getting walkLog' + err);
  }
}

async function checkUserWalk(walkType, userLog) {
  try {
    if (userLog.duration || userLog.duration > 0) {
      if (walkType == 'morning') {
        const morningWalkElement = document.getElementById('morningWalkDone');
        morningWalkElement.classList.remove("hidden");
      }
      if (walkType == 'afternoon') {
        const afternoonWalkElement = document.getElementById('afternoonWalkDone');
        afternoonWalkElement.classList.remove("hidden");
      }
    }
    return;
  } catch (err) {
    console.log(err);
  }
}

async function displayUserWalk (walkType) {
  try {
    const userLog = await getLog(walkType);
    if (!userLog) {
      return;
    }
    checkUserWalk(walkType, await userLog);
    return;
  } catch(err) {
    console.log(err);
  }
}

//Handle Edit requests
function editItem (id, username, password) {
	//populate hidden field with the id
	document.getElementById('_id').value = id;
	
	//populate form fields
	document.getElementById('updateUsername').value = username;
	document.getElementById('updatePassword').value = password;
	
	//when form is updated, send to the following endpoint with the id variable
	//containing id of the current key-value pair
	document.getElementById('updateForm').action = `/user/update/${id}`;
  return;
};

//Handle Delete requests 
async function deleteItem(id) {
	try {
		const response = await fetch(`http://localhost:8080/user/delete/${id}`,
			{
				method: 'DELETE'
			}
		);
		if (response.ok) {
			location.reload();
		} else {
			console.log(`failed to delete item`);
		}
    return;
	} catch (err) {
		console.log(`error connecting to database ${err}`);
	}
}