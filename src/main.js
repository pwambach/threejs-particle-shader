'use strict';

(function(window){

	var THREE = window.THREE;
	var $ = window.$;

	var $container = $('#canvasContainer');
	var backgroundColor = 0x43d3d3;

	var _depthTest = false;

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

	//Orthographic Camera
	/*var d = 220;
	var orthoCamera = new THREE.OrthographicCamera( - d * ASPECT, d * ASPECT, d, - d, 1, 2500 );
	orthoCamera.position.set( -200, 0, 0 );
	orthoCamera.lookAt( new THREE.Vector3(0,0,0) );
	scene.add(orthoCamera);*/

	var camera = new THREE.PerspectiveCamera( 45, ASPECT, 0.1, 2000 );
	camera.position.set( 0, 0, 1000 );
	camera.lookAt( new THREE.Vector3(0,0,0) );
	scene.add(camera);

	var controls = new THREE.OrbitControls(camera);

	var axisHelper = new THREE.AxisHelper( 50 );
	scene.add( axisHelper );

	//Ambient Light
	var light = new THREE.AmbientLight( 0xe0e0e0 ); // soft white light
	scene.add( light );


	var textureSize = 128;


	var velTexture = [];
	velTexture[0] = new THREE.WebGLRenderTarget(
		textureSize,
		textureSize, {
			format: THREE.RGBFormat,
			generateMipmaps: false,
			magFilter: THREE.NearestFilter,
			minFilter: THREE.NearestFilter,
			type: THREE.FloatType,
			depthWrite: false,
		}
	);
	velTexture[1] = new THREE.WebGLRenderTarget(
		textureSize,
		textureSize, {
			format: THREE.RGBFormat,
			generateMipmaps: false,
			magFilter: THREE.NearestFilter,
			minFilter: THREE.NearestFilter,
			type: THREE.FloatType,
			depthWrite: _depthTest,
		}
	);

	var posTexture = [];
	posTexture[0] = new THREE.WebGLRenderTarget(
		textureSize,
		textureSize, {
			format: THREE.RGBFormat,
			generateMipmaps: false,
			magFilter: THREE.NearestFilter,
			minFilter: THREE.NearestFilter,
			type: THREE.FloatType,
			depthWrite: _depthTest,
		}
	);
	posTexture[1] = new THREE.WebGLRenderTarget(
		textureSize,
		textureSize, {
			format: THREE.RGBFormat,
			generateMipmaps: false,
			magFilter: THREE.NearestFilter,
			minFilter: THREE.NearestFilter,
			type: THREE.FloatType,
			depthWrite: _depthTest,
		}
	);

	//random
	var randMaterial = new THREE.ShaderMaterial( {
		vertexShader: window.document.getElementById( 'randVert' ).textContent,
		fragmentShader: window.document.getElementById( 'randFrag' ).textContent,
		depthWrite: false
	});
	var randScene = new THREE.Scene();


	//velocity
	var velUniforms = {
		velTex: {type: "t", value: velTexture[0]},
		posTex: {type: "t", value: posTexture[0]},
		targetPosition: {type: "v3", value: new THREE.Vector3(0.0,0.0,0.0)}
	};

	var velocityShaderMaterial = new THREE.ShaderMaterial( {
		uniforms: velUniforms,
		vertexShader: document.getElementById( 'velVert' ).textContent,
		fragmentShader: document.getElementById( 'velFrag' ).textContent
	} );

	var velScene = new THREE.Scene();

	//position
	var posUniforms = {
		velTex: {type: "t", value: velTexture[0]},
		posTex: {type: "t", value: posTexture[0]}
	};

	var positionShaderMaterial = new THREE.ShaderMaterial( {
		uniforms: posUniforms,
		vertexShader: window.document.getElementById( 'posVert' ).textContent,
		fragmentShader: window.document.getElementById( 'posFrag' ).textContent
	} );

	var posScene = new THREE.Scene();


	//display
	var dispUniforms = {
		posTex: {type: "t", value: posTexture[0]},
	};

	var displayShaderMaterial = new THREE.ShaderMaterial( {
		uniforms: dispUniforms,
		vertexShader: window.document.getElementById( 'dispVert' ).textContent,
		fragmentShader: window.document.getElementById( 'dispFrag' ).textContent,
		depthWrite: _depthTest,
		transparent: false,
		wireframe: false,
		blending: THREE.NormalBlending
	} );

	//rand Plane
	var randPlane = new THREE.Mesh(new THREE.PlaneGeometry(textureSize, textureSize), randMaterial);
	randScene.add(randPlane);

	//velocity plane
	var geometry = new THREE.PlaneGeometry( textureSize, textureSize );
	var velPlane = new THREE.Mesh( geometry, velocityShaderMaterial );
	velScene.add( velPlane );

	//position plane
	var geometry2 = new THREE.PlaneGeometry( textureSize, textureSize );
	var posPlane = new THREE.Mesh( geometry2, positionShaderMaterial );
	posScene.add( posPlane );

	//debug plane
	var geometryD = new THREE.PlaneGeometry( textureSize, textureSize );
	var debugPlane = new THREE.Mesh( geometryD, velocityShaderMaterial );
	debugPlane.position.z = -700;
	debugPlane.position.x = -400;
	debugPlane.position.y = -400;
	scene.add(debugPlane);

	var geometryC = new THREE.PlaneGeometry( textureSize, textureSize );
	var debugPlane2 = new THREE.Mesh( geometryC, positionShaderMaterial );
	debugPlane2.position.z = -700;
	debugPlane2.position.x = 400;
	debugPlane2.position.y = -400;
	scene.add(debugPlane2);


	//display plane
	var points = new THREE.Geometry();
	for (var i = 0; i < textureSize * textureSize; i++) {
		var pos = new THREE.Vector3((i % textureSize)/textureSize, Math.floor(i/textureSize)/textureSize , 0);
		points.vertices.push(pos);
	}
	var pointCloud = new THREE.PointCloud(points, displayShaderMaterial);
	// var dispPlane = new THREE.PointCloud(particles, displayShaderMaterial);

	//var particles = new THREE.PlaneGeometry( textureSize, textureSize, 2, 2 );
	//var dispPlane = new THREE.Mesh( particles, displayShaderMaterial );
	//dispPlane.position.x = -100;
	//dispPlane.position.y = 100;
	scene.add( pointCloud );


	var processCamera = new THREE.OrthographicCamera(-textureSize/2, textureSize/2, textureSize/2, -textureSize/2, -1, 0);
	var cameraHelper = new THREE.CameraHelper(processCamera);
	scene.add(cameraHelper);


	var buffer = 0;
	// Render loop

	var frames = 0;
	function render() {

		var newBuffer = (buffer+1)%2;
		velUniforms.velTex.value = velTexture[buffer];
		velUniforms.posTex.value = posTexture[buffer];
		renderer.render(velScene, processCamera, velTexture[newBuffer]);

		posUniforms.velTex.value = velTexture[newBuffer];
		posUniforms.posTex.value = posTexture[buffer];

		renderer.render(posScene, processCamera, posTexture[newBuffer]);

		dispUniforms.posTex.value = posTexture[newBuffer];

		renderer.render(scene, camera);

		if(frames < 500){
			// window.requestAnimationFrame(render);
			window.setTimeout(function(){
				render();
			}, 50);
			frames++;
		}

		buffer = newBuffer;
	}

	$container.append(renderer.domElement);

	renderer.render(randScene, processCamera, velTexture[0]);
	render();

})(window);
