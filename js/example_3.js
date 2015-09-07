camera.position.set( -1.5, 0.5, 2.5 );
camera.lookAt( new THREE.Vector3(0,0,0) );



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

var size = 64;
var horizontalPlane = {vertices: []};
for(var i = 0; i < size*size; i++){
  horizontalPlane.vertices.push({
    x: (((i%size)/size)-0.5)*1.2,
    y: 0.0,
    z: (((i/size)/size)-0.5)*1.2
  });
};


var geometryTexture = createGeometryTexture(new THREE.SphereGeometry(0.5, size-1, size-1), size);
var geometryTexturePlane = createGeometryTexture(horizontalPlane, size);
var geometryTextureSphere = createGeometryTexture(new THREE.SphereGeometry(0.5, size-1, size-1), size);
var geometryTextureBox = createGeometryTexture(new THREE.BoxGeometry(0.7, 0.7, 0.7, 26, 26, 26), size);


// Add textures to array for iteration
var geometryTextures = [];
geometryTextures.push(geometryTextureSphere, geometryTexturePlane, geometryTextureBox);

// Change geometryTexture.image on click
var geometryTextureIndex = 0;
$('body').on('click', function(){
  geometryTextureIndex++;
  if(geometryTextureIndex > geometryTextures.length-1){
    geometryTextureIndex = 0;
  }
  geometryTexture.image = geometryTextures[geometryTextureIndex].image;
  geometryTexture.needsUpdate = true;
});



// Create the particles
var particleOptions = {
  textureSize: 64,
  explodeRate: 0.1,
  targetTexture: geometryTexture,
  velocityFunctionString: 'outVelocity = direction * (dist/50.0);',
  colorFunctionString: 'color = vec4(0.0, 0.0, 0.0, 1.0);'
};
var particles = new Particles(renderer, scene, particleOptions);


// Update the particles for each frame
(function updateParticles() {
  particles.pointCloud.rotation.y += 0.005;
  particles.update();
  window.requestAnimationFrame(updateParticles);
})();
