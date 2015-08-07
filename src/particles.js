
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

  var Particles = function(renderer, scene, camera, options){

    options = options || {
      textureSize: 256,
      targetPosition: new THREE.Vector3(10.0, 0.0, 0.0)
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

    var uniforms = createUniforms(renderTargets, options.targetPosition);
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

    renderer.render(scenes.random, processCamera, renderTargets.velocity[0]);
    renderer.render(scenes.random, processCamera, renderTargets.position[0]);

    return {
      update: function(){
        update(renderer, scenes, processCamera, camera, renderTargets, uniforms);
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

  var createUniforms = function(renderTargets, targetPosition){
    return {
      velocity: {
        velTex: {type: "t", value: renderTargets.velocity[0]},
        posTex: {type: "t", value: renderTargets.position[0]},
        targetPosition: {type: "v3", value: targetPosition}
      },
      position: {
        velTex: {type: "t", value: renderTargets.velocity[0]},
        posTex: {type: "t", value: renderTargets.position[0]}
      },
      display: {
        posTex: {type: "t", value: renderTargets.position[0]}
      }
    };
  };

  var createShaderMaterials = function(shaders, uniforms, displayMaterialOptions){

    displayMaterialOptions = displayMaterialOptions || {
      transparent: true,
      wireframe: false,
      blending: THREE.NormalBlending
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

  var update = function(renderer, scenes, processCamera, camera, renderTargets, uniforms){
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
