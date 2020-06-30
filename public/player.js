var player
var videoID
var channel
var title
var info
var duration

var arrayX = [];
var arrayY = [];
var tempX = [];
var tempY = [];


/*if (localStorage.getItem("imgArray") === null) {
	var imgArray=[];
	localStorage.setItem("imgArray", JSON.stringify(imgArray));
}*/

var wID;
var fullscreen = false;
var position;
var sent = false;
var logs = "";
var msg = "";
var preference =  JSON.parse(localStorage.getItem("pref"));
function onYouTubePlayerAPIReady() {
	
	console.log("deneme");
	//log stuff
	
	if(preference == 1){

		$.get("http://localhost:3000/api/isOpen", function (data, status) {
		}).fail(function() {
			document.getElementById("l").src = "likedit://"
		});
		
	}
		

	console.log("preference" + preference);
	const vid = document.createElement('video');
	var timestamp;
	var imageSeq = 0;
	
	videoID = new URLSearchParams(window.location.search).get('id');
	channel = new URLSearchParams(window.location.search).get('channel');
	title = new URLSearchParams(window.location.search).get('title');

	
	document.getElementById('titleh1').innerHTML = title;

	position  = document.getElementById('player').getBoundingClientRect();
	console.log(position)


	//Camera permit
	let constraintObj = {
		audio: false,
		video: true
	};
	navigator.mediaDevices.enumerateDevices()
		.then(devices => {
			devices.forEach(device => {
				// console.log(device.kind.toUpperCase(), device.label);
				//, device.deviceId
			})
		})
		.catch(err => {
			console.log(err.name, err.message);
		})

	//want permit
	navigator.mediaDevices.getUserMedia(constraintObj)
		.then(function (mediaStreamObj) {

			//chunks is where camera is saved
			//            let chunks = [];

			//mediarecorder does all the magic
			let mediaRecorder = new MediaRecorder(mediaStreamObj);
			vid.srcObject = mediaStreamObj;
			vid.play();
			var handeTemp;
			var handeTemp2;
			var label;
			var d;

			//Youtube player, kinda like default player
			player = new YT.Player('player', {

			width: window.innerWidth*3/4,
			height: window.innerHeight*3/4,
			videoId: videoID,
			events: {
			'onStateChange': function (event) {
				switch (event.data) {
					case -1:
						console.log('unstarted');
						duration = player.getDuration();
						var watchDate = Date(Date.now());
						console.log("duration: " + duration)
						videoDBY(videoID, channel, duration, watchDate)
							.then(setInfoWatchId);
						mediaRecorder.start(250);
						break;
					case 0:
						console.log('ended');
						mediaRecorder.stop();
						clearInterval(label);
						console.log(arrayX.length)
						// $.post("/api/logging", {text: player.getCurrentTime() + "\n"}, function(req, res){});
						if(preference == 0){
							$.post("/api/finished", {wID: wID}, function (data, status) {
								/*var imgArray =  JSON.parse(localStorage.getItem("imgArray"));
								imgArray[wID] = data.imageNumber;
								localStorage.setItem("imgArray", JSON.stringify(imgArray));*/
							});
						}	
						else{
							$.post("http://localhost:3000/api/finished", {wID: wID}, function (data, status) {
								/*var imgArray =  JSON.parse(localStorage.getItem("imgArray"));
								imgArray[wID] = data.imageNumber;
								localStorage.setItem("imgArray", JSON.stringify(imgArray));*/
							});
					    }
							
						console.log("arrayX: "  + arrayX)
						$.post("/api/logging", {text: logs + Math.round(player.getCurrentTime() * 10) / 10, wID: wID}, function(req, res){});
						$.post("/api/gaze", {arrayX:arrayX, arrayY: arrayY, wID: wID})
						.success(function(data, status){
							// console.log("wID in function: " + data.wID);
							msg = data.msg;

						});
						sent = true;
						break;
					case 1:
						console.log('playing');
						handeTemp = player.getCurrentTime();
						d = new Date();
						handeTemp2 = d.getTime();
						// console.log(info);
						logs += Math.round(handeTemp * 10) / 10 + " - ";
						webgazer.showVideo(!webgazer.params.showVideo); webgazer.showFaceOverlay(!webgazer.params.showFaceOverlay); webgazer.showFaceFeedbackBox(!webgazer.params.showFaceFeedbackBox);
						// $.post("/api/logging", {text: Math.round(player.getCurrentTime() * 10) / 10 + " - "}, function(req, res){});
						// console.log("played: " + Math.round(player.getCurrentTime() * 10) / 10);
						mediaRecorder.resume();
						label = setInterval(temp, 66);
						
						break;
					case 2:
						console.log('paused');
						d = new Date();
						logs += Math.round((handeTemp + (d.getTime() - handeTemp2)/1000) * 10) / 10 + "\n"
						webgazer.showVideo(!webgazer.params.showVideo); webgazer.showFaceOverlay(!webgazer.params.showFaceOverlay); webgazer.showFaceFeedbackBox(!webgazer.params.showFaceFeedbackBox);
						// $.post("/api/logging", {text: Math.round((handeTemp + (d.getTime() - handeTemp2)/1000) * 10) / 10 + "\n"}, function(req, res){});
						
						mediaRecorder.pause();
						clearInterval(label);
						break;
				}
			},
			'onFullscreenChange': function (event) {
				fullscreen = event.data.fullscreen;
			}
			}
			});
			
			mediaRecorder.ondataavailable = (ev) => {
				takeASnap()
					.then(callBackFunc)
					.then(download);
					// .then(temp);
			}

			function takeASnap() {
				const canvas = document.createElement('canvas'); // create a canvas
				const ctx = canvas.getContext('2d'); // get its context
				canvas.width = vid.videoWidth; // set its size to the one of the video
				canvas.height = vid.videoHeight;
				ctx.drawImage(vid, 0, 0); // the video
				
				return new Promise((res, rej) => {
					canvas.toBlob(res, 'image/jpeg' ); // request a Blob from the canvas
				});
				
			}
			function callBackFunc(blob){
				imageSeq++;
				timestamp = new Date().toISOString();
				return Promise.resolve([blob, imageSeq, timestamp]);
			}
			function download([blob, imageNum, timestamp]) {
				
				var base64data;
				var reader = new FileReader();
				reader.readAsDataURL(blob);
				reader.onloadend = function () {
					base64data = reader.result;
					base64data = base64data.substr(base64data.indexOf(',') + 1);

					if( preference == 0 )
					{
						//console.log("cloud");
						// send base64 string to server
						$.post("/api/downloadImage",
						{
							image: base64data,
							time: timestamp,
							imageNum: Math.round(player.getCurrentTime()),
							wID: wID
						},
						function (data, status) {
							if (!data) {
								console.log("Error");
							}
							//console.log("Received data from post:");
							//console.log(data);
							console.log(status);
						});
					}
					else{
						//console.log("local");
					    // send base64 string to localhost	
					    $.post("http://localhost:3000/api/downloadImage",
						{
							image: base64data,
							time: timestamp,
							imageNum: Math.round(player.getCurrentTime()),
							wID: wID
						},
						function (data, status) {
							if (!data) {
								console.log("Error");
							}
							//console.log("Received data from post:");
							//console.log(data);
							// console.log(status);
						});
					}
				}

			}

		})
}

function temp() {
	var data = webgazer.getCurrentPrediction();
	if (data == null) {
		return;
	}
	if(!fullscreen){
		tempX.push((data.x - position.x)/(window.innerWidth*3/4)); //these x coordinates are relative to the viewport
		tempY.push((data.y - position.y)/(window.innerHeight*3/4)); //these y coordinates are relative to the viewport
		// tempX.push(data.x); //these x coordinates are relative to the viewport
		// tempY.push(data.y); //these y coordinates are relative to the viewport
	}
	else{
		tempX.push(data.x/window.innerWidth); //these x coordinates are relative to the viewport
		tempY.push(data.y/window.innerHeight); //these y coordinates are relative to the viewport
		// tempX.push((data.x/window.innerWidth)*(window.innerWidth*3/4) + position.x); //these x coordinates are relative to the viewport
		// tempY.push((data.y/window.innerHeight)*(window.innerHeight*3/4) + position.y); //these y coordinates are relative to the viewport
	}
	if(tempX.length == 3){
		
		arrayX.push((tempX[0] + tempX[1] + tempX[2])/3); //these x coordinates are relative to the viewport
		arrayY.push((tempY[0] + tempY[1] + tempY[2])/3); //these y coordinates are relative to the viewport
		tempX = [];
		tempY = [];
	}
}

function setInfoWatchId(param) {
	wID = param;
	$.post("/api/logging",{text: "create", wID: param},function (data, status) {});
}

function videoDBY(videoId, channel, duration, watchDate){
	var id= videoId;
	var ch = channel;
	var dr = duration;
	var wd = watchDate;
	var currentId=JSON.parse(localStorage.getItem("currId"));	
	return new Promise(function(resolve, reject) {
		var req = $.post("/api/Videoinsert", {currentId: currentId, vID:id, channel: ch, duration: dr, date: wd})
		.success(function(data, status){
			// console.log("wID in function: " + data.wID);
			resolve(data.wID);
		});
	});
}

window.onload = function(){
	console.log("load")
	webgazer.setTracker("clmtrackr");
	if(window.innerWidth<1500)
		webgazer.begin(false, 21.8, 74);
	else
	webgazer.begin(false, 12.4, 83);
	// webgazer.showVideo(!webgazer.params.showVideo); webgazer.showFaceOverlay(!webgazer.params.showFaceOverlay); webgazer.showFaceFeedbackBox(!webgazer.params.showFaceFeedbackBox);
};

window.onbeforeunload = function(){
	console.log("unload")
	if(!sent){
		if(preference == 0){
			$.post("/api/finished", {wID: wID}, function (data, status) {
				/*var imgArray =  JSON.parse(localStorage.getItem("imgArray"));
				imgArray[wID] = data.imageNumber;
				localStorage.setItem("imgArray", JSON.stringify(imgArray));*/
				if(status != 200)
					$.post("/api/finished", {wID: wID}, function (data, status) {});
			});

		}	
		else{
			$.post("http://localhost:3000/api/finished", {wID: wID}, function (data, status) {
				/*var imgArray =  JSON.parse(localStorage.getItem("imgArray"));
				imgArray[wID] = data.imageNumber;
				localStorage.setItem("imgArray", JSON.stringify(imgArray));*/
			});
		}
		console.log("arrayX: "  + arrayX)
		//$.post("/api/gaze",{arrayX: arrayX,arrayY: arrayY,wID: wID},function (data, status) {});
		$.post("/api/gaze", {arrayX:arrayX, arrayY: arrayY, wID: wID})
		.success(function(data, status){
			// console.log("wID in function: " + data.wID);
			msg = data.msg;
			console.log("msg: "+msg);
		});
		$.post("/api/logging", {text: logs +Math.round(player.getCurrentTime() * 10) / 10, wID: wID}, function(req, res){});
	}
	console.log(msg);
	if(msg=="" || msg==" " || msg == "undefined"){
		return 'Are you sure you want to leave?';
	}
};
