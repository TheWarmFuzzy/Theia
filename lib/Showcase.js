function Showcase(cam, callback){
	this.camera = cam;
	this.ctx = this.camera.get_canvas_context();
	this.callback = callback;
	
	this.logo = new Image();
	this.ready = false;
	this.x; 
	this.y;
	this.update_timer;
	this.opacity = 0;
	this.max_opacity = 0.65;
	this.state = 0;
}

Showcase.prototype.start = function(){
	var self = this;
	this.logo.onload = function(){
		self.ready = true;
		self.x = self.camera.width /2 - self.logo.width / 4;
		self.y = self.camera.height /2 - self.logo.height / 4;
		};
	this.logo.src = "../img/Theia_Logo.png";
	
	window.setTimeout(function(){
		self.update_timer = setInterval(function(){self.update();}, 1000/60);
	},5000);
	this.ctx.globalAlpha = 1;
	this.ctx.fillStyle = "#000";
	this.ctx.fillRect(0, 0, this.camera.width, this.camera.height);
	this.camera.update();
}

Showcase.prototype.update = function(){
	var self = this;
	
	if(this.ready){
		switch(this.state){
			case 0://Fading in
				this.ctx.globalAlpha = 1;
				this.ctx.fillStyle = "#000";
				this.ctx.fillRect(0, 0, this.camera.width, this.camera.height);
				
				this.opacity += this.opacity * this.max_opacity >= this.max_opacity ? 0 : 0.01;
				this.ctx.globalAlpha = this.opacity * this.max_opacity;
				this.ctx.drawImage(this.logo,this.x,this.y,this.logo.width / 2, this.logo.height / 2);
				
				if(this.opacity * this.max_opacity >= this.max_opacity){
					window.setTimeout(function(){self.state = 2;}, 3000);
					this.state = 1;
				}
				break;
			case 1: //Waiting
				this.ctx.globalAlpha = 1;
				this.ctx.fillStyle = "#000";
				this.ctx.fillRect(0, 0, this.camera.width, this.camera.height);
				
				this.ctx.globalAlpha = this.opacity * this.max_opacity ;
				this.ctx.drawImage(this.logo,this.x,this.y,this.logo.width / 2, this.logo.height / 2);
				break;
			case 2: //Fading out
				this.opacity -= this.opacity <= 0 ? 0 : 0.01;
				this.ctx.globalAlpha = this.opacity;
				this.ctx.fillStyle = "#000";
				this.ctx.fillRect(0, 0, this.camera.width, this.camera.height);
				this.ctx.globalAlpha = this.opacity * this.max_opacity;
				this.ctx.drawImage(this.logo,this.x,this.y,this.logo.width / 2, this.logo.height / 2);
				
				
				if(this.opacity <= 0)
					this.stop();
				break;
		}
		
	}
	this.camera.update();
}

Showcase.prototype.stop = function(){
	window.clearInterval(this.update_timer);
	this.ctx.globalAlpha = 1;
	this.callback();
}