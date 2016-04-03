function Overlay(width, height){
	this.width = typeof width != "undefined" ? width : 600;
	this.height = typeof height != "undefined" ? height : 450;
	
	this.container;
	this.camera;
	this.scene;
	this.renderer;
	
	this.clock = new THREE.Clock();
	
	this.initialize();

	this.interpolation = {
		"position":0.3,
		"rotation":0.125,
		"scale":0.2,
		"opacity":0.1};
		
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
	
	this.renderer = new THREE.WebGLRenderer({alpha:true});
	this.renderer.setPixelRatio(window.devicePixelRatio);
	this.renderer.setSize(this.width, this.height);
	this.container.appendChild(this.renderer.domElement);
	
	
}

//Adds an obj object to the scene
Overlay.prototype.add_object = function(name, meshSrc, texSrc, offsets){
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
		object.scale.x = object.scale.y = object.scale.z = 0.000000001;
		object.dest_opacity = 1;
		
		if(typeof offsets != "undefined")
			object.offsets = offsets;
		
		self.scene.add(object);
	}, 
	this.on_progress, 
	this.on_error);
	
}
	
//Adds a dae object to the scene
Overlay.prototype.add_dae_object = function(name, meshSrc, offsets){
	var self = this;
	
	var loader = new THREE.ColladaLoader();
	loader.options.convertUpAxis = false;
	loader.load(meshSrc, function(collada){
		
		dae = collada.scene;
		dae.traverse(function(child){
			
			if(child instanceof THREE.SkinnedMesh){

				try{
					var animation = new THREE.Animation(child, child.geometry.animation);
					animation.play();
					//child.material.opacity = 0;
				}catch(e){
					console.log(e);
				}
				
			}
			
		});
			
		dae.name = name;
		dae.position = 0;
		dae.scale.x = dae.scale.y = dae.scale.z = 0.000000001;
		dae.dest_opacity = 1;
		dae.position = 0;
		
		if(typeof offsets != "undefined"){
			dae.offsets = offsets;
			
			if(typeof dae.offsets.rotation != "undefined"){
				if(typeof dae.offsets.rotation.x != "undefined")
					dae.rotation.x = dae.dest_rot_x = dae.offsets.rotation.x;
				if(typeof dae.offsets.rotation.y != "undefined")
					dae.rotation.y = dae.dest_rot_y = dae.offsets.rotation.y;
				if(typeof dae.offsets.rotation.x != "undefined")
					dae.rotation.z = dae.dest_rot_z = dae.offsets.rotation.z;
			}
		}
		dae.updateMatrix();
		self.scene.add(dae);
	}, 
	this.on_progress, 
	this.on_error);
	
}

//Removes an object from the scene
Overlay.prototype.set_object_for_deletion = function(object){

	//Check if object doesn't exit
	if(typeof object == "undefined")
		return false;
	
	//If it exists set to remove it from the scene
	object.to_delete = true;
	
	return true;
}

//Removes an object from the scene
Overlay.prototype.remove_object = function(object){

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
	
	if(typeof object == "undefined")
		return false;
	
	if(typeof x == "undefined" || typeof y == "undefined")
		return false;
	
	if(typeof object.offsets != "undefined"){
		if(typeof object.offsets.position != "undefined"){
			if(typeof object.offsets.position.x != "undefined")
				x += object.offsets.position.x;
			if(typeof object.offsets.position.y != "undefined")
				y += object.offsets.position.y;
		}
	}
	
	var newPos = this.convert_to_perspective(x,y);
	
	object.dest_x = newPos.x;
	object.dest_y = newPos.y;
	
	return true;
}

//Rotates an object in the scene
Overlay.prototype.set_object_rotation = function(object,rotations){
	
	//Checks if object exists
	if(typeof object == "undefined")
		return false;
	
	
	
	//Applies offsets if they exist
	if(typeof object.offsets != "undefined"){
		if(typeof object.offsets.rotation != "undefined"){
			if(typeof object.offsets.rotation.x != "undefined")
				if(typeof rotations.x != "undefined")
					rotations.x += object.offsets.rotation.x;
			if(typeof object.offsets.rotation.y != "undefined")
				if(typeof rotations.y != "undefined")
					rotations.y += object.offsets.rotation.y;
			if(typeof object.offsets.rotation.z != "undefined")
				if(typeof rotations.z != "undefined")
					rotations.z += object.offsets.rotation.z;
		}
	}
	//Sets destination rotations
	if(typeof rotations.x != "undefined")
		object.dest_rot_x = rotations.x;
	if(typeof rotations.y != "undefined")
		object.dest_rot_y = rotations.y;
	if(typeof rotations.z != "undefined")
		object.dest_rot_z = rotations.z;
	
	return true;
}

//Scales an object in the scene
Overlay.prototype.set_object_scale = function(object,scale){
	
	//Checks if object exists
	if(typeof object == "undefined")
		return false;
	
	if(typeof object.offsets != "undefined"){
		if(typeof object.offsets.scale != "undefined"){
			scale *= object.offsets.scale;
		}
	}
	
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
	
	if(object.to_delete != undefined){
		this.remove_object(object);
		return false;
	}
		
	
	//Position
	if(typeof object.dest_x != "undefined"){
		object.position.x += (object.dest_x - object.position.x) * this.interpolation["position"];
		object.position.y += (object.dest_y - object.position.y) * this.interpolation["position"];
	}
	
	//Rotation
	if(typeof object.dest_rot_x != "undefined")
		object.rotation.x += (object.dest_rot_x - object.rotation.x) * this.interpolation["rotation"];
	if(typeof object.dest_rot_y != "undefined")
		object.rotation.y += (object.dest_rot_y - object.rotation.y) * this.interpolation["rotation"];
	if(typeof object.dest_rot_z != "undefined")
		object.rotation.z += (object.dest_rot_z - object.rotation.z) * this.interpolation["rotation"];
	
	//Scale
	if(typeof object.dest_scale != "undefined")
		object.scale.x = object.scale.y = object.scale.z = (object.dest_scale - object.scale.x) * this.interpolation["scale"] + object.scale.x;
	
	//Opacity
	object.traverse(function(child){
		if(child instanceof THREE.Mesh){
			if(typeof object.dest_opacity != "undefined"){
				if(object.dest_opacity > child.material.opacity)
					child.material.opacity += self.interpolation["opacity"];
				if(object.dest_opacity < child.material.opacity)
					child.material.opacity -= self.interpolation["opacity"];
			}
		}
	});
	
	return true;
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
	console.log("WTF");
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
	
	//Update Animation
	THREE.AnimationHandler.update( this.clock.getDelta() );
	
	//Render the frame
	this.renderer.render(this.scene, this.camera);

}