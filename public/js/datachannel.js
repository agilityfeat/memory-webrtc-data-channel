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
io = io.connect();
io.emit('ready', ROOM);

io.on('announce', function(data) {
	displayMessage(data.message);
});

io.on('message', function(data) {
	displayMessage(data.author + ": " + data.message);
});

function displayMessage(message) {
	chatArea.innerHTML = chatArea.innerHTML + "<br/>" + message;
}