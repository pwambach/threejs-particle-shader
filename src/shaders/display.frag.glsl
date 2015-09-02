varying float dist;
uniform float alpha;

void main() {
  vec4 color;
  /*replace*/
  float iDistance = smoothstep(0.0, 100.0, dist);
  color = vec4(1.0-iDistance, 0.5-iDistance, iDistance-0.1, alpha);
  /*replace*/
  gl_FragColor = color;
}
