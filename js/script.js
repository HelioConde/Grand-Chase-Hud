var scene, camera, renderer, mesh, mtlLoader;
var meshFloor, ambientLight, light;

var crate, crateTexture, crateNormalMap, crateBumpMap;

var keyboard = {};
var player = { height: 1.8, speed: 0.2, turnSpeed: Math.PI * 0.02 };
var USE_WIREFRAME = false;
var timers;

function elesis() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, window.outerWidth / window.outerHeight, 0.1, 1000);

	mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		new THREE.MeshPhongMaterial({ color: 0xff4444, wireframe: USE_WIREFRAME })
	);
	mesh.position.y += 1;
	mesh.receiveShadow = true;
	mesh.castShadow = true;


	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(20, 20, 10, 10),
		new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: USE_WIREFRAME })
	);
	meshFloor.rotation.x -= Math.PI / 2;
	meshFloor.receiveShadow = true;


	ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambientLight);

	light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(0, 1, -6);
	light.castShadow = false;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 1;
	scene.add(light);


	var textureLoader = new THREE.TextureLoader();
	crateTexture = textureLoader.load("./models/arme/body.png");
	crateBumpMap = textureLoader.load("./models/arme/body.png");
	crateNormalMap = textureLoader.load("./models/arme/body.png");

	crate = new THREE.Mesh(
		new THREE.BoxGeometry(3, 3, 3),
		new THREE.MeshPhongMaterial({
			color: 0xffffff,
			map: crateTexture,
			bumpMap: crateBumpMap,
			normalMap: crateNormalMap
		})
	);

	crate.position.set(2.5, 3 / 2, 2.5);
	crate.receiveShadow = false;
	crate.castShadow = false;

	// Model/material loading!
	mtlLoader = new THREE.MTLLoader();
	mtlLoader.load("./models/elesis/Elesis.mtl", function (materials) {

		materials.preload();
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);

		objLoader.load("./models/elesis/Elesis.obj", function (mesh) {

			mesh.traverse(function (node) {
				if (node instanceof THREE.Mesh) {
					node.castShadow = false;
					node.receiveShadow = false;
				}
			});

			scene.add(mesh);
			mesh.position.set(0, 0.2, -3);
			mesh.rotation.y = 3.15;
			mesh.rotation.x = 1.4;
			mesh.scale.set(0.015, 0.015, 0.015)
			document.addEventListener('mousemove', (event) => {

				mesh.rotation.z = event.clientX / 600 + 5.38;
			});
		});
	});

	var img = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
		map: THREE.ImageUtils.loadTexture('./img/elesis.png'), transparent: true
	});
	img.map.needsUpdate = true; //ADDED

	// plane
	var plane = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), img);
	plane.overdraw = true;
	plane.rotation.x = 2.93;
	plane.rotation.z = 3.15;
	plane.position.set(0, 0.8, -2.5);
	down = false;
	timers = setInterval(() => {
		if (down == false) {
			if (plane.scale.x >= 1) {
				down = true;
			} else {
				plane.scale.x += 0.001;
				plane.scale.y += 0.001;
				plane.scale.z += 0.001;
				plane.material.opacity += 0.01;
			}
		} else {
			if (plane.scale.x <= 0.95) {
				down = false;
			} else {
				plane.scale.x -= 0.001;
				plane.scale.y -= 0.001;
				plane.scale.z -= 0.001;
				plane.material.opacity -= 0.01;
			}
		}
	}, 50);
	scene.add(plane);

	var img2 = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
		map: THREE.ImageUtils.loadTexture('./img/bg.png'), transparent: true
	});
	img2.map.needsUpdate = true; //ADDED

	// plane
	var plane2 = new THREE.Mesh(new THREE.PlaneGeometry(7, 4.1), img2);
	plane2.overdraw = true;
	plane2.rotation.x = 2.92;
	plane2.rotation.y = 0;
	plane2.rotation.z = 3.1416;
	plane2.position.set(0, 1.25, -2.5);

	camera.position.set(0, 0.9, -4.5);
	camera.lookAt(new THREE.Vector3(0, player.height, 0));

	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setSize(window.innerWidth - 10, window.innerHeight - 4);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;

	document.getElementById('background').appendChild(renderer.domElement);

	animate();
}


function lire() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, window.outerWidth / window.outerHeight, 0.1, 1000);

	mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		new THREE.MeshPhongMaterial({ color: 0xff4444, wireframe: USE_WIREFRAME })
	);
	mesh.position.y += 1;
	mesh.receiveShadow = true;
	mesh.castShadow = true;


	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(20, 20, 10, 10),
		new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: USE_WIREFRAME })
	);
	meshFloor.rotation.x -= Math.PI / 2;
	meshFloor.receiveShadow = true;


	ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambientLight);

	light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(0, 1, -6);
	light.castShadow = false;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 1;
	scene.add(light);


	var textureLoader = new THREE.TextureLoader();
	crateTexture = textureLoader.load("./models/arme/body.png");
	crateBumpMap = textureLoader.load("./models/arme/body.png");
	crateNormalMap = textureLoader.load("./models/arme/body.png");

	crate = new THREE.Mesh(
		new THREE.BoxGeometry(3, 3, 3),
		new THREE.MeshPhongMaterial({
			color: 0xffffff,
			map: crateTexture,
			bumpMap: crateBumpMap,
			normalMap: crateNormalMap
		})
	);

	crate.position.set(2.5, 3 / 2, 2.5);
	crate.receiveShadow = false;
	crate.castShadow = false;

	// Model/material loading!
	mtlLoader = new THREE.MTLLoader();
	mtlLoader.load("./models/lire/Lire.obj.mtl", function (materials) {

		materials.preload();
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);

		objLoader.load("./models/lire/Lire.obj", function (mesh) {

			mesh.traverse(function (node) {
				if (node instanceof THREE.Mesh) {
					node.castShadow = false;
					node.receiveShadow = false;
				}
			});

			scene.add(mesh);
			mesh.position.set(0, 1, -3);
			mesh.rotation.y = 3.15;
			mesh.rotation.x = 1.4;
			mesh.scale.set(1.9, 1.9, 1.9)
			document.addEventListener('mousemove', (event) => {

				mesh.rotation.z = event.clientX / 600 + 5.38;
			});
		});
	});

	var img = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
		map: THREE.ImageUtils.loadTexture('./img/lire.png'), transparent: true
	});
	img.map.needsUpdate = true; //ADDED

	// plane
	var plane = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), img);
	plane.overdraw = true;
	plane.rotation.x = 2.93;
	plane.rotation.z = 3.15;
	plane.position.set(0, 0.8, -2.5);
	down = false;
	timers = setInterval(() => {
		if (down == false) {
			if (plane.scale.x >= 1) {
				down = true;
			} else {
				plane.scale.x += 0.001;
				plane.scale.y += 0.001;
				plane.scale.z += 0.001;
				plane.material.opacity += 0.01;
			}
		} else {
			if (plane.scale.x <= 0.95) {
				down = false;
			} else {
				plane.scale.x -= 0.001;
				plane.scale.y -= 0.001;
				plane.scale.z -= 0.001;
				plane.material.opacity -= 0.01;
			}
		}
	}, 50);
	scene.add(plane);

	var img2 = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
		map: THREE.ImageUtils.loadTexture('./img/bg.png'), transparent: true
	});
	img2.map.needsUpdate = true; //ADDED

	// plane
	var plane2 = new THREE.Mesh(new THREE.PlaneGeometry(7, 4.1), img2);
	plane2.overdraw = true;
	plane2.rotation.x = 2.92;
	plane2.rotation.y = 0;
	plane2.rotation.z = 3.1416;
	plane2.position.set(0, 1.25, -2.5);


	camera.position.set(0, 0.9, -4.5);
	camera.lookAt(new THREE.Vector3(0, player.height, 0));

	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setSize(window.innerWidth - 10, window.innerHeight - 4);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;

	document.getElementById('background').appendChild(renderer.domElement);

	animate();
}


function arme() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, window.outerWidth / window.outerHeight, 0.1, 1000);

	mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		new THREE.MeshPhongMaterial({ color: 0xff4444, wireframe: USE_WIREFRAME })
	);
	mesh.position.y += 1;
	mesh.receiveShadow = true;
	mesh.castShadow = true;


	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(20, 20, 10, 10),
		new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: USE_WIREFRAME })
	);
	meshFloor.rotation.x -= Math.PI / 2;
	meshFloor.receiveShadow = true;


	ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambientLight);

	light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(0, 1, -6);
	light.castShadow = false;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 1;
	scene.add(light);


	var textureLoader = new THREE.TextureLoader();
	crateTexture = textureLoader.load("./models/arme/body.png");
	crateBumpMap = textureLoader.load("./models/arme/body.png");
	crateNormalMap = textureLoader.load("./models/arme/body.png");

	crate = new THREE.Mesh(
		new THREE.BoxGeometry(3, 3, 3),
		new THREE.MeshPhongMaterial({
			color: 0xffffff,
			map: crateTexture,
			bumpMap: crateBumpMap,
			normalMap: crateNormalMap
		})
	);

	crate.position.set(2.5, 3 / 2, 2.5);
	crate.receiveShadow = false;
	crate.castShadow = false;

	// Model/material loading!
	mtlLoader = new THREE.MTLLoader();
	mtlLoader.load("./models/arme/arme.obj.mtl", function (materials) {

		materials.preload();
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);

		objLoader.load("./models/arme/arme.obj", function (mesh) {

			mesh.traverse(function (node) {
				if (node instanceof THREE.Mesh) {
					node.castShadow = false;
					node.receiveShadow = false;
				}
			});

			scene.add(mesh);
			mesh.position.set(0, 1, -3);
			mesh.rotation.y = 3.15;
			mesh.rotation.x = 1.4;
			document.addEventListener('mousemove', (event) => {

				mesh.rotation.z = event.clientX / 600 + 5.38;
			});
		});
	});

	var img = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
		map: THREE.ImageUtils.loadTexture('./img/arme.png'), transparent: true
	});
	img.map.needsUpdate = true; //ADDED

	// plane
	var plane = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), img);
	plane.overdraw = true;
	plane.rotation.x = 2.93;
	plane.rotation.z = 3.15;
	plane.position.set(0, 0.8, -2.5);
	down = false;
	timers = setInterval(() => {
		if (down == false) {
			if (plane.scale.x >= 1) {
				down = true;
			} else {
				plane.scale.x += 0.001;
				plane.scale.y += 0.001;
				plane.scale.z += 0.001;
				plane.material.opacity += 0.01;
			}
		} else {
			if (plane.scale.x <= 0.95) {
				down = false;
			} else {
				plane.scale.x -= 0.001;
				plane.scale.y -= 0.001;
				plane.scale.z -= 0.001;
				plane.material.opacity -= 0.01;
			}
		}
	}, 50);
	scene.add(plane);

	var img2 = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
		map: THREE.ImageUtils.loadTexture('./img/bg.png'), transparent: true
	});
	img2.map.needsUpdate = true; //ADDED

	// plane
	var plane2 = new THREE.Mesh(new THREE.PlaneGeometry(7, 4.1), img2);
	plane2.overdraw = true;
	plane2.rotation.x = 2.92;
	plane2.rotation.y = 0;
	plane2.rotation.z = 3.1416;
	plane2.position.set(0, 1.25, -2.5);


	camera.position.set(0, 0.9, -4.5);
	camera.lookAt(new THREE.Vector3(0, player.height, 0));

	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setSize(window.innerWidth - 10, window.innerHeight - 4);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;

	document.getElementById('background').appendChild(renderer.domElement);

	animate();
}


function lass() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, window.outerWidth / window.outerHeight, 0.1, 1000);

	mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		new THREE.MeshPhongMaterial({ color: 0xff4444, wireframe: USE_WIREFRAME })
	);
	mesh.position.y += 1;
	mesh.receiveShadow = true;
	mesh.castShadow = true;


	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(20, 20, 10, 10),
		new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: USE_WIREFRAME })
	);
	meshFloor.rotation.x -= Math.PI / 2;
	meshFloor.receiveShadow = true;


	ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambientLight);

	light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(0, 1, -6);
	light.castShadow = false;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 1;
	scene.add(light);


	var textureLoader = new THREE.TextureLoader();
	crateTexture = textureLoader.load("./models/arme/body.png");
	crateBumpMap = textureLoader.load("./models/arme/body.png");
	crateNormalMap = textureLoader.load("./models/arme/body.png");

	crate = new THREE.Mesh(
		new THREE.BoxGeometry(3, 3, 3),
		new THREE.MeshPhongMaterial({
			color: 0xffffff,
			map: crateTexture,
			bumpMap: crateBumpMap,
			normalMap: crateNormalMap
		})
	);

	crate.position.set(2.5, 3 / 2, 2.5);
	crate.receiveShadow = false;
	crate.castShadow = false;

	// Model/material loading!
	mtlLoader = new THREE.MTLLoader();
	mtlLoader.load("./models/lass/Lass.obj.mtl", function (materials) {

		materials.preload();
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);

		objLoader.load("./models/lass/Lass.obj", function (mesh) {

			mesh.traverse(function (node) {
				if (node instanceof THREE.Mesh) {
					node.castShadow = false;
					node.receiveShadow = false;
				}
			});

			scene.add(mesh);
			mesh.position.set(0, 0.2, -3);
			mesh.rotation.y = 3.15;
			mesh.rotation.x = 1.4;
			mesh.scale.set(0.23, 0.23, 0.23)
			document.addEventListener('mousemove', (event) => {

				mesh.rotation.z = event.clientX / 600 + 5.38;
			});
		});
	});

	var img = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
		map: THREE.ImageUtils.loadTexture('./img/lass.png'), transparent: true
	});
	img.map.needsUpdate = true; //ADDED

	// plane
	var plane = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), img);
	plane.overdraw = true;
	plane.rotation.x = 2.93;
	plane.rotation.z = 3.15;
	plane.scale.set(0.95, 0.95, 0.95)
	plane.material.opacity = 0.5;
	down = false;
	timers = setInterval(() => {
		if (down == false) {
			if (plane.scale.x >= 1) {
				down = true;
			} else {
				plane.scale.x += 0.001;
				plane.scale.y += 0.001;
				plane.scale.z += 0.001;
				plane.material.opacity += 0.01;
			}
		} else {
			if (plane.scale.x <= 0.95) {
				down = false;
			} else {
				plane.scale.x -= 0.001;
				plane.scale.y -= 0.001;
				plane.scale.z -= 0.001;
				plane.material.opacity -= 0.01;
			}
		}
	}, 50);
	plane.position.set(0, 0.8, -2.5);
	scene.add(plane);

	var img2 = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
		map: THREE.ImageUtils.loadTexture('./img/bg.png'), transparent: true
	});
	img2.map.needsUpdate = true; //ADDED

	// plane
	var plane2 = new THREE.Mesh(new THREE.PlaneGeometry(7, 4.1), img2);
	plane2.overdraw = true;
	plane2.rotation.x = 2.92;
	plane2.rotation.y = 0;
	plane2.rotation.z = 3.1416;
	plane2.position.set(0, 1.25, -2.5);


	camera.position.set(0, 0.9, -4.5);
	camera.lookAt(new THREE.Vector3(0, player.height, 0));

	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setSize(window.innerWidth - 10, window.innerHeight - 4);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;

	document.getElementById('background').appendChild(renderer.domElement);

	animate();
}

function animate() {
	requestAnimationFrame(animate);

	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.02;
	crate.rotation.y += 0.01;

	renderer.render(scene, camera);
}

function keyDown(event) {
	keyboard[event.keyCode] = true;
}

function keyUp(event) {
	keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

var char = "elesis";

setTimeout(() => {
	load('elesis')
}, 1000);

function load(valor) {
	document.getElementById('background').innerHTML = "";
	clearInterval(timers);
	if (valor == "") {
		char = "elesis"
	} else {
		char = valor;
	}
	if (valor == "elesis") {
		elesis();
	} else if (valor == "arme") {
		arme();
	} else if (valor == "lire") {
		lire();
	} else if (valor == "lass") {
		lass();
	}
}


function keyUp(event) {
	if (event.keyCode == 27) {
		window.location = "index.html"
	}
}

window.addEventListener('keyup', keyUp);