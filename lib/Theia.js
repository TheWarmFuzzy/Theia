function Theia(arguments){
	this.showcase_mode = true;
	this.debug_mode = true;
	
	this.camera;
	this.tracker;
	this.model_overlay;
	this.qr_handler;
	
	this.initialize();
}

Theia.prototype.initialize = function(){
	
	this.camera = new Camera();
	this.camera.start();
	this.tracker = new tracking.ColorTracker();
	//this.tracker = new Theia_Tracker({"camera":this.camera});
	this.model_overlay = new Overlay(this.camera.video.offsetWidth, this.camera.video.offsetHeight);
	this.qr_handler = new QR_Code(this.camera, this.model_overlay);
}

Theia.prototype.start = function(){
	var self = this;
	if(this.showcase_mode){
		var showcase = new Showcase (this.camera, function(){self.start_tracking();});
		showcase.start();
	}else{
		this.start_tracking();
	}
}

Theia.prototype.on_resize = function(){
	
}

Theia.prototype.start_tracking = function(){
	var self = this;
	tracking.track(self.camera, self.tracker);
	self.tracker.on('track', function(event) {
		if(self.debug_mode)
			self.camera.draw_rectangles(event.data);
		self.qr_handler.update(event.data);
		self.camera.update();
	});
}

//Gets the inner dimensions of the window
Theia.prototype.get_camera_size = function(){
	var iw, ih, cw, ch;
	if(window.innerWidth > window.innerHeight){
		iw = window.innerWidth;
		ih = window.innerHeight;
	}else{
		iw = window.innerHeight;
		ih = window.innerWidth;
	}
	
}

//Gets the aspect ratio of the screen
Theia.prototype.get_aspect_ratio = function(){
	var w, h;
	if(screen.width > screen.height){
		w = screen.width;
		h = screen.height;
	}else{
		w = screen.height;
		h = screen.width;
	}
	return w / h;
}