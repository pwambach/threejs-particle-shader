uniform sampler2D posTex;
uniform float pointSize;

void main() {
  vec3 pos = texture2D(posTex, position.xy).rgb;
  gl_PointSize = pointSize;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
