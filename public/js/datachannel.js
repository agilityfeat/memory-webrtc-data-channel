/*
This code was developed by @ArinSime and WebRTC.ventures for a WebRTC blog post.  
You are welcome to use it at your own risk as starter code for your applications, 
but please be aware that this is not a complete code example with all the necessary 
security and privacy considerations implemented that a production app would require.  
It is for educational purposes only, and any other use is done at your own risk.
*/

//datachannel.js:  This file contains the WebRTC and DataChannel specific code

//Page controls
var chatArea = document.querySelector("#chatArea");
var signalingArea = document.querySelector("#signalingArea");

//Signaling Code Setup
var SIGNAL_ROOM = "signaling";
var configuration = {
	'iceServers': [{
		'url': 'stun:stun.l.google.com:19302'
	}]
};
var rtcPeerConn;
var dataChannelOptions = {
	ordered: false, //no guaranteed delivery, unreliable but faster 
	maxRetransmitTime: 1000, //milliseconds
};
var dataChannel;

io = io.connect();
io.emit('ready', {"signal_room": SIGNAL_ROOM});

//Send a first signaling message to anyone listening
//In other apps this would be on a button click, we are just doing it on page load
io.emit('signal',{"type":"user_here", "message":"Would you like to play a game?", "room":SIGNAL_ROOM});

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
	rtcPeerConn = new webkitRTCPeerConnection(configuration, null);
	dataChannel = rtcPeerConn.createDataChannel('textMessages', dataChannelOptions);
				
	dataChannel.onopen = dataChannelStateChanged;
	rtcPeerConn.ondatachannel = receiveDataChannel;
	
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
}

function sendLocalDesc(desc) {
	rtcPeerConn.setLocalDescription(desc, function () {
		displaySignalMessage("sending local description");
		io.emit('signal',{"type":"SDP", "message": JSON.stringify({ 'sdp': rtcPeerConn.localDescription }), "room":SIGNAL_ROOM});
	}, logError);
}

//Data Channel Specific methods
function dataChannelStateChanged() {
	if (dataChannel.readyState === 'open') {
		displaySignalMessage("Data Channel open");
		dataChannel.onmessage = receiveDataChannelMessage;
	}
}

function receiveDataChannel(event) {
	displaySignalMessage("Receiving a data channel");
	dataChannel = event.channel;
	dataChannel.onmessage = receiveDataChannelMessage;
}

function receiveDataChannelMessage(event) {
	displayMessage("From DataChannel: " + event.data);
	
	if (event.data.split(" ")[0] == "memoryFlipTile") {
		var tileToFlip = event.data.split(" ")[1];
		displayMessage("Flipping tile " + tileToFlip);
		var tile = document.querySelector("#" + tileToFlip);
		var index = tileToFlip.split("_")[1];
		var tile_value = memory_array[index];
		flipTheTile(tile,tile_value);
	} else if (event.data.split(" ")[0] == "newBoard") {
		displayMessage("Setting up new board");
		memory_array = event.data.split(" ")[1].split(",");
		newBoard();
	}
	
}

//Logging/Display Methods
function logError(error) {
	displaySignalMessage(error.name + ': ' + error.message);
}

function displayMessage(message) {
	chatArea.innerHTML = chatArea.innerHTML + "<br/>" + message;
}

function displaySignalMessage(message) {
	signalingArea.innerHTML = signalingArea.innerHTML + "<br/>" + message;
}