
(function(window){

  var buffer = 0;

  //Utils
  function _extend (target, source) {
    var a = Object.create(target);
    Object.keys(source).map(function (prop) {
      if(prop in a){
        a[prop] = source[prop];
      }
    });
    return a;
  }

  var Particles = function(renderer, scene, options){

    options = options || {
      pointSize: 1.0,
      gravityFactor: 1.0,
      textureSize: 256,
      targetPosition: new THREE.Vector3(0.0, 0.0, 0.0)
    };

    var textureSize = options.textureSize;

    var renderTargets = createRenderTargets(textureSize);

    var shaderTextContents = {
      velocityVertex: window.document.getElementById( 'velVert' ).textContent,
      velocityFragment: window.document.getElementById( 'velFrag' ).textContent,
      positionVertex: window.document.getElementById( 'posVert' ).textContent,
      positionFragment: window.document.getElementById( 'posFrag' ).textContent,
      displayVertex: window.document.getElementById( 'dispVert' ).textContent,
      displayFragment: window.document.getElementById( 'dispFrag' ).textContent,
      randomVertex: window.document.getElementById( 'randVert' ).textContent,
      randomFragment: window.document.getElementById( 'randFrag' ).textContent
    };

    var uniforms = createUniforms(renderTargets, options.targetPosition, options.pointSize, options.gravityFactor);
    var shaderMaterials  = createShaderMaterials(shaderTextContents, uniforms);

    var scenes = {
      velocity: new THREE.Scene(),
      position: new THREE.Scene(),
      display: scene,
      random: new THREE.Scene()
    };

    scenes.velocity.add(createMesh(textureSize, shaderMaterials.velocity));
    scenes.position.add(createMesh(textureSize, shaderMaterials.position));
    scenes.display.add(createPointCloud(textureSize, shaderMaterials.display));
    scenes.random.add(createMesh(textureSize, shaderMaterials.random));

    //debug
    //scenes.display.add(createMesh(textureSize, shaderMaterials.velocity));
    //scenes.display.add(createMesh(textureSize, shaderMaterials.position));

    var processCamera = new THREE.OrthographicCamera(-textureSize/2, textureSize/2, textureSize/2, -textureSize/2, -1, 0);

    //start with random values
    renderer.render(scenes.random, processCamera, renderTargets.velocity[0]);
    //renderer.render(scenes.random, processCamera, renderTargets.position[0]);

    return {
      update: function(){
        update(renderer, scenes, processCamera, renderTargets, uniforms);
      }
    };
  };

  window.Particles = Particles;






  var createRenderTargets = function(size, options){
    return {
      velocity: [
        createRenderTarget(size, options),
        createRenderTarget(size, options)
      ],
      position: [
        createRenderTarget(size, options),
        createRenderTarget(size, options)
      ]
    };
  };

  var createRenderTarget = function(size, options) {
    options = options || {
      format: THREE.RGBFormat,
      generateMipmaps: false,
      magFilter: THREE.NearestFilter,
      minFilter: THREE.NearestFilter,
      type: THREE.FloatType
    };
    return new THREE.WebGLRenderTarget(size, size, options);
  };

  var createUniforms = function(renderTargets, targetPosition, pointSize, gravityFactor){
    return {
      velocity: {
        velTex: {type: "t", value: renderTargets.velocity[0]},
        posTex: {type: "t", value: renderTargets.position[0]},
        targetPosition: {type: "v3", value: targetPosition},
        gravityFactor: {type: "f", value: gravityFactor}
      },
      position: {
        velTex: {type: "t", value: renderTargets.velocity[0]},
        posTex: {type: "t", value: renderTargets.position[0]}
      },
      display: {
        pointSize: {type: "f", value: pointSize},
        posTex: {type: "t", value: renderTargets.position[0]},
        targetPosition: {type: "v3", value: targetPosition}
      }
    };
  };

  var createShaderMaterials = function(shaders, uniforms, displayMaterialOptions){

    displayMaterialOptions = displayMaterialOptions || {
      transparent: true,
      wireframe: false,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    };

    return {
      velocity: createShaderMaterial(shaders.velocityVertex, shaders.velocityFragment, uniforms.velocity),
      position: createShaderMaterial(shaders.positionVertex, shaders.positionFragment, uniforms.position),
      display: createShaderMaterial(shaders.displayVertex, shaders.displayFragment, uniforms.display, displayMaterialOptions),
      random: createShaderMaterial(shaders.randomVertex, shaders.randomFragment, null)
    };
  };

  var createShaderMaterial = function(vShader, fShader, uniforms, options) {
    options = options || {};
    var defaults = {
      uniforms: uniforms,
      vertexShader: vShader,
      fragmentShader: fShader
    };
    window.$.extend(defaults, options);
    return new THREE.ShaderMaterial(defaults);
  };

  var createMesh = function(size, material) {
    return new THREE.Mesh(
      new THREE.PlaneBufferGeometry( size, size ),
      material
    );
  };

  var createPointCloud = function(size, material) {
    var points = new THREE.Geometry();
    for (var i = 0; i < size * size; i++) {
      var pos = new THREE.Vector3((i % size)/size, Math.floor(i/size)/size , 0);
      points.vertices.push(pos);
    }
    return new THREE.PointCloud(points, material);
  };

  var update = function(renderer, scenes, processCamera, renderTargets, uniforms){
    var newBuffer = (buffer+1)%2;
    uniforms.velocity.velTex.value = renderTargets.velocity[buffer];
    uniforms.position.posTex.value = renderTargets.position[buffer];
    renderer.render(scenes.velocity, processCamera, renderTargets.velocity[newBuffer]);

    uniforms.position.velTex.value = renderTargets.velocity[newBuffer];
    uniforms.position.posTex.value = renderTargets.position[buffer];
    renderer.render(scenes.position, processCamera, renderTargets.position[newBuffer]);

    uniforms.display.posTex.value = renderTargets.position[newBuffer];

    buffer = newBuffer;
  };

})(window);

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
