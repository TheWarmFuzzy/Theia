function new_element(attributes){
	var type = typeof attributes["element"] == "undefined" ? "canvas" : attributes["element"];
	var elem = document.createElement(type);
	
	if(typeof attributes["width"] !== "undefined")
		elem.width = attributes["width"];
	
	if(typeof attributes["height"] !== "undefined")
		elem.height = attributes["height"];
	
	if(typeof attributes["style"] !== "undefined")
		elem.style = attributes["style"];
	
	if(typeof attributes["autoplay"] !== "undefined")
		elem.autoplay = attributes["autoplay"];
	
	if(typeof attributes["preload"] !== "undefined")
		elem.preload = attributes["preload"];
	
	if(typeof attributes["muted"] !== "undefined")
		elem.muted = attributes["muted"];
	
	return elem;
}


function remap(canvas, points, width, height){
	var xPerc, yPerc;
	var r, g, b, i, mC;
	var context = canvas.getContext('2d');
	
	var pix = context.getImageData(0,0,canvas.width,canvas.height).data;
	
	var newCanvas = new_element(
		{"element":"canvas",
		"width":width,
		"height":height,
		"style":"position:absolute;top:0px;left:0px;margin:0px 0px;z-index:200;"});
	var ctx = newCanvas.getContext('2d');
	
	for(y = 0; y < height; y++){
		yPerc = y / height;
		for(x = 0; x < width; x++){
			
			xPerc = x / width;
			
			mC = get_mapped_coord(points, xPerc, yPerc);
			camera.ctx.fillStyle = "#f00";
			camera.ctx.fillRect(Math.floor(mC.x),Math.floor(mC.y),1,1);
			i = (Math.floor(mC.x) + Math.floor(mC.y) * canvas.width) * 4;
			p1 = {"r":pix[i],"g":pix[i+1],"b":pix[i+2]};
		
			i = (Math.ceil(mC.x) + Math.floor(mC.y) * canvas.width) * 4;
			p2 = {"r":pix[i],"g":pix[i+1],"b":pix[i+2]};
			
			i = (Math.floor(mC.x) + Math.ceil(mC.y) * canvas.width) * 4;
			p3 = {"r":pix[i],"g":pix[i+1],"b":pix[i+2]};
			
			i = (Math.ceil(mC.x) + Math.ceil(mC.y) * canvas.width) * 4;
			p4 = {"r":pix[i],"g":pix[i+1],"b":pix[i+2]};
			
			xR = mC.x - Math.floor(mC.x);
			yR = mC.y - Math.floor(mC.y);
			r = Math.floor((p1.r * (1 - xR) + p2.r * xR) * (1 - yR) + (p3.r * (1- xR) + p4.r * xR) * (yR));
			g = Math.floor((p1.g * (1 - xR) + p2.g * xR) * (1 - yR) + (p3.g * (1- xR) + p4.g * xR) * (yR));
			b = Math.floor((p1.b * (1 - xR) + p2.b * xR) * (1 - yR) + (p3.b * (1- xR) + p4.b * xR) * (yR));
			ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
			//console.log("rgb(" + r + "," + g + "," + b + ")");
			ctx.fillRect(x,y,1,1);
			
		}
		
	}

	return newCanvas;
}

//Points must be a quad and clockwise
function get_mapped_coord(points, xPerc, yPerc){
	mX = (points[0].x * (1 - xPerc) + points[1].x * (xPerc)) * (1 - yPerc) + (points[3].x * (1 - xPerc) + points[2].x * (xPerc)) * yPerc;
	mY = (points[0].y * (1 - yPerc) + points[3].y * (yPerc)) * (1 - xPerc) + (points[1].y * (1 - yPerc) + points[2].y * (yPerc)) * xPerc;
	
	return {"x":mX, "y":mY};
}