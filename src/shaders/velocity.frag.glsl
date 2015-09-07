varying vec2 vUv;
uniform sampler2D velTex;
uniform sampler2D posTex;
uniform sampler2D targetTex;
uniform vec3 targetPosition;
uniform float gravityFactor;
uniform int useTargetTexture;

void main() {
  vec3 inVelocity = texture2D(velTex, vUv).rgb;
  vec3 inPosition = texture2D(posTex, vUv).rgb;
  vec3 targetPos = targetPosition;
  vec3 outVelocity;
  if(useTargetTexture == 1) {
    targetPos = texture2D(targetTex, vUv).rgb;
  }

  float dist = distance(targetPos, inPosition);
  vec3 direction = normalize(targetPos - inPosition);

  /*replace*/
  dist = max(dist, 1.0);
  outVelocity = inVelocity + ((direction / dist) * gravityFactor * 0.01);
  /*replace*/

  gl_FragColor = vec4( outVelocity, 1.0 );
}
