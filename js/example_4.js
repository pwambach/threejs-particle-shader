camera.position.set( -1.5, 0.5, 2.5 );
camera.lookAt( new THREE.Vector3(0,0,0) );

//Target Sphere
var targetPosition = new THREE.Vector3(-5.0,0.0,-5.0);
var sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.05, 10, 10),
  new THREE.MeshBasicMaterial({color: 0x00ffff, wireframe: true})
);
sphere.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
scene.add(sphere);

//Plane
var plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 10, 10),
  new THREE.MeshBasicMaterial({color: 0x999999, wireframe: true})
);
plane.position.y += 0.1;
plane.rotation.x = Math.PI/-2;
plane.visible = false;
scene.add(plane);

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
    targetPosition.set(point.x, point.y, point.z);
  }
};
window.$('body').on('mousemove', setTargtePosition);




// Create geometry texture for a plane (same as in example 3)
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

var geometryTexturePlane = createGeometryTexture(horizontalPlane, size);



// Create the particles
var particleOptions = {
  textureSize: 64,
  targetPosition: targetPosition,
  targetTexture: geometryTexturePlane,
  velocityFunctionString:
    'outVelocity = direction * (dist/40.0);' +
    'float distance2 = distance(targetPosition, inPosition);' +
    'vec3 direction2 = normalize(targetPosition - inPosition);' +
    'outVelocity -= (direction2 / distance2) * 0.005 ;',
  colorFunctionString: 'color = vec4(0.0, 0.0, 0.0, 0.5);' // function input: dist, alpha
};
var particles = new Particles(renderer, scene, particleOptions);


// Update the particles for each frame
(function updateParticles() {
  particles.update();
  window.requestAnimationFrame(updateParticles);
})();
