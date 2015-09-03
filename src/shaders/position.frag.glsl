varying vec2 vUv;
uniform sampler2D velTex;
uniform sampler2D posTex;

void main() {
  vec3 velocity = texture2D(velTex, vUv).rgb;
  vec3 pos = texture2D(posTex, vUv).rgb;

  /*replace*/
  pos += velocity;
  /*replace*/
  
  gl_FragColor = vec4( pos, 1.0 );
}
