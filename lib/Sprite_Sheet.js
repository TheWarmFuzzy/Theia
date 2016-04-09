function Sprite_Sheet(arguments){
	
	this.camera = arguments.camera;
	this.ctx = this.camera.get_canvas_context();
	this.image_url = arguments.url != undefined ? arguments.url : "Theia_Loader.png";
	this.divisions_width = arguments.width != undefined ? arguments.width : 4;
	this.divisions_height = arguments.width != undefined ? arguments.width : 4;
	
	this.frame = 0;
	this.max_frame = this.divisions_width * this.divisions_height;
	
	this.sheet = new Image();
	this.frame_width;
	this.frame_height;
	
	this.ready = false;
	
	this.initialize();
}

Sprite_Sheet.prototype.initialize = function(){
	var self = this;
	this.sheet.onload = function(){
		self.ready = true;
		self.frame_width = self.sheet.width / self.divisions_width;
		self.frame_height = self.sheet.height / self.divisions_height;
	};
	this.sheet.src = "../img/" + this.image_url;
	
}

Sprite_Sheet.prototype.update = function(){
	//Updates the frame number
	this.frame = this.max_frame > this.frame + 1 ? this.frame + 1 : 0;
}

Sprite_Sheet.prototype.draw = function(position,scale,centered){
	if(!this.ready)
		return undefined;
	
	var x = this.frame % this.divisions_width;
	var y = (this.frame - x) / this.divisions_height;
	scale = scale != undefined ? scale : 1;
	centered = centered != undefined ? centered : true;
	
	var x_pos, y_pos;
	if(centered){
		x_pos = position.x - (this.frame_width / 2)  * scale;
		y_pos = position.y - (this.frame_height / 2)  * scale;
	}
	
	this.ctx.drawImage(
			this.sheet,
			this.frame_width * x,
			this.frame_height * y,
			this.frame_width, 
			this.frame_height,
			x_pos,
			y_pos,
			this.frame_width * scale,
			this.frame_height * scale);
		
}