'use strict';

(function(window){

	var THREE = window.THREE;
	var $ = window.$;
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


	//Target Sphere
	var pos = new THREE.Vector3(10.0,10.0,10.0);
	var sphereMaterial = new THREE.MeshBasicMaterial({color: 0x00ffff});
	var sphereGeometry = new THREE.SphereGeometry(0.1, 10, 10);
	var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
	sphere.position.set(pos.x, pos.y, pos.z);
	scene.add(sphere);

	//Plane
	var planeGeometry = new THREE.PlaneGeometry(3, 3, 10, 10);
	var planeMaterial = new THREE.MeshBasicMaterial({color: 0x999999, wireframe: true});
	var plane = new THREE.Mesh(planeGeometry, planeMaterial);
	plane.position.y += 0.1;
	plane.rotation.x = Math.PI/-2;
	plane.visible = true;
	scene.add(plane);



	// var createGeometryTexture2 = function(geometry, size){
	// 	var data = new Float32Array( size * size * 3 );
	// 	var verticesLength = geometry.vertices.length;
	// 	for (var i = 0; i < size * size; i ++) {
	// 		if(verticesLength > i){
	// 			data[i] = geometry.vertices[i] * 0.05;
	// 		} else {
	// 			data[i] = 0.0;
	// 		}
	// 	}
	// 	var dataTexture = new THREE.DataTexture(data, size, size, THREE.RGBFormat, THREE.FloatType);
	// 	dataTexture.needsUpdate = true;
	// 	return dataTexture;
	// };

	// var test = {
	// 	vertices: []
	// };
	// for (var i = 0; i < 64*64; i++){
	// 	test.vertices.push({x: (((i % 64)/64)-0.5)*1.2, y: 0.0, z: (((i/64)/64)-0.5)*1.2});
	// }

	// var octacatTexture = null;
	// $.ajax('geometry.json').done(function(fileData){
	// 	octacatTexture = createGeometryTexture2({vertices: fileData.data.vertices}, 64);
	// 	forms.push(octacatTexture);
	// });


	var createGeometryTexture = function(geometry, size){
    var data = new Float32Array( size * size * 3 );
    var verticesLength = geometry.vertices.length;
    for (var i = 0; i < size * size; i ++) {
      if(verticesLength > i){
        data[ i * 3 ]     = geometry.vertices[i].x;
        data[ i * 3 + 1 ] = geometry.vertices[i].y;
        data[ i * 3 + 2 ] = geometry.vertices[i].z;
      } else {
        data[ i * 3 ] = data[ i * 3 + 1 ] = data[ i * 3 + 2 ] = 0.0;
      }
    }
    var dataTexture = new THREE.DataTexture(data, size, size, THREE.RGBFormat, THREE.FloatType);
    dataTexture.needsUpdate = true;
    return dataTexture;
  };

	var dataTexture = createGeometryTexture(new THREE.SphereGeometry(0.5, 63, 63), 64);
	var dataTextureTest = createGeometryTexture(new THREE.PlaneGeometry(1, 1, 64, 64), 64);
	var dataTextureSphere = createGeometryTexture(new THREE.SphereGeometry(0.5, 63, 63), 64);
	var dataTextureBox = createGeometryTexture(new THREE.BoxGeometry(0.7, 0.7, 0.7, 26, 26, 26), 64);

	var dataTextures = [];
	dataTextures.push(dataTextureSphere, dataTextureBox, dataTextureTest);


	// Particles Start
	var particleOptions = {
		textureSize: 64,
		targetPosition: pos,
		targetTexture: dataTexture,
		pointSize: 2.0,
		gravityFactor: 0.5,
		velocityFunctionString:
			'outVelocity = direction * (dist/40.0);', // function input: inVeloctiy, pos, targetPosition, dist, direction, gravityFactor
		//positionFunctionString: 'pos += vec3(0.0, 0.1, 0.0); if(pos.y > 50.0) pos.y = 0.0;', // function input: velocity / output: pos
		colorFunctionString: 'color = vec4(0.0, 0.0, 0.0, 0.5);' // function input: dist, alpha
	};
	var particles = new Particles(renderer, scene, particleOptions);
	// Particles End

	//distance = max(distance, 10.0); outVelocity = (inVelocity + direction / distance ) * 0.95;
	//velocityFunctionString: 'outVelocity = direction * (distance/40.0);'

	/*
	'outVelocity = direction * (dist/40.0);' +
	'float distance2 = distance(targetPosition, inPosition);' +
	'vec3 direction2 = normalize(targetPosition - inPosition);' +
	'outVelocity -= (direction2 / distance2) * 0.005 ;'
	*/


	var dataTextureIndex = 0;
	$('body').on('keyup', function(){
		dataTextureIndex++;
		if(dataTextureIndex > dataTextures.length-1){
			dataTextureIndex = 0;
		}
		dataTexture.image = dataTextures[dataTextureIndex].image;
		dataTexture.needsUpdate = true;
	});


	// Render loop
	function render() {
		particles.update(); //Update particles each frame
		//particles.pointCloud.rotation.y += 0.005;
		stats.update();
		renderer.render(scene, camera);
		window.requestAnimationFrame(render);
	}

	// Append to DOM
	$container.append(renderer.domElement);

	// Kick off render loop
	render();


	// Get mouse intersections with plane
	var setTargtePosition = function(event) {
		var x = event.clientX || event.originalEvent.targetTouches[0].clientX;
		var y = event.clientY || event.originalEvent.targetTouches[0].clientY;
		var mouse = new THREE.Vector2();
		mouse.x = (x / window.innerWidth) * 2 - 1;
		mouse.y = -(y / window.innerHeight) * 2 + 1;
		raycaster.setFromCamera(mouse, camera);
		var intersects = raycaster.intersectObject(plane);
		if(intersects.length){
			var point = intersects[0].point;
			sphere.position.set(point.x, point.y, point.z);
			pos.set(point.x, point.y, point.z);
		}
	};
	window.$('body').on('mousemove', setTargtePosition);

})(window);
