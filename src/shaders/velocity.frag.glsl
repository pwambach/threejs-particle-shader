varying vec2 vUv;
uniform sampler2D velTex;
uniform sampler2D posTex;
uniform vec3 targetPosition;
uniform float gravityFactor;

void main() {
  vec3 inVelocity = texture2D(velTex, vUv).rgb;
  vec3 inPosition = texture2D(posTex, vUv).rgb;
  vec3 outVelocity;

  float distance = distance(targetPosition, inPosition);
  vec3 direction = normalize(targetPosition - inPosition);

  /*replace*/
  distance = max(distance, 1.0);
  outVelocity = inVelocity + ((direction / distance) * gravityFactor);
  /*replace*/

  gl_FragColor = vec4( outVelocity, 1.0 );
}
