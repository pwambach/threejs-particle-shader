uniform float explodeRate;
varying vec2 vUv;


float rand(vec2 co){
  return fract(sin(dot(co.xy, vec2(12.8273, 67.245))) * 53726.17623);
}

void main() {
  vec3 col;
  col.r = rand(vec2(vUv.xy));
  col.g = rand(vec2(vUv.x, vUv.y + 1.0));
  col.b = 0.0; //rand(vec2(vUv.x, vUv.y + 2.0));
  col = col;
  col *= explodeRate * 100.0;

  gl_FragColor = vec4(col, 1.0);
}
