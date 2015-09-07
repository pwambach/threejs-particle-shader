'use strict';

	var raycaster = new THREE.Raycaster();

	var $container = $('#canvasContainer');
	var backgroundColor = 0xffffff;

	// set the scene size
	var WIDTH = $(window.document).width();
	var HEIGHT = $(window.document).height();
	var ASPECT = WIDTH / HEIGHT;

	// WebGL Renderer
	var renderer = new THREE.WebGLRenderer({antialias: true });
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

	// Camera
	var camera = new THREE.PerspectiveCamera( 45, ASPECT, 0.01,100 );
	camera.position.set( -3, 1, 5 );
	camera.lookAt( new THREE.Vector3(0,0,0) );
	scene.add(camera);

	// Camera controls
	var controls = new THREE.OrbitControls(camera);
	var axisHelper = new THREE.AxisHelper( 1 );
	scene.add( axisHelper );

	// Render loop
	function render() {
		stats.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(render);
	}

	// Append to DOM
	$container.append(renderer.domElement);

	// Kick off render loop
	render();
