function Camera(width, height){

	//this.width = 600;
	//this.height = 450;
	
	this.width = typeof width != "undefined" ? width : 600;
	this.height = typeof height != "undefined" ? height : 450;
	
	this.constraints = {
		current:null,
		default:{
			video:{
				mandatory:{
					maxWidth:window.innerWidth,
					maxHeight:window.innerHeight
				}
			},
			audio:false
		},
		vga:{
			video:{
				mandatory:{
					maxWidth:640,
					maxHeight:480
				}
			},
			audio:false
		},
		IGiveUp:{
			video:true,
			audio:false
		}
	}
	
	this.localMediaStream = null;
	this.video = null;
	this.canvas = null;
	this.ctx = null;
	
	this.initialize();
}

Camera.prototype.initialize = function(){
	var self = this;
	
	this.get_devices();
	
	//Cross Browser Support
	navigator.getUserMedia = navigator.getUserMedia
		|| navigator.webkitGetUserMedia
		|| navigator.mozGetUserMedia
		|| navigator.msGetUserMedia;
	
	window.URL = window.URL 
		|| window.webkitURL 
		|| window.mozURL 
		|| window.msURL;
		
	if(null == this.constraints.current){
		this.constraints.current = this.constraints.IGiveUp;
	}
	
	this.video = document.createElement("video");
	this.video.width = this.width;
	this.video.height = this.height;
	this.video.autoplay = true;
	this.video.preload = true;
	this.video.muted = true;
	this.video.style= this.css;
	document.body.appendChild(this.video);
	
	this.canvas = document.createElement("canvas");
	this.canvas.width = this.video.width;
	this.canvas.height = this.video.height;
	this.canvas.style = this.css;
	this.ctx = this.canvas.getContext('2d');
	
	document.body.appendChild(this.canvas);

}

Camera.prototype.get_devices = function(){
	if(!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices){
		return false;
	}
	
	var self = this;
	navigator.mediaDevices.enumerateDevices()
		.then(function(devices){
			devices.forEach(function(device){
				if(device.kind == "videoinput"){
					debug.log("" + device.kind + ": " + device.label + " id = " + device.deviceId);
					self.constraints.default.deviceId = device.deviceId;
					self.constraints.current.deviceId = device.deviceId;
				}
			});
		})
		.catch(function(e){
			console.log(e.name + ": " + e.message);
		});
}

Camera.prototype.hasGetUserMedia = function(){
	return navigator.getUserMedia;
}

Camera.prototype.start = function(){
	
	//Checks if everything has been initialized
	if(null == this.video){
		console.log("Camera failed to initialize");
		return false;
	}
	
	//If the camera can be accessed
	if(!this.hasGetUserMedia()){
		alert("getUserMedia() is not supported in your browser");
	}
	
	//Copy an instance of this object
	var self = this;
	
	//Start Camera
	/*navigator.getUserMedia(
		this.constraints.current,
		function(stream){self.videoStart(stream)},
		this.videoPermissionDenied);*/

	//Start Camera
	if(typeof navigator.mediaDevices.getUserMedia !== "undefined"){
		//Start Camera
		navigator.mediaDevices.getUserMedia(this.constraints.current)
			.then(function(stream){self.videoStart(stream);})
			.catch(function(error){self.videoPermissionDenied(error);});
	}else{
		//Start Camera
		navigator.getUserMedia(
			this.constraints.current,
			function(stream){self.videoStart(stream)},
			function(e){self.videoPermissionDenied(e)});
	}
	
}

Camera.prototype.stop = function(){
	
	if(this.localMediaStream)
		if(this.localMediaStream.active)
			this.localMediaStream.getTracks()[0].stop();

}

Camera.prototype.videoStart = function(stream){

	//Gets the video stream
	this.localMediaStream = stream;
	
	//Loads the stream as the videos source
	try{
		this.video.src = window.URL.createObjectURL(this.localMediaStream);
	}catch(e){
		this.video.src = this.localMediaStream;
	}
	
}

Camera.prototype.getFrames = function(){
	
	//Check if there is a stream going
	if (!this.localMediaStream){
		//No stream is present
		return null;
	}
	
	//Copys a single frame to the buffer canvas
	this.b_c_ctx.drawImage(this.video,0,0);
	
	//Return the canvas
	return this.b_c;
}

Camera.prototype.videoPermissionDenied = function(e){
	console.log("Video permissions denied.",e);
	debug.log("Video permissions denied :" + e.message)
}



