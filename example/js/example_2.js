camera.position.set(0.0, 1.0, 0.0);
camera.lookAt(new THREE.Vector3(0,0,0));

// Create the particles
var particleOptions = {
  textureSize: 128,
  explodeRate: 1.0,
  pointSize: 1.5,
  targetPosition: new THREE.Vector3(0,-0.5,0),
  positionFunctionString: 'pos += vec3(0.0, 0.02, 0.0); if(pos.y > 0.5) pos.y = -0.5;',
  colorFunctionString: 'float smoothDist = smoothstep(0.0, 1.0, dist); color = vec4(vec3(1.0 - smoothDist), 1.0);'
};
var particles = new Particles(renderer, scene, particleOptions);

// Update the particles for each frame
(function updateParticles() {
  particles.update();
  window.requestAnimationFrame(updateParticles);
})();
