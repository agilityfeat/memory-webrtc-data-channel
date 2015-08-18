/*
This code was developed by @ArinSime and WebRTC.ventures for a WebRTC blog post.  
You are welcome to use it at your own risk as starter code for your applications, 
but please be aware that this is not a complete code example with all the necessary 
security and privacy considerations implemented that a production app would require.  
It is for educational purposes only, and any other use is done at your own risk.
*/

//datachannel.js:  This file contains the WebRTC and DataChannel specific code

//Signaling Code
var ROOM = "chat";
var SIGNAL_ROOM = "signaling";
var myVideoArea = document.querySelector("#myVideoTag");
var theirVideoArea = document.querySelector("#theirVideoTag");
var configuration = {
	'iceServers': [{
		'url': 'stun:stun.l.google.com:19302'
	}]
};
var rtcPeerConn;


io = io.connect();
io.emit('ready', {"chat_room": ROOM, "signal_room": SIGNAL_ROOM});

//Send a first signaling message to anyone listening
//This normally would be on a button click
io.emit('signal',{"type":"user_here", "message":"Are you ready for a call?", "room":SIGNAL_ROOM});

io.on('announce', function(data) {
	displayMessage(data.message);
});

io.on('message', function(data) {
	displayMessage(data.author + ": " + data.message);
});

io.on('signaling_message', function(data) {
	displaySignalMessage("Signal received: " + data.type);
	//Setup the RTC Peer Connection object
	if (!rtcPeerConn)
		startSignaling();
	
	if (data.type != "user_here") {
		var message = JSON.parse(data.message);
		if (message.sdp) {
			rtcPeerConn.setRemoteDescription(new RTCSessionDescription(message.sdp), function () {
				// if we received an offer, we need to answer
				if (rtcPeerConn.remoteDescription.type == 'offer') {
					rtcPeerConn.createAnswer(sendLocalDesc, logError);
				}
			}, logError);
		}
		else {
			rtcPeerConn.addIceCandidate(new RTCIceCandidate(message.candidate));
		}
	}
	
});

function startSignaling() {
	displaySignalMessage("starting signaling...");
	rtcPeerConn = new webkitRTCPeerConnection(configuration);
	
	// send any ice candidates to the other peer
	rtcPeerConn.onicecandidate = function (evt) {
		if (evt.candidate)
			io.emit('signal',{"type":"ice candidate", "message": JSON.stringify({ 'candidate': evt.candidate }), "room":SIGNAL_ROOM});
		displaySignalMessage("completed that ice candidate...");
	};
	
	// let the 'negotiationneeded' event trigger offer generation
	rtcPeerConn.onnegotiationneeded = function () {
		displaySignalMessage("on negotiation called");
		rtcPeerConn.createOffer(sendLocalDesc, logError);
	}  
	
	// once remote stream arrives, show it in the remote video element
	rtcPeerConn.onaddstream = function (evt) {
		displaySignalMessage("going to add their stream...");
		theirVideoArea.src = URL.createObjectURL(evt.stream);
	};
	
	// get a local stream, show it in our video tag and add it to be sent
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	navigator.getUserMedia({
		'audio': false,
		'video': true
	}, function (stream) {
		displaySignalMessage("going to display my stream...");
		myVideoArea.src = URL.createObjectURL(stream);
		rtcPeerConn.addStream(stream);
	}, logError);
}

function sendLocalDesc(desc) {
	rtcPeerConn.setLocalDescription(desc, function () {
		displaySignalMessage("sending local description");
		io.emit('signal',{"type":"SDP", "message": JSON.stringify({ 'sdp': rtcPeerConn.localDescription }), "room":SIGNAL_ROOM});
	}, logError);
}
			
function logError(error) {
	displaySignalMessage(error.name + ': ' + error.message);
}


function displayMessage(message) {
	chatArea.innerHTML = chatArea.innerHTML + "<br/>" + message;
}

function displaySignalMessage(message) {
	signalingArea.innerHTML = signalingArea.innerHTML + "<br/>" + message;
}