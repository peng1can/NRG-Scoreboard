var scoreboard;
var miniboard;
var console;
var guestName;
var homeName;
var lasttick = (new Date).getTime();
var t; //timer
var ht; //halftime timer
var clock_on=0;
var clock;
var home;
var guest;
var bout=1;
var htStatus=0;
var htSecs=0;
var htTime=15;
var numAds=2;
var adNum=1;
var adURL="images/ad1.jpg";

/*launchScoreboard();
setInterval(tick,100); */

function initClocks(){
	clock = { 'period': 1800000,
		'jam': 0,
		'to': 0,
		'gap': 0,
		'jamNumber':0,
	  	'periodNumber':1,
		'pabsolute':0,
		'jabsolute':0,
		'gabsolute':0};
}

function initScores() {
	home = {	'score': 0,
			'jam': 0,
			'timeouts': 3,
			'reviews': 1};

	guest = {	'score': 0,
			'jam': 0,
			'timeouts': 3,
			'reviews': 1};
}

function init(){

	initClocks();
	initScores();
	launchScoreboard();

	shortcut.add("Ctrl+[",function() {
		periodTimeAdjust(60);
	},{'type':'keypress','disable_in_input':true});
	shortcut.add("Ctrl+]",function() {
		periodTimeAdjust(-60);
	},{'type':'keypress','disable_in_input':true});
	shortcut.add("[",function() {
		periodTimeAdjust(1);
	},{'type':'keypress','disable_in_input':true});
	shortcut.add("]",function() {
		periodTimeAdjust(-1);
	},{'type':'keypress','disable_in_input':true});
	shortcut.add(".",function() {
		changeScore("guest",1);
	},{'type':'keypress','disable_in_input':true});
	shortcut.add(",",function() {
		changeScore("home",1);
	},{'type':'keypress','disable_in_input':true});
	shortcut.add("Ctrl+.",function() {
		changeScore("guest",-1);
	},{'type':'keypress','disable_in_input':true});
	shortcut.add("Ctrl+,",function() {
		changeScore("home",-1);
	},{'type':'keypress','disable_in_input':true});
	shortcut.add("p",function() {
		togglePeriod();
	},{'type':'keypress','disable_in_input':true});
	shortcut.add("Space",function() {
		startstop();
	});

//	t = setTimeout("tick()",50);
}

function resetClocks(){
	initClocks();
	updateClocks();
}

function resetGame(){
	initClocks();
	initScores();
	updateClocks();
	updateScores();
}

function msToMins (ms){
	x = Math.floor(ms/1000);
	var ts = Math.floor(ms/100);
	secs = x % 60;
	x = Math.floor(x/60);
	mins = x % 60;
	if ((mins > 0) & (secs > 30)) { 
		y = mins+":"+((secs<=9) ? "0" + secs: secs);
	} else {
		var ts = Math.floor(ms/100);
		y = ":"+((secs<=9) ? "0" + secs: secs + "." + ts);
	}
	return (y);
}

function togglePeriod(){
	  if (clock.periodNumber==1) {
	    clock.periodNumber=2;
	  } else {
	    clock.periodNumber=1;
	  }
	  document.cpanel.periodNumber.value=clock.periodNumber;
	  updateLabels(0);
}


function updateLabels(x) {
	bout = bout + x;
	if (bout < 1) { bout = 1; }
	if (bout > 9) { bout = 9; }
	document.cpanel.boutNum.value = bout;
	if (document.cpanel.enableLogos.checked) { 
		document.cpanel.homeTeam1.disabled = true;
		document.cpanel.homeTeam2.disabled = true;
		document.cpanel.guestTeam1.disabled = true;
		document.cpanel.guestTeam2.disabled = true;
		homeName = "<IMG SRC='images/homelogo"+ bout +".jpg'>";
		guestName = "<IMG SRC='images/guestlogo"+ bout +".jpg'>";
		console.log(homeName + " -- " + guestName);
	} else {
		document.cpanel.homeTeam1.disabled = false;
		document.cpanel.homeTeam2.disabled = false;
		document.cpanel.guestTeam1.disabled = false;
		document.cpanel.guestTeam2.disabled = false;
		guestName = document.cpanel.guestTeam1.value + "<br>" + document.cpanel.guestTeam2.value;
		homeName = document.cpanel.homeTeam1.value + "<br>" + document.cpanel.homeTeam2.value;
	}
	scoreboard.postMessage({'type': 'label', 
		'homeName': homeName, 
		'guestName': guestName,
		'period':clock.periodNumber},"*");	
}

function halftime(type) {
  htTime = document.cpanel.htTime.value
  htSecs = htTime*60000;
  //console.log(htTime);
  if (type == 0) { htHeaderText = "Derby Action Resumes In"; }
  if (type == 1) { htHeaderText = "Derby Action Begins In"; }
  if (htStatus==0) { 
	htStatus=1; 
	htTick(); 
  } else if (htStatus==1) { 
	htStatus=0; 
        clearTimeout(ht);
  }
  scoreboard.postMessage({'type': 'htToggle',
			  'htheadertext' : htHeaderText,
			  'htminutes' : htTime,
			  'status': htStatus},"*");
}

function htTick() {
	htSecs = htSecs - 1000;
	htTime = msToMins (htSecs);
	console.log(htTime);
	scoreboard.postMessage({'type': 'htUpdate',
				'htminutes': htTime},"*");
	ht = setTimeout ("htTick()",1000);
	if (htSecs < 0) { halftime(-1); }
	return;
}


// This could be simplified if I could send the existing JSON's inside the postMessage... haven't tested if that works.
function updateScores() {
	// local scores
	document.cpanel.homeJamScore.value=home.jam;
	document.cpanel.guestJamScore.value=guest.jam;
	document.cpanel.homeScore.value = home.score;
	document.cpanel.guestScore.value = guest.score;
	// scoreboard
// debugging	console.log('send message: ' + home.score,home);
	scoreboard.postMessage({'type': 'score', 
		'home': home.score, 
		'homeJam': home.jam, 
		'guest': guest.score, 
		'guestJam': guest.jam,
		'homeTO': home.timeouts,
		'guestTO': guest.timeouts,
		'homeOR': home.reviews,
		'guestOR': guest.reviews},"*");	
}

function updateClocks() {
	//local clocks
	pc = msToMins(clock.period);
	if ( clock.to >= 0 ) {
		jc = msToMins(clock.to);
		jcLabel = "TIME OUT";
	} else if ((clock.jam == 0) &&(clock.gap > 0)) {
		jc = msToMins(clock.gap);
		jcLabel = "NEXT JAM";
	} else {
		jc = msToMins(clock.jam);
		jcLabel = "JAM CLOCK";
	}
	document.cpanel.pClock.value=pc;  
	document.cpanel.jClock.value=jc;
	document.getElementById('jClockLabel').innerHTML=jcLabel;  
	document.cpanel.jamNumber.value=clock.jamNumber;  
	//scoreboard clocks
	scoreboard.postMessage({'type': 'clock',
		'pClock': pc,
		'jClock': jc,
		'jcLabel': jcLabel,
		'ad': adURL,
		'jamNumber': clock.jamNumber},"*");
}

function updateJamNumber(x) {
	clock.jamNumber = clock.jamNumber+x;
	updateClocks();
}

function periodTimeAdjust(delta) {
	if (clock_on) {
	 clock.pabsolute = clock.pabsolute + (delta*1000);	 
	} else {
	 clock.period = Math.max(Math.min(1800000,(clock.period + (delta*1000))),0);
	}
	 updateClocks();
}


function launchScoreboard(){
	scoreboard = window.open('scoreboard.html','scoreboard','titlebar=0,location=0,toolbar=0,menubar=0,statusbar=0,titlebar=0');
	}


function setScore(team,score) {
	  // This could be even simpler with variable variables.
	  // Should put positive number only sanity checking in input field
	  if (team == 'home') {
	  	home.score=Number(score);
	  } else if (team == 'guest') {
	    guest.score=Number(score);
	  }
	  updateScores();
}


function changeScore(team,delta) {
	  if (team == 'home') {
	  	home.score=Math.max(0,home.score+delta);
	  	home.jam=Math.max(0,home.jam+delta);
	  } else if (team == 'guest') {
	    guest.score=Math.max(0,guest.score+delta);
	    guest.jam=Math.max(0,guest.jam+delta);
	  }
	  updateScores(); 
	}


function changeTimeouts(team,type) {
	// These should be made to reset if already 0
	if (team == "home" ) {
		if (type == 0) {
			home.reviews = home.reviews-1;
			if (home.reviews < 0) {
				home.reviews = 1;
			}
		} else {
	  			home.timeouts=home.timeouts-1;
	  			if (home.timeouts < 0) {
	  				home.timeouts = 3;
	  			}
		}
	 } else { 
		if (type == 0) { 
			guest.reviews = guest.reviews-1;
			if (guest.reviews < 0) {
				guest.reviews = 1;
			}
		} else {
	  			guest.timeouts=guest.timeouts-1;
	  			if (guest.timeouts < 0) {
	  				guest.timeouts = 3;
	  			}
		}
	 	}
	document.cpanel.homeTimeouts.value=home.timeouts;
	document.cpanel.guestTimeouts.value=guest.timeouts;
	document.cpanel.homeReviews.value = home.reviews;
	document.cpanel.guestReviews.value = guest.reviews;
	updateScores();
}

function tick() {
	thistick = (new Date).getTime();
	// Time on the TO clock takes precedence.
	// Zero count on the TO clock holds the game (use -1 to resume)
	if (clock.to > 0 ) {
		clock.to = (Math.max(0,(clock.to-100)));
//		updateClocks();
//		return(true);
	} else if (clock.to == 0) {
		updateClocks();
		clearTimeout(t);
		clock_on=0;
		return(true);
	} else if (clock.jam > 0 ) { // run out the jam clock first 
		clock.jam = Math.max(0, ((clock.jabsolute-thistick)-100));
		clock.period = Math.max(0,((clock.pabsolute-thistick)-100));
	} else if (clock.gap > 0) {
		clock.gap = Math.max(0, ((clock.gabsolute-thistick)-100));
		clock.period = Math.max(0,((clock.pabsolute-thistick)-100));
		if (clock.period == 0) {
			// Don't run the gap clock if the pClock is 0
			clock.gap = 0;
			updateClocks();
			pauseClocks();
			return;
		}
		document.cpanel.startButton.value = "Start Jam";
	} else {
		pauseClocks();
		return;
	}
	
	updateClocks();
    
    ticktime = thistick - lasttick;
    if (ticktime < 0) { console.log("Missed a tick\n"); ticktime = 0; }
    lasttick = thistick;
    nexttick = 100 - (ticktime-100);
	t = setTimeout ("tick()",nexttick);
//    console.log ("x: " + nexttick+" : "+ticktime);
}


function callTimeout(why) {
	// Why = 0 means an actual team timeout... put a minute on the clock.
	if (why == 1) {
		clock.to = 0;
	} else {
		clock.to = 60000;		
	}
	clock.jam = 0;
	clock.gap = 0;
    document.cpanel.startButton.value="Start Jam";    
}

function pauseClocks() {
	  clock.timeout=0;
	  document.cpanel.startButton.value = "Start Jam"; 
	  clearTimeout(t);
  	  clock_on = 0;
	}

function startstop() {
	now =(new Date).getTime();
	if (document.cpanel.startButton.value=="Start Jam") {
		if ((clock.to > 0)&&(clock_on)) {
			clock.pabsolute=now+clock.period;
		}
		clock.jam=120000;
		clock.gap=30000;
		clock.to=-1;
		clock.jamNumber += 1;
		home.jam = 0;
		guest.jam = 0;
		updateScores();
		document.cpanel.startButton.value="Stop Jam";
		adCycle();
		clock.jabsolute = now+clock.jam;
		clock.gabsolute = now+clock.jam+clock.gap;
		if (!(clock_on)) {		
			t = setTimeout("tick()",100);
			clock_on = 1;
			clock.pabsolute=now+clock.period;
			console.log(clock.pabsolute+"\n");
		}		
	} else if (document.cpanel.startButton.value=="Stop Jam") {
		clock.jam=0;
		clock.gap=30000;
		clock.gabsolute=now+clock.gap;
		clock.to=-1;
		document.cpanel.startButton.value="Start Jam";
	}
}

function adCycle() {
	adNum = adNum + 1;
	if (adNum > numAds) { adNum = 1; }
	adURL = "images/ad" + adNum + ".jpg";
}

window.onload=init();

