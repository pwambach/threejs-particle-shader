'use strict';

(function(window){

	var THREE = window.THREE;
	var $ = window.$;

	var $container = $('#canvasContainer');
	var backgroundColor = 0x000000;

	// set the scene size
	var WIDTH = $(window.document).width();
	var HEIGHT = $(window.document).height();
	var ASPECT = WIDTH / HEIGHT;

	// WebGL Renderer
	var renderer = new THREE.WebGLRenderer({antialias: true });
	renderer.shadowMapEnabled = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;
	renderer.setClearColor(backgroundColor, 1);
	renderer.setSize(WIDTH, HEIGHT);

	// Scene
	var scene = new THREE.Scene();


	// Stats
	var stats = new window.Stats();
	stats.setMode(0);
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	window.document.body.appendChild( stats.domElement );


	//Orthographic Camera
	/*var d = 220;
	var orthoCamera = new THREE.OrthographicCamera( - d * ASPECT, d * ASPECT, d, - d, 1, 2500 );
	orthoCamera.position.set( -200, 0, 0 );
	orthoCamera.lookAt( new THREE.Vector3(0,0,0) );
	scene.add(orthoCamera);*/

	var camera = new THREE.PerspectiveCamera( 45, ASPECT, 0.1, 2000 );
	camera.position.set( -300, 0, 500 );
	camera.lookAt( new THREE.Vector3(0,0,0) );
	scene.add(camera);

	var controls = new THREE.OrbitControls(camera);

	var axisHelper = new THREE.AxisHelper( 100 );
	scene.add( axisHelper );



	var pos = new THREE.Vector3(50.0,20.0,10.0);

	var sphereMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
	var sphereGeometry = new THREE.SphereGeometry(4, 10, 10);
	var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
	sphere.position.set(pos.x, pos.y, pos.z);
	scene.add(sphere);


	// setTimeout(function(){
	// 	pos.x = 100.0;
	// 	pos.y = 50.0;
	// 	pos.z = 10.0;
	// 	sphere.position.set(pos.x, pos.y, pos.z);
	// }, 5000);

	var particleOptions = {
		textureSize: 256,
		targetPosition: pos,
		pointSize: 1.2,
		gravityFactor: 0.5
	};

	var particles = new Particles(renderer, scene, particleOptions);

	// Render loop
	function render() {
		particles.update();
		stats.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(render);
	}

	$container.append(renderer.domElement);
	render();

})(window);
