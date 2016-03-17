function Overlay(width, height){
	this.width = typeof width != "undefined" ? width : 600;
	this.height = typeof height != "undefined" ? height : 450;
	
	this.container;
	this.camera;
	this.scene;
	this.renderer;
	
	this.initialize();

	this.interpolation = {
		"position":0.3,
		"rotation":0.125,
		"scale":0.125,
		"opacity":0.05};
	this.animate();
}

Overlay.prototype.initialize = function(){
	var self = this;
	
	this.container = document.createElement('div');
	document.body.appendChild(this.container);
	
	this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 2000);
	this.camera.position.z = 250;
	
	this.scene = new THREE.Scene();
	
	var ambient = new THREE.AmbientLight( 0x101030 );
	this.scene.add(ambient);
	
	var directionalLight = new THREE.DirectionalLight( 0xffeedd );
	directionalLight.position.set( 0, 0, 1 );
	this.scene.add( directionalLight );
	
	this.add_object(
	'Test Object',
	'Cougar4.obj',
	'img/UV_Grid_Sm.jpg');
	
	this.renderer = new THREE.WebGLRenderer({alpha:true});
	this.renderer.setPixelRatio(window.devicePixelRatio);
	this.renderer.setSize(this.width, this.height);
	this.container.appendChild(this.renderer.domElement);
	
	
}

//Adds an object to the scene
Overlay.prototype.add_object = function(name, meshSrc, texSrc){
	var self = this;
	
	var manager = new THREE.LoadingManager();
	manager.onProgress = function (item, loaded, total){};
	
	var texture = new THREE.Texture();
	var loader = new THREE.ImageLoader(manager);
	loader.load(texSrc, function (image){
		texture.image = image;
		texture.needsUpdate = true;
	});
	
	var loader = new THREE.OBJLoader(manager);
	loader.load(meshSrc, function(object){
		object.traverse(function(child){
			if(child instanceof THREE.Mesh){
				try{
					//child.material.map = texture;
					child.material.opacity = 0;
				}catch(e){
					console.log(e);
				}
			}
		});
		
		object.name = name;
		//object.position = 0;
		object.scale.x = object.scale.y = object.scale.z = 0.00001;
		object.dest_opacity = 1;
		self.scene.add(object);
	}, 
	this.on_progress, 
	this.on_error);
	
}

//Removes an object from the scene
Overlay.prototype.remove_object = function(name){
	
	//Searches for object
	var object = this.scene.getObjectByName(name);
	
	//Check if object doesn't exit
	if(typeof object == "undefined")
		return false;
	
	//If it exists remove it from the scene
	this.scene.remove(object);
	
	return true;
}

//Gets an object by name from the scene
Overlay.prototype.get_object = function(name){
	var object = this.scene.getObjectByName(name);
	
	if(typeof object == "undefined")
		return;
	
	return object;
}

//Repositions an object in the scene
Overlay.prototype.set_object_position = function(object,x,y){
	
	if(typeof x == "undefined" || typeof y == "undefined")
		return false;
	
	if(typeof object == "undefined")
		return false;
	
	var newPos = this.convert_to_perspective(x,y);
	
	object.dest_x = newPos.x;
	object.dest_y = newPos.y;
	
	return true;
}

//Scales an object in the scene
Overlay.prototype.set_object_scale = function(object,scale){
	
	if(typeof object == "undefined")
		return false;
	
	object.dest_scale = scale;
	return true;
}

Overlay.prototype.set_object_opacity = function(object, opacity){
	var self = this;
	if(typeof object == "undefined")
		return false;
	
	object.dest_opacity = opacity;
	
	return true;
}

Overlay.prototype.update = function(object){
	var self = this;
	
	if(typeof object == "undefined")
		return false;
	
	//Position
	if(typeof object.dest_x != "undefined"){
		object.position.x += (object.dest_x - object.position.x) * this.interpolation["position"];
		object.position.y += (object.dest_y - object.position.y) * this.interpolation["position"];
	}
	
	//Scale
	if(typeof object.dest_scale != "undefined")
		object.scale.x = object.scale.y = object.scale.z = (object.dest_scale - object.scale.x) * this.interpolation["scale"] + object.scale.x;
	
	//Opacity
	object.traverse(function(child){
		if(child instanceof THREE.Mesh){
			if(typeof object.dest_opacity != "undefined")
				child.material.opacity += (object.dest_opacity - child.material.opacity) * self.interpolation["opacity"];
		}
	});
}

Overlay.prototype.convert_to_perspective = function (xVal,yVal){
	return {x: xVal * .466666667 - 140, y: yVal * -.577777778 + 130};
	
}

//For logging loading assets
Overlay.prototype.on_progress = function(e){
	if(e.lengthComputable){
			
	}
}

//For error logging
Overlay.prototype.on_error = function(e){
	
}

//Animates the model
Overlay.prototype.animate = function(){
	//Creates a copy of this object
	var self = this;
	
	//Yay recursion, calls itself the next available frame
	requestAnimationFrame(function(){
		self.animate();	
	});
	
	//Renders the current frame
	this.render();
}

//Renders the current frame
Overlay.prototype.render = function(){
	
	//Sets the camera position incase the position updated
	this.camera.lookAt(this.scene.position);
	
	//Render the frame
	this.renderer.render(this.scene, this.camera);

}