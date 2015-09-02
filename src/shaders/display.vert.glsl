uniform sampler2D posTex;
uniform float pointSize;
uniform vec3 targetPosition;
varying float dist;

void main() {
  vec3 pos = texture2D(posTex, position.xy).rgb;
  dist = distance(targetPosition, pos);
  gl_PointSize = pointSize;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
