function Theia_Tracker(arguments){
	this.constraints = {
		"min_size":15,
		"max_size":15
	};
	
	this.camera = arguments.camera;
	
	this.colours = new Array();
	
	this.initialize();
}

Theia_Tracker.prototype.initialize = function(){
	this.add_colour("theia_red",function(r,g,b){
		if (r >= 60 &&
			g <= r * 0.5 &&
			b <= r * 0.5){
			return true;
		}
		return false;
	});
	
	this.add_colour("theia_green",function(r,g,b){
		if (r <= g * 0.7 &&
			g >= 40 &&
			b <= g * 0.7){
		  return true;
		}
		return false;
	});
}

Theia_Tracker.prototype.track = function(){
	this.track_video();
}

Theia_Tracker.prototype.track_video = function(){
	var self = this;
	var canvas = new_element(
		{"element":"canvas",
		"width":this.camera.video.offsetWidth,
		"height":this.camera.video.offsetHeight});
	var context = canvas.getContext('2d');
	
	var requestId;
	var requestAnimationFrame = function(){
		requestId = window.requestAnimationFrame(function(){
			if(self.camera.video.readyState === self.camera.video.HAVE_ENOUGH_DATA){
				try{
					context.drawImage(self.camera.video,0,0, canvas.width, canvas.height);
				}catch(e){}
				self.track_canvas(canvas);
			}
			requestAnimationFrame();
		});
	};
	
	requestAnimationFrame();
	
	return requestId;
}

Theia_Tracker.prototype.track_canvas = function(canvas){
	var context = canvas.getContext('2d');
	var imageData = context.getImageData(0,0,canvas.width,canvas.height).data;
	this.track_colour(imageData, canvas.width, canvas.height);
}

Theia_Tracker.prototype.track_colour = function(pixels, width, height){
	var self = this;
	var bool_array = new Array(width * height);
	
	var i, j, k;
	var index, p_index;
	var r,g,b;
	var x,y;
	var ff_queue;
	var ff_min_x,ff_min_y;
	var ff_x,ff_y;
	var ff_n,ff_s,ff_e,ff_w;
	var match;
	var c_ctx = self.camera.get_canvas_context();
	
	var rects = new Array();
	
	var check_pixel = function(x,y,colour){
		index =  x + y * width;
		if(bool_array[index] != undefined)
			return false;
		bool_array[index] = 1;
		p_index = index * 4;
		//Get current pixel colour
		r = pixels[p_index];
		g = pixels[p_index + 1];
		b = pixels[p_index + 2];
		
		return colour.compare(r,g,b);
	}
	
	var flood_fill = function(x,y,colour){

		if(!check_pixel(x,y,colour))
			return false;
		
		ff_queue.push({"x":x,"y":y});
		
		for(i = 0; i < ff_queue.length; i++){
			ff_e = ff_w = ff_queue[i].x;
			
			while(ff_e > 0 && check_pixel(ff_e,ff_queue[i].y,colour)){
				ff_e--;
			}
			while(ff_w < width - 1 && check_pixel(ff_w,ff_queue[i].y,colour)){
				ff_w++;
			}
			
			ff_x.push(ff_e);
			ff_x.push(ff_w);
			ff_y.push(ff_queue[i].y);
			
			for(j = ff_e; j <= ff_w; j++){
				if(ff_queue[i].y > 0){
					if(check_pixel(j,ff_queue[i].y - 1,colour)){
						ff_queue.push({"x":j,"y":ff_queue[i].y - 1});
					}
				}	
				if(ff_queue[i].y < height - 1){
					if(check_pixel(j,ff_queue[i].y + 1,colour)){
						ff_queue.push({"x":j,"y":ff_queue[i].y + 1});
					}
				}
			}
		}
		
		return true;
	};
	
	for(y = 0; y < height; y++){
		for(x = 0; x < width; x++){
			
			ff_x = new Array();
			ff_y = new Array();
			ff_queue = new Array();
			
			flood_fill(x,y,this.colours[0]);
			
			ff_min_x = Math.min(...ff_x);
			ff_min_y = Math.min(...ff_y);
			rects.push({
				"x":ff_min_x,
				"y":ff_min_y,
				"width":Math.max(...ff_x) - ff_min_x,
				"height":Math.max(...ff_y) - ff_min_y,
				"color":this.colours[0].name
				});
		}
	}
	self.camera.draw_rectangles(rects);
	self.camera.update();
}

Theia_Tracker.prototype.flood_fill = function(){
	
}

Theia_Tracker.prototype.stop = function(){
	
}

Theia_Tracker.prototype.add_colour = function(name, colour_function){
	this.colours.push({"name":name,"compare":colour_function});
}