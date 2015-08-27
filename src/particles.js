
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
      velocityVertex: require('raw!./shaders/velocity.vert'),
      velocityFragment: window.document.getElementById( 'velFrag' ).textContent,
      positionVertex: window.document.getElementById( 'posVert' ).textContent,
      positionFragment: window.document.getElementById( 'posFrag' ).textContent,
      displayVertex: window.document.getElementById( 'dispVert' ).textContent,
      displayFragment: window.document.getElementById( 'dispFrag' ).textContent,
      randomVertex: window.document.getElementById( 'randVert' ).textContent,
      randomFragment: window.document.getElementById( 'randFrag' ).textContent
    };

    if(options.velocityFunctionString){
      shaderTextContents.velocityFragment = replaceBehaviour(shaderTextContents.velocityFragment, options.velocityFunctionString);
    }

    if(options.colorFunctionString){
      shaderTextContents.displayFragment = replaceBehaviour(shaderTextContents.displayFragment, options.colorFunctionString);
    }

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




  var replaceBehaviour = function(shader, snippet){
    console.log('old: ', shader);
    var regex = /\/\*replace\*\/[^]*\/\*replace\*\//g;
    var newShader = shader.replace(regex, snippet);
    console.log('new: ', newShader);
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
        targetPosition: {type: "v3", value: targetPosition},
        alpha: {type: "f", value: 0.5}
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
