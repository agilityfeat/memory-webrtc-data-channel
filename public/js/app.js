/*
This code was developed by @ArinSime and WebRTC.ventures for a WebRTC blog post.  
You are welcome to use it at your own risk as starter code for your applications, 
but please be aware that this is not a complete code example with all the necessary 
security and privacy considerations implemented that a production app would require.  
It is for educational purposes only, and any other use is done at your own risk.
*/

//App.js:  This file contains the code necessary for basic flow of our application

var myName = document.querySelector("#myName");
var myMessage = document.querySelector("#myMessage");
var sendMessage = document.querySelector("#sendMessage");
var chatArea = document.querySelector("#chatArea");
var signalingArea = document.querySelector("#signalingArea");

sendMessage.addEventListener('click', function(ev){
	io.emit('send', {"author":myName.value, "message":myMessage.value, "room":ROOM});
	ev.preventDefault();
}, false);