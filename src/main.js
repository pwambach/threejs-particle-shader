'use strict';

(function(){

	var $container = $('#canvasContainer');
	var backgroundColor = 0x43d3d3;
	

	// set the scene size
	var WIDTH = $(document).width();
	var HEIGHT = $(document).height();
	var ASPECT = WIDTH / HEIGHT;

	// WebGL Renderer
	var renderer = new THREE.WebGLRenderer({antialias: true });
	renderer.shadowMapEnabled = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;;
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

	var camera = new THREE.PerspectiveCamera( 45, ASPECT, 1, 2000 );
	camera.position.set( 0, 0, 1000 );
	camera.lookAt( new THREE.Vector3(0,0,0) );
	scene.add(camera);

	var controls = new THREE.OrbitControls(camera);

	var axisHelper = new THREE.AxisHelper( 50 );
	scene.add( axisHelper );

	//Ambient Light
	var light = new THREE.AmbientLight( 0xe0e0e0 ); // soft white light
	scene.add( light );

	
	var textureSize = 512;


	var velTexture = [];
	velTexture[0] = new THREE.WebGLRenderTarget(
        textureSize,
        textureSize, {
            format: THREE.RGBFormat,
            generateMipmaps: false,
            magFilter: THREE.NearestFilter,
            minFilter: THREE.NearestFilter,
            type: THREE.FloatType
        }
    );
    velTexture[1] = new THREE.WebGLRenderTarget(
        textureSize,
        textureSize, {
            format: THREE.RGBFormat,
            generateMipmaps: false,
            magFilter: THREE.NearestFilter,
            minFilter: THREE.NearestFilter,
            type: THREE.FloatType
        }
    );


    //velocity
    var velUniforms = {
        velTex: {type: "t", value: velTexture[0]},
    };

	var velocityShaderMaterial = new THREE.ShaderMaterial( {
		uniforms: velUniforms,
	    vertexShader: document.getElementById( 'velVert' ).textContent,
	    fragmentShader: document.getElementById( 'velFrag' ).textContent
	} );


	//display
	var dispUniforms = {
        velTex: {type: "t", value: velTexture[0]},
    };

	var displayShaderMaterial = new THREE.ShaderMaterial( {
		uniforms: dispUniforms,
	    vertexShader: document.getElementById( 'dispVert' ).textContent,
	    fragmentShader: document.getElementById( 'dispFrag' ).textContent,
	    depthWrite: false,
        transparent: true,
        blending: THREE.AdditiveBlending
	} );

	var velScene = new THREE.Scene()


	//display plane
	var geometry = new THREE.PlaneGeometry( textureSize, textureSize, textureSize, textureSize );
	var velPlane = new THREE.Mesh( geometry, velocityShaderMaterial );
	velPlane.rotation.z = -Math.PI/2;
	velScene.add( velPlane );

	//debug plane
	var debugPlane = new THREE.Mesh( geometry, velocityShaderMaterial );
	debugPlane.position.z = -700;
	debugPlane.position.x = 400;
	debugPlane.position.y = -400;
	scene.add(debugPlane);


	//display plane
	var dispPlane = new THREE.Mesh( geometry, displayShaderMaterial );
	dispPlane.position.x = -100;
	dispPlane.position.y = 100;
	scene.add( dispPlane );


	var processCamera = new THREE.OrthographicCamera(-textureSize/2, textureSize/2, textureSize/2, -textureSize/2, -1, 0);
	var cameraHelper = new THREE.CameraHelper(processCamera);
	scene.add(cameraHelper);


	var buffer = 0;
	// Render loop
	function render() {

		var newBuffer = (buffer+1)%2;
		velUniforms.velTex.value = velTexture[buffer];
		dispUniforms.velTex.value = velTexture[buffer];

		renderer.render(velScene, processCamera, velTexture[newBuffer]);

	    renderer.render(scene, camera);
	    requestAnimationFrame(render);

	    buffer = newBuffer;
	}
	$container.append(renderer.domElement); 
	render();

})();

