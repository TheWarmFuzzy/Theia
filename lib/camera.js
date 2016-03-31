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
					maxWidth:this.width,
					maxHeight:this.height
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
		
	//Copies preset contraints if there aren't any current constraints
	if(null == this.constraints.current){
		this.constraints.current = this.constraints.default;
	}
	
	//Creates webcam video element
	this.video = new_element(
		{"element":"video",
		"width":this.width,
		"height":this.height,
		"autoplay":true,
		"preload":true,
		"muted":true,
		"style":this.css});
	
	//Adds the webcam video to the page
	document.body.appendChild(this.video);
	
	//Creates stage canvas and context
	this.canvas = new_element(
		{"element":"canvas",
		"width":this.video.width,
		"height":this.video.height,
		"style":this.css});
	this.ctx = this.canvas.getContext('2d');
	
	//Adds the stage canvas to the page
	document.body.appendChild(this.canvas);
	
	//Creates buffer canvas and context
	this.b_c = new_element(
		{"element":"canvas",
		"width":this.video.width,
		"height":this.video.height,
		"style":this.css});
	this.b_c_ctx = this.b_c.getContext('2d');
}

//Draws the buffer canvas onto the stage canvas
Camera.prototype.update = function(){
	//Clears canvas
	this.ctx.clearRect(0, 0, this.b_c.width, this.b_c.height);
	
	//Draws buffer image onto stage canvas
	this.ctx.drawImage(this.b_c,0,0,this.canvas.width, this.canvas.height);
	
	//Clears buffer
	this.b_c_ctx.clearRect(0, 0, this.b_c.width, this.b_c.height);
	
}

//Returns the buffer canvas
Camera.prototype.get_canvas = function(){
	return this.b_c;
}

//Returns the buffer canvas context
Camera.prototype.get_canvas_context = function(){
	return this.b_c_ctx;
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
					//debug.log("" + device.kind + ": " + device.label + " id = " + device.deviceId);
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
	
	console.log(this.video);
}

Camera.prototype.getFrame = function(){
	
	//Check if there is a stream going
	if (!this.localMediaStream){
		//No stream is present
		return null;
	}
	var canvas = new_element(
		{"element":"canvas",
		"width":this.video.width,
		"height":this.video.height,
		"style":"position:absolute;top:0px;left:0px;margin:0px 0px;z-index:200;"});
	var ctx = canvas.getContext('2d');

	//Copys a single frame to the buffer canvas
	ctx.drawImage(this.video,0,0,this.video.width, this.video.height);
	
	//Return the canvas
	return canvas;
}

Camera.prototype.videoPermissionDenied = function(e){
	console.log("Video permissions denied.",e);
	//debug.log("Video permissions denied :" + e.message)
}



