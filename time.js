// Variables
// variables for time values
let minutes;
let seconds;
let timerId;
let startTimeValue;  // stores the reel time when the session starts
let endTimeValue;  // stores the reel time when the session should end

// variables for session type control
let currentMode = "work";

// timer state variable
let isRunning = false

// pomodoro cycle counter variable
let nbSession = 0;

// default durations in seconds
const workTime = 25 * 60;  // 25 minutes in seconds
const shortBreakTime = 5 * 60;  // 5 minutes in secondes
const longBreakTime = 15 * 60;  // 15 minutes in seconds


// have a permission for the notification API
// here Notification is a system object
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}


// Functions
// deacrese seconds and minutes
// 1000ms = 1s
// setInterval() and clearInterval() are built-in functions in JS
// setInterval() is used to run a code every X milliseconds
startInterval = () => {
    if (isRunning) return;
    if (endTimeValue === undefined) return;
    isRunning = true;
    timerId = setInterval(() => {
        const timeNow = Date.now();
        const timeLeft = endTimeValue - timeNow;  // how much time is left
        if (timeLeft <= 0) {
            clearInterval(timerId);
            isRunning = false;
            minutes = 0;
            seconds = 0;
            updateTimeUI(minutes, seconds);
            playSound();
            showNotification();
            if (currentMode === "work") {
                nbSession++;
            }
            if (currentMode === "longBreak") {
                nbSession = 0;
            }
            switchSession();
            return;
        }
        // convert millisecondes to minutes and secondes
        minutes = Math.floor(timeLeft / 1000 / 60);
        seconds = Math.floor((timeLeft / 1000) % 60);
        updateTimeUI(minutes, seconds);
    }, 200);  // 200ms instead of 1000ms to make timer more accurate and avoid some delays that could happen
};

// a function that controls the countdown timer
startTime = () => {
    if (minutes === undefined && seconds === undefined) {
        minutes = currentMode === "work"? (workTime / 60) : currentMode === "shortBreak" ? (shortBreakTime / 60) : (longBreakTime / 60);
        seconds = 0;
        updateSessionLabel();
        updateTimeUI(minutes, seconds);
    }
    const msLeft = (minutes * 60 + seconds) * 1000;
    endTimeValue = Date.now() + msLeft;
    startInterval();
};

// a function that controls the pause of the countdown timer
pauseTime = () => {
    clearInterval(timerId);
    isRunning = false;
};

// a function that brings back the timer to its initial state
resetTime = () => {
    clearInterval(timerId);
    isRunning = false;
    minutes = currentMode === "work"? (workTime / 60) : currentMode === "shortBreak" ? (shortBreakTime / 60) : (longBreakTime / 60);
    seconds = 0;
    updateSessionLabel();
    updateTimeUI(minutes, seconds);
    startTimeValue = undefined;
    endTimeValue = undefined;
    document.title = "Kinasai Pomodoro";
};


// a function that switches between the 3 session types (work, shortBreak, longBreak)
switchSession = () => {
    if (currentMode === "work") {
        if (nbSession < 4) {
            currentMode = "shortBreak";
            minutes = shortBreakTime / 60;
            seconds = 0;
            updateSessionLabel();
            updateTimeUI(minutes, seconds);
        }
        else {
            currentMode = "longBreak";
            minutes = longBreakTime / 60;
            seconds = 0;
            updateSessionLabel();
            updateTimeUI(minutes, seconds);
        }
        // nbSession++;
    }
    else {
        currentMode = "work"
        minutes = workTime / 60;
        seconds = 0;
        updateSessionLabel();
        updateTimeUI(minutes, seconds);
    }
};

// a function that shows the coundown time on the UI
updateTimeUI = (minutes, seconds) => {
    const timeElement = document.getElementById("time");
    timeElement.textContent = (minutes >= 10 ? minutes : "0" + minutes) + ":" + (seconds >= 10 ? seconds : "0" + seconds); // if for exemple minutes = 4 then 04:00 not 4:00
    updateTabTitle(minutes, seconds);
};

// a fonction that updates the session label on the UI depending on the current mode
updateSessionLabel = () => {
    let sessionLabel = document.getElementById("session-label");
    if (currentMode === "work") {
        sessionLabel.textContent = "Work Time";
    }
    else if (currentMode === "shortBreak") {
        sessionLabel.textContent = "Short Break";
    }
    else {
        sessionLabel.textContent = "Long Break";
    }
};

// a function to play a sound effect when each session ends
playSound = () => {
    const audio = new Audio('sound1.wav');  // an audio instance from the Audio object
    audio.play();
};

// a function to show the time on the browser tab
updateTabTitle = (minutes, seconds) => {
    document.title = (minutes >= 10 ? minutes : "0" + minutes) + ":" +
    (seconds >= 10 ? seconds : "0" + seconds) + " - " + "Kinasai Pomodoro";
};

// a function to show a notification when each session ends
showNotification = () => {
    if (Notification.permission === "granted") {
        const message = currentMode === "work" ? "Your work session has ended! Time for a break 🌿" : "Your break session has ended! Back to work 🧠";
        new Notification("Session Complete", {
            body: message,
            icon: "favicon.ico"
        });
    }
}


// Event Listeners
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");

startBtn.addEventListener("click", startTime);
pauseBtn.addEventListener("click", pauseTime);
resetBtn.addEventListener("click", resetTime);

document.title = "Kinasai Pomodoro";