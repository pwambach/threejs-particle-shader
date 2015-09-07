varying float dist;
uniform float alpha;

void main() {
  vec4 color;
  /*replace*/
  color = vec4(0.0, 1.0, 0.0, alpha);
  /*replace*/
  gl_FragColor = color;
}
