/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	(function(window){

	  var buffer = 0;

	  //Utils
	  function _extend (target, source) {
	    var a = Object.create(target);
	    Object.keys(source).map(function (prop) {
	      a[prop] = source[prop];
	    });
	    return a;
	  }

	  var Particles = function(renderer, scene, options){

	    var defaults = {
	      pointSize: 1.0,
	      gravityFactor: 1.0,
	      textureSize: 256,
	      explodeRate: 1.0,
	      targetPosition: new THREE.Vector3(0.0, 0.0, 0.0)
	    }
	    options = _extend(defaults, options);

	    var textureSize = options.textureSize;

	    var renderTargets = createRenderTargets(textureSize);

	    var shaderTextContents = {
	      velocityVertex: __webpack_require__(1),
	      velocityFragment: __webpack_require__(2),
	      positionVertex: __webpack_require__(3),
	      positionFragment: __webpack_require__(4),
	      displayVertex: __webpack_require__(5),
	      displayFragment: __webpack_require__(6),
	      randomVertex: __webpack_require__(7),
	      randomFragment: __webpack_require__(8),
	      noiseVertex: __webpack_require__(7),
	      noiseFragment: __webpack_require__(9)
	    };

	    if(options.velocityFunctionString){
	      shaderTextContents.velocityFragment = replaceBehaviour(shaderTextContents.velocityFragment, options.velocityFunctionString);
	    }

	    if(options.positionFunctionString){
	      shaderTextContents.positionFragment = replaceBehaviour(shaderTextContents.positionFragment, options.positionFunctionString);
	    }

	    if(options.colorFunctionString){
	      shaderTextContents.displayFragment = replaceBehaviour(shaderTextContents.displayFragment, options.colorFunctionString);
	    }

	    var uniforms = {
	      velocity: createVelocityUniforms(renderTargets, options.targetPosition, options.targetTexture, options.gravityFactor),
	      position: createPositionUniforms(renderTargets),
	      display: createDisplayUniforms(renderTargets, options.targetPosition, options.pointSize),
	      random: createRandomUniforms(options.explodeRate),
	    };

	    var shaderMaterials  = createShaderMaterials(shaderTextContents, uniforms);

	    var scenes = {
	      velocity: new THREE.Scene(),
	      position: new THREE.Scene(),
	      display: scene,
	      random: new THREE.Scene()
	    };

	    scenes.velocity.add(createMesh(textureSize, shaderMaterials.velocity));
	    scenes.position.add(createMesh(textureSize, shaderMaterials.position));
	    scenes.random.add(createMesh(textureSize, shaderMaterials.random));
	    this.pointCloud = createPoints(textureSize, shaderMaterials.display);
	    scenes.display.add(this.pointCloud);

	    //debug
	    // scenes.display.add(createMesh(1, shaderMaterials.velocity));
	    // scenes.display.add(createMesh(1, shaderMaterials.position));
	    var mesh = createMesh(1, shaderMaterials.noise);
	    mesh.position.z = -0.5;
	    mesh.position.x = 0.5;
	    mesh.position.y = 0.5;
	    // scenes.display.add(mesh);

	    var processCamera = new THREE.OrthographicCamera(-textureSize/2, textureSize/2, textureSize/2, -textureSize/2, -1, 0);

	    //start with random values
	    renderer.render(scenes.random, processCamera, renderTargets.velocity[0]);
	    renderer.render(scenes.random, processCamera, renderTargets.position[0]);


	    return {
	      update: function(){
	        update(renderer, scenes, processCamera, renderTargets, uniforms);
	      },
	      pointCloud: this.pointCloud
	    };
	  };

	  var replaceBehaviour = function(shader, snippet){
	    var regex = /\/\*replace\*\/[^]*\/\*replace\*\//g;
	    var newShader = shader.replace(regex, snippet);
	    console.log(newShader);
	    return newShader;
	  };

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
	      type: THREE.HalfFloatType
	    };
	    return new THREE.WebGLRenderTarget(size, size, options);
	  };

	  var createVelocityUniforms = function(renderTargets, targetPosition, targetTexture, gravityFactor){
	    return {
	      velTex: {type: "t", value: renderTargets.velocity[0]},
	      posTex: {type: "t", value: renderTargets.position[0]}
	    };
	  };

	  var createPositionUniforms = function(renderTargets){
	    return {
	      velTex: {type: "t", value: renderTargets.velocity[0]},
	      posTex: {type: "t", value: renderTargets.position[0]}
	    };
	  };

	  var createDisplayUniforms = function(renderTargets, targetPosition, pointSize){
	    return {
	      pointSize: {type: "f", value: pointSize},
	      posTex: {type: "t", value: renderTargets.position[0]},
	      alpha: {type: "f", value: 0.5}
	    };
	  };

	  var createRandomUniforms = function(explodeRate){
	    return {
	      explodeRate: {type: "f", value: explodeRate}
	    };
	  };

	  var createShaderMaterials = function(shaders, uniforms, displayMaterialOptions){

	    displayMaterialOptions = displayMaterialOptions || {
	      transparent: true,
	      wireframe: false,
	      blending: THREE.NormalBlending,
	      depthWrite: false
	    };

	    return {
	      velocity: createShaderMaterial(shaders.velocityVertex, shaders.velocityFragment, uniforms.velocity),
	      position: createShaderMaterial(shaders.positionVertex, shaders.positionFragment, uniforms.position),
	      display: createShaderMaterial(shaders.displayVertex, shaders.displayFragment, uniforms.display, displayMaterialOptions),
	      random: createShaderMaterial(shaders.randomVertex, shaders.randomFragment, uniforms.random),
	      noise: createShaderMaterial(shaders.noiseVertex, shaders.noiseFragment, {})
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

	  var createPoints = function(size, material) {
	    var points = new THREE.Geometry();
	    for (var i = 0; i < size * size; i++) {
	      var pos = new THREE.Vector3((i % size)/size, Math.floor(i/size)/size , 0);
	      points.vertices.push(pos);
	    }
	    return new THREE.Points(points, material);
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


	  if( true ) {
	    if( typeof module !== 'undefined' && module.exports ) {
	      exports = module.exports = Particles;
	    }
	    exports.Particles = Particles;
	  }
	  if(window) {
	    window.Particles = Particles;
	  }

	})(window);


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = "varying vec2 vUv;\n\nvoid main() {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);\n}\n"

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = "varying vec2 vUv;\nuniform sampler2D velTex;\nuniform sampler2D posTex;\n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute(vec4 x) {\n     return mod289(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min( g.xyz, l.zxy );\n  vec3 i2 = max( g.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289(i);\n  vec4 p = permute( permute( permute(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1.xy,h.z);\n  vec3 p3 = vec3(a1.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n}\n\nvec2 computeCurl(float x, float y) {\n  float  eps  =  0.01;\n  float  n1,  n2,  a,  b;\n\n  n1  =  snoise(vec3(x,  y  +  eps, 0.0));\n  n2  =  snoise(vec3(x,  y  -  eps, 0.0));\n  a  =  (n1  -  n2)/(2.0  *  eps);\n  n1  =  snoise(vec3(x  +  eps,  y, 0.0));\n  n2  =  snoise(vec3(x  -  eps,  y, 0.0));\n  b  =  (n1  -  n2)/(2.0  *  eps);\n\n  vec2 curl  =  vec2(a, -b);\n  return curl;\n}\n\nvoid main() {\n  vec3 inVelocity = texture2D(velTex, vUv).rgb;\n  vec3 inPosition = texture2D(posTex, vUv).rgb;\n\n  vec2 a = computeCurl(inPosition.x*4.0, inPosition.y*4.0);\n  vec3 velocity = vec3(a, 0.0);\n  velocity *= 0.0005;\n\n  gl_FragColor = vec4( velocity, 1.0 );\n}\n"

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = "varying vec2 vUv;\n\nvoid main() {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);\n}\n"

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = "varying vec2 vUv;\nuniform sampler2D velTex;\nuniform sampler2D posTex;\n\nvoid main() {\n  vec3 velocity = texture2D(velTex, vUv).rgb;\n  vec3 pos = texture2D(posTex, vUv).rgb;\n\n  pos += velocity;\n\n  pos = mod(pos, vec3(1.0));\n\n  gl_FragColor = vec4( pos, 1.0 );\n}\n"

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = "uniform sampler2D posTex;\nuniform float pointSize;\n\nvoid main() {\n  vec3 pos = texture2D(posTex, position.xy).rgb;\n  gl_PointSize = pointSize;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);\n}\n"

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = "varying float dist;\nuniform float alpha;\n\nvoid main() {\n  vec4 color;\n  color = vec4(0.0, 0.0, 1.0, 0.2);\n  gl_FragColor = color;\n}\n"

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = "varying vec2 vUv;\n\nvoid main() {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);\n}\n"

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = "uniform float explodeRate;\nvarying vec2 vUv;\n\n\nfloat rand(vec2 co){\n  return fract(sin(dot(co.xy, vec2(12.8273, 67.245))) * 53726.17623);\n}\n\nvoid main() {\n  vec3 col;\n  col.r = rand(vec2(vUv.xy));\n  col.g = rand(vec2(vUv.x, vUv.y + 1.0));\n  col.b = 0.0; //rand(vec2(vUv.x, vUv.y + 2.0));\n  col = col;\n  col *= explodeRate * 100.0;\n\n  gl_FragColor = vec4(col, 1.0);\n}\n"

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = "varying vec2 vUv;\n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute(vec4 x) {\n     return mod289(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min( g.xyz, l.zxy );\n  vec3 i2 = max( g.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289(i);\n  vec4 p = permute( permute( permute(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1.xy,h.z);\n  vec3 p3 = vec3(a1.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n}\n\nvec2 computeCurl(float x, float y) {\n  float  eps  =  0.01;\n  float  n1,  n2,  a,  b;\n\n  n1  =  snoise(vec3(x,  y  +  eps, 0.0));\n  n2  =  snoise(vec3(x,  y  -  eps, 0.0));\n  a  =  (n1  -  n2)/(2.0  *  eps);\n  n1  =  snoise(vec3(x  +  eps,  y, 0.0));\n  n2  =  snoise(vec3(x  -  eps,  y, 0.0));\n  b  =  (n1  -  n2)/(2.0  *  eps);\n\n  vec2 curl  =  vec2(a, -b);\n  return curl;\n}\n\nvoid main() {\n  vec2 curl = computeCurl(vUv.x*4.0, vUv.y*4.0);\n  vec3 color = vec3(curl.x, 0.0, curl.y);\n  gl_FragColor = vec4( color, 1.0 );\n}\n"

/***/ }
/******/ ]);