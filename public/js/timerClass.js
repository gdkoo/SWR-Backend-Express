class Timer {
	constructor (timerMaxLeft) {
		this.root = document.querySelector("timer-main");

		this.element = {
			minutes: document.querySelector(".timer-base__minutes"),
			seconds: document.querySelector(".timer-base__seconds"),
			control: document.querySelector(".timer-bttn__control"),
			reset: document.querySelector(".timer-bttn__reset")		
		 };

		this.interval = null;
		this.remainingSeconds = timerMaxLeft*60;
		this.durationMin = 0;
		this.durationSec = 0;

		this.element.control.addEventListener("click", () => {
			if (this.interval == null) {
				this.start()
			} else {
				this.stop()
			}
		});

		this.element.reset.addEventListener("click", () => {
			this.remainingSeconds = timerMaxLeft*60;
			this.updateInterfaceTime();
			this.updateInterfaceControls();
		})
	}

	updateInterfaceTime () {
		//convert time parameter to minutes, rounded to closest integer less than or equal to result  
		const minutes = Math.floor(this.remainingSeconds / 60);
		//for purpose of our parameter, seconds will always be 0, but this is useful in case there is an outlier. 
		let seconds = this.remainingSeconds % 60;
		this.element.minutes.textContent = minutes.toString().padStart(2, "0");
		this.element.seconds.textContent = seconds.toString().padStart(2, "0");
	}

	updateInterfaceControls () {
		if (this.interval == null) {
			this.element.control.innerHTML = `<span class="material-symbols-rounded"> play_arrow</span>`;
			this.element.control.classList.add("timer-bttn__start");
			this.element.control.classList.remove("timer-bttn__stop");
		}
		else {
			this.element.control.innerHTML = `<span class="material-symbols-rounded"> pause</span>`;
			this.element.control.classList.add("timer-bttn__stop");
			this.element.control.classList.remove("timer-bttn__start");
		}
	}

	//function to save time in minutes and seconds
	//when pressing pause
	//1. figure out what the current value is
	//2. have it convert to a duration
	getDuration() {
		this.durationMin = Math.floor(( ( timerMaxLeft*60 ) - this.remainingSeconds ) /60);
		this.durationSec = ((timerMaxLeft*60) - this.remainingSeconds) % 60;
		document.getElementById("walkDurationAM").value = `${this.durationMin} minutes`; 	
	}

	start() {
		if (this.remainingSeconds == 0) {
			return
		};
		this.interval = setInterval(() => {
			this.remainingSeconds --;
			this.updateInterfaceTime()

			if (this.remainingSeconds == 0) {
				this.stop();
			};
		}, 1000);

		this.updateInterfaceControls();
	}

	stop() { 
		clearInterval(this.interval);

		this.interval = null;

		this.updateInterfaceControls();

		this.getDuration();
	}

	startTimer() {
		//so that when we don't call startTimer(), it resets. Might delete later
		this.interval = setInterval(() => {
			timePassed = timePassed += 1;
			timeLeft = timerMaxSeconds - timePassed;
			document.getElementById("timer-base-label").innerHTML = formatTime(timeLeft);			
		}, 1000);
	};
}
const timerMaxLeft = 20;
const timerEle = new Timer(timerMaxLeft);