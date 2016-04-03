function QR_Code(cam, model_handler){
	//Timeout for finding a new qr code
	this.timeout = 35;
	this.current_time = 0;
	this.opacity = 0;
	
	//Stores an instance of the camera and overlay object
	this.cam = cam;
	this.model_handler = model_handler;
	
	this.saved = false;
	this.object_info = {"id":"Test Object"};
	this.object = overlay.get_object(this.object_info.id);
	this.id = "";
	this.corners;
	
	this.rotation;
}

QR_Code.prototype.update = function(rectangles){
	//Updates the qr code
	this.update_qr_code(rectangles);
	
	//Reduces the opacity until 0
	this.opacity = this.opacity < 0.01 ? 0 : (this.opacity - .1);
	
	//Draws the shape of the qr code on the buffer canvas of the camera
	this.draw_overlay();
	
	//Updates the current model
	if(this.model_handler.update(this.object)){
		
	}else{
		if(this.object != undefined)
			this.object = undefined;
	}
	
	//Updates for QR timeout (Causes the qr code to be re-read)
	//May cause problems as not time based but processor based
	this.current_time++;
	if(this.current_time >= this.timeout){
		this.saved = false;
		this.model_handler.set_object_for_deletion(this.object);
		console.log("Timed out");
	}
}

QR_Code.prototype.update_qr_code = function(rectangles){
	//Validate it is a qr code
	if(this.validate(rectangles)){
		//Finds the corners
		this.corners = this.find_corners(rectangles);
		
		//Checks if there is currently not a qr code saved
		if(!this.saved){
			
			//Read the qr code for the id
			var temp_id = this.read(camera);
			
			//Checks if the reading failed
			if(typeof temp_id != "undefined"){
				console.log(temp_id);
				
				
				//If successful save id
				this.id = temp_id;
				
				this.get_model_info();
				
				this.opacity = 0.8; 
			}
			
		}else{
			//Updates the models transformations
			this.set_object_transformation();
			
			this.reset_timeout();
		}

	}
	
	return false;
}

QR_Code.prototype.get_model_info = function(){
	var self = this;
	theia_ajax_get(self.id,
		function(data){
			self.on_model_info(data);
		},
		function(data, status, e){
			self.on_model_error(data, status, e);
		});
}

QR_Code.prototype.on_model_info = function(data){
	this.saved = true;
	this.reset_timeout();
				
	this.object_info["id"] = data["name"];
	this.object_info["model_url"] = data["model_path"];
	this.object_info["texture_url"] = data["texture_path"];
	
	if(data["type"] == "dae"){
		this.model_handler.add_dae_object(
			this.object_info["id"],
			this.object_info["model_url"],
			data["offsets"]);
	}
	if(data["type"] == "obj"){
		this.model_handler.add_obj_object(
			this.object_info["id"],
			this.object_info["model_url"],
			this.object_info["texture_url"],
			data["offsets"]);
	}
}

QR_Code.prototype.on_model_error = function(data, status, e){
	console.log("%c Error loading model info:", 'color: #c00', "\n", e);
}


QR_Code.prototype.reset_timeout = function(){
	this.current_time = 0;
}

QR_Code.prototype.set_object_transformation = function(){
	this.object = overlay.get_object(this.object_info.id);
	//Position
	var x = 0, y = 0;
	this.corners.forEach(function(corner) {
		x += corner.x;
		y += corner.y;
	});
	x *= 0.25;
	y *= 0.25;
	this.model_handler.set_object_position(this.object,x,y);
	
	//Rotation
	//console.log(this.rotation);
	//Rotates the model on the z axis
	this.model_handler.set_object_rotation(this.object,{"z":Math.abs(this.rotation) - 0.75 * Math.PI});
	
	//Scale
	var scale = 0;
	var dx = this.corners[0].x - this.corners[2].x;
	var dy = this.corners[0].y - this.corners[2].y;
	scale += Math.pow(dx,2) + Math.pow(dy,2);
	scale *= 0.0000005;
	this.model_handler.set_object_scale(this.object,scale);
}

QR_Code.prototype.validate = function(rectangles){
	var red = 0, green = 0;
	
	//Counts the number of red and green rectangles
	rectangles.forEach(function(rect) {
		
		//Counts red rectangles
		if (rect.color == 'theia_red'){
			red++;
		}
		
		//Counts green rectangles
		if (rect.color == 'theia_green'){
			green++;
		}	
		
	});
	
	//True if there are 3 red and 1 green rectangles
	return (red == 3 && green == 1);
}

QR_Code.prototype.read = function(){
	var current_frame = this.cam.getFrame();
	try{
		return qrcode.decode(current_frame);
	}catch(e){
		return;
	}
}

QR_Code.prototype.get_corners = function(){
	return this.corners;
}

//Finds the corners in a clockwise rotation starting with the red diagonal to the green
QR_Code.prototype.find_corners = function(data){
	
	//Sets the corners to the outside corners rather than the top left (Some errors)
	var xAvg, yAvg;
	
	//Finds the average x value of the rectangles
	xAvg = (data[0].x + data[1].x + data[2].x + data[3].x) * 0.25;
	
	//Finds the average y value of the rectangles
	yAvg = (data[0].y + data[1].y + data[2].y + data[3].y) * 0.25;
	
	//Compares retangles to the average to find out which are to the right or below
	for(var i = 0; i < 4; i++){
		//Adds the width value to the x if to the right of the average
		if(data[i].x > xAvg)
			data[i].x += data[i].width;
		
		//Adds the height value to the y if below the average		
		if(data[i].y > yAvg)
			data[i].y += data[i].height;
	}
	
	//Preps the points array (corners)
	var points = new Array();
			
	//Finds largest distance (won't work properly if skewed)
	var l1, l2, l3;
	
	//Get distances
	l1 = Math.pow(data[0].x - data[3].x,2) + Math.pow(data[0].y - data[3].y,2);
	l2 = Math.pow(data[1].x - data[3].x,2) + Math.pow(data[1].y - data[3].y,2);
	l3 = Math.pow(data[2].x - data[3].x,2) + Math.pow(data[2].y - data[3].y,2);
	
	//Find largest distance and corresponding id
	var p1, p2, p3;
	p1 = 0;
	p2 = 1;
	p3 = 2;
	var lMax = l1;
	if(lMax < l2){
		p1 = 1;
		p2 = 0;
		p3 = 2;
		lMax = l2;
	}
	
	if(lMax < l3){
		p1 = 2;
		p2 = 0;
		p3 = 1;
		lMax = l3;
	}
	
	//First Point
	points.push({"x":data[p1].x,"y":data[p1].y});
	
	//Finds the delta between the x and y of the reds and the green rectangles (correcting for /0)
	var p1Dx, p2Dx, p3Dx, p1Dy, p2Dy, p3Dy;
	p1Dx = data[p1].x - data[3].x;
	p1Dx = p1Dx == 0 ? 0.000000000000000000000001 : p1Dx; 
	p1Dy = data[p1].y - data[3].y;
	
	p2Dx = data[p2].x - data[3].x;
	p2Dx = p2Dx == 0 ? 0.000000000000000000000001 : p2Dx; 
	p2Dy = data[p2].y - data[3].y;

	//Finds the angle between the reds and green rectangle
	var p1A, p2A, p3A;
	p1A = Math.atan2(p1Dy,p1Dx);
	p2A = Math.atan2(p1Dy,p1Dx);
	
	//Saves the rotation value
	this.rotation = p1A;
	
	//Adds last 3 points
	if(p2A - p1A < 0){
		//Second Point
		points.push({"x":data[p2].x,"y":data[p2].y});
		//Third Point
		points.push({"x":data[3].x,"y":data[3].y});
		//Fourth Point
		points.push({"x":data[p3].x,"y":data[p3].y});
	}else{
		//Second Point
		points.push({"x":data[p3].x,"y":data[p3].y});
		//Third Point
		points.push({"x":data[3].x,"y":data[3].y});
		//Fourth Point
		points.push({"x":data[p2].x,"y":data[p2].y});
	}
		
	return points;
}


//Draws the shape of the QR code onto the camera buffer canvas
QR_Code.prototype.draw_overlay = function(r, g, b, a){
	//Gets values if not set
	r = typeof r != "undefined" ? r : 0;
	g = typeof g != "undefined" ? g : 255;
	b = typeof b != "undefined" ? b : 0;
	a = typeof a != "undefined" ? a : this.opacity;

	//Exits if transparent or if there are no corners
	if(a == 0 || typeof this.corners == "undefined")
		return false;
	
	//Get camera buffer canvas context
	var c_ctx = this.cam.get_canvas_context();
	
	//Set the fill colour
	c_ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";
	
	//Draw the shape
	c_ctx.beginPath();
	c_ctx.moveTo(this.corners[0].x,this.corners[0].y);
	for(i = 1; i < this.corners.length; i++){
		c_ctx.lineTo(this.corners[i].x,this.corners[i].y);
	}
	c_ctx.closePath();
	
	//Colour the path drawn
	c_ctx.fill();
	
	
	return true;
}