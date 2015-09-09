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


	// Add navigation
	var menuLeft = [
		{title: 'Example 1', url: 'index.html'},
		{title: 'Example 2', url: 'example-2.html'},
		{title: 'Example 3', url: 'example-3.html'},
		{title: 'Example 4', url: 'example-4.html'}
	];
	var menuRight = [
		{title: 'About', url: 'https://github.com/pwambach/threejs-particle-shader'},
		{title: 'View Code', url: 'https://github.com/pwambach/threejs-particle-shader/tree/master/example'},
	];
	function addMenuEntries(definition, element, classNames){
		var nav = $('<div><ul></ul></div>)');
		nav.addClass(classNames);
		$.each(definition, function(index, entry){
			var elm = $('<li><a href="' + entry.url + '">'+ entry.title +'</a></li>');
			if(window.location.pathname.indexOf(entry.url) > -1){
				elm.addClass('active');
			}
			nav.find('ul').append(elm);
		});
		element.append(nav);
	}
	addMenuEntries(menuRight, $('body'), 'nav right');
	addMenuEntries(menuLeft, $('body'), 'nav left');
