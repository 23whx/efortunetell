// Fragment shader for the home hero: a rigid taiji drawn in ink, with smoke diffusing outward as if in water.
export const INK_TAIJI_FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;   // seconds
uniform float uIntro;  // 0 → 1 while the drop blooms

const float R = .5;    // taiji radius (canvas half-width = 1)

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
const mat2 OCT = mat2(1.6, 1.2, -1.2, 1.6);
float fbm(vec2 p) { float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * noise(p); p = OCT * p; a *= .5; } return v; }
float fbm3(vec2 p) { float v = 0., a = .5; for (int i = 0; i < 3; i++) { v += a * noise(p); p = OCT * p; a *= .5; } return v / .875; }
mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

// soft taiji: 1 inside the black half, 0 in the white half, w = edge softness
float taijiB(vec2 s, float w) {
  float d1 = length(s - vec2(0., R * .5)), d2 = length(s - vec2(0., -R * .5)), re = R * .13;
  float b = smoothstep(-w, w, s.x);
  b = mix(b, 0., smoothstep(-w, w, R * .5 - d1));
  b = mix(b, 1., smoothstep(-w, w, R * .5 - d2));
  b = mix(b, 1., smoothstep(-w, w, re - d1));
  return mix(b, 0., smoothstep(-w, w, re - d2));
}

// brush ring around the symbol: thick on one side, thin where the brush lifts
float ringBand(vec2 s, float soft) {
  float ang = atan(s.y, s.x);
  float thick = R * (.025 + .06 * (.5 + .5 * sin(ang - 2.2)));
  float band = 1. - smoothstep(thick * (1. - soft), thick * (1. + soft), abs(length(s) - R * 1.08));
  return band * (1. - .85 * smoothstep(2.55, 3.1, abs(ang)));
}

// the water swirls: a slowly changing direction field
vec2 flow(vec2 x, float t) { float a = fbm3(x * 1.2 + vec2(t * .035, -t * .03)) * 9.; return vec2(cos(a), sin(a)); }

void main() {
  vec2 p = (gl_FragCoord.xy - .5 * uRes) / (.5 * min(uRes.x, uRes.y));
  float t = uTime, settle = 1. - uIntro;
  vec2 pp = p / (.3 + .7 * uIntro);            // the drop blooms outward into the full symbol
  float len = length(pp);
  mat2 M = rot(-t * 6.2831853 / 90.);          // one turn every 90 s

  // the current only moves the ink texture; the symbol itself stays a rigid, exact taiji
  vec2 wv = vec2(fbm(pp * 2. + vec2(0., t * .05)), fbm(pp * 2. + vec2(5.2, 1.3) - t * .04)) - .5;
  vec2 s = M * pp;
  float sl = length(s);

  // taiji core
  float w = .006 + settle * .05;   // edges sharpen as the drop settles
  float b = taijiB(s, w);
  float disk = smoothstep(-w, w, R - sl);
  // lighter currents swirling inside the ink, and a grey bleed into the white half
  float tone = 1. - .32 * smoothstep(.5, .78, fbm(s * 2.2 + wv * 3. + vec2(t * .02, 0.)));
  float bleed = max(0., taijiB(s, .07) - b) * disk * (.25 + .35 * fbm(pp * 4. + wv * 4.));
  float black = b * disk * tone + bleed;

  float ring = ringBand(s, .25 + settle) * (.82 + .18 * noise(vec2(sl * 90., atan(s.y, s.x) * 3.)));

  // ink diffusing into water: trace back along the current and pick up ink from the rim
  // (accumulated rather than max'd, with a per-pixel jittered start so the steps don't band)
  vec2 x = pp; float smoke = 0.;
  float jit = hash(gl_FragCoord.xy);
  x -= (flow(x, t) * .03 + x / (length(x) + .001) * .015) * jit;
  for (int i = 0; i < 16; i++) {
    float k = float(i) / 16.;
    x -= flow(x, t) * .03 + x / (length(x) + .001) * .015;
    smoke += ringBand(M * x, 1.) * (1. - k) * (1. - k);
  }
  smoke = min(1., smoke * .32);
  float plume = smoothstep(.3, .7, fbm3(pp * 1.3 + vec2(t * .02, 4.)));          // thicker plumes on some sides
  smoke *= smoothstep(R * 1.02, R * 1.2, len) * mix(.35, 1., plume) * .6;

  // splashes: sparse round dots beyond the ring, turning with the symbol
  vec2 cell = floor(s * 26.), fc = fract(s * 26.) - .5;
  float h = hash(cell);
  float dotR = .12 + .3 * hash(cell + 3.1);
  float splash = step(.965, h) * (1. - smoothstep(dotR - .08, dotR, length(fc)))
               * smoothstep(R * 1.18, R * 1.24, sl) * smoothstep(R * 1.6, R * 1.3, sl);

  float edge = smoothstep(1., .72, max(abs(p.x), abs(p.y)));   // never reach the canvas border
  float ink = clamp(max(max(black, ring), smoke * edge) + splash * .85, 0., 1.) * min(1., uIntro * 4.);
  float paperA = disk * (1. - b) * .92 * min(1., uIntro * 4.);

  vec3 inkCol = vec3(.075, .07, .065), paperCol = vec3(.985, .98, .965);
  gl_FragColor = vec4(inkCol * ink + paperCol * paperA * (1. - ink), ink + paperA * (1. - ink));
}
`;
