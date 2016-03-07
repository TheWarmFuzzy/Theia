function Overlay(width, height){
	this.width = typeof width != "undefined" ? width : 600;
	this.height = typeof height != "undefined" ? height : 450;
	
	this.container;
	this.camera;
	this.scene;
	this.renderer;
	
	this.initialize();

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
	
	/*var manager = new THREE.LoadingManager();
	
	manager.onProgress = function (item, loaded, total){
		
	};
	
	var texture = new THREE.Texture();
	
	var onProgress = function(xhr){
		if(xhr.lengthComputable){
			
		}
	};
	
	var onError = function(xhr){};
	
	var loader = new THREE.ImageLoader(manager);
	loader.load('img/UV_Grid_Sm.jpg', function (image){
		texture.image = image;
		texture.needsUpdate = true;
	});
	
	var loader = new THREE.OBJLoader(manager);
	loader.load('https://dl.dropboxusercontent.com/u/71332725/Senior%20Project/Cougar-Unity.obj', function(object){
		object.traverse(function(child){
			if(child instanceof THREE.Mesh){
				child.material.map = texture;
			}
		});
		
		object.name = "Test Name";
		object.position = -10;
		object.scale.x = object.scale.y = object.scale.z = 2;
		self.scene.add(object);
		console.log(self.scene);
	}, onProgress, onError);*/
	
	this.add_object(
	'Test Object',
	'https://dl.dropboxusercontent.com/u/71332725/Senior%20Project/Cougar-Unity.obj',
	'img/UV_Grid_Sm.jpg');
	
	this.renderer = new THREE.WebGLRenderer({alpha:true});
	this.renderer.setPixelRatio(window.devicePixelRatio);
	this.renderer.setSize(this.width, this.height);
	this.container.appendChild(this.renderer.domElement);
	
	
}

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
				child.material.map = texture;
			}
		});
		
		object.name = name;
		object.position = -10;
		object.scale.x = object.scale.y = object.scale.z = 2;
		self.scene.add(object);
		console.log(self.scene);
	}, function(){}, function(){});
	
}

Overlay.prototype.remove_object = function(name){
	var object = this.scene.getObjectByName(name);
	if(typeof object == "undefined")
		return false;
	
	this.scene.remove(object);
	return true;
}

Overlay.prototype.animate = function(){
	var self = this;
	
	requestAnimationFrame(function(){
		self.animate();	
	});
	
	this.render();
}

Overlay.prototype.render = function(){
	this.camera.position.x = 0;
	this.camera.position.y = 0;
	this.camera.lookAt(this.scene.position);
	this.renderer.render(this.scene, this.camera);
	this.remove_object("Test Object");
}