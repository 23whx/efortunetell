'use client';

import { useEffect, useRef } from 'react';
import { MOUNTAINS } from './ink-mountains';
import { INK_TAIJI_FRAG } from './ink-taiji-shader';

// Layers far → near. scroll: share of the scroll distance the layer lags behind; pointer: px of sway.
type Depth = { scroll: number; pointer: number };
const SUN: Depth = { scroll: 0.55, pointer: 6 };
const FAR: Depth = { scroll: 0.42, pointer: 10 };
const TAIJI: Depth = { scroll: 0.34, pointer: 8 };
const MID: Depth = { scroll: 0.26, pointer: 18 };
const MIST_A: Depth = { scroll: 0.18, pointer: 22 };
const NEAR: Depth = { scroll: 0.08, pointer: 32 };
const MIST_B: Depth = { scroll: 0.04, pointer: 36 };

const ROUGH = (seed: number) => (
  <>
    <feTurbulence type="fractalNoise" baseFrequency=".02 .08" numOctaves={3} seed={seed} result="n" />
    <feDisplacementMap in="SourceGraphic" in2="n" scale={10} xChannelSelector="R" yChannelSelector="G" />
  </>
);

function Ridge({ id, d, stops, filter }: { id: string; d: string; stops: [string, number, number][]; filter: React.ReactNode }) {
  return (
    <svg className="ink-mountains" viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax meet">
      <defs>
        <filter id={`${id}-f`} filterUnits="userSpaceOnUse" x="-50" y="-100" width="1700" height="600">{filter}</filter>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          {stops.map(([c, o, off]) => <stop key={off} offset={off} stopColor={c} stopOpacity={o} />)}
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#${id}-g)`} filter={`url(#${id}-f)`} />
    </svg>
  );
}

/** Starts the WebGL ink taiji; returns a cleanup, or null when WebGL is unavailable. */
function startInk(canvas: HTMLCanvasElement): (() => void) | null {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = shader(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
  const fs = shader(gl.FRAGMENT_SHADER, INK_TAIJI_FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uIntro = gl.getUniformLocation(prog, 'uIntro');

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const draw = (t: number) => {
    const intro = reduce ? 1 : Math.min(1, t / 6); // the drop blooms over 6 s
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, t + 8);
    gl.uniform1f(uIntro, 1 - (1 - intro) ** 3);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  // ink is soft, so no more than 1.25× CSS pixels
  const resize = () => {
    const w = Math.round(canvas.clientWidth * Math.min(devicePixelRatio || 1, 1.25));
    if (w && canvas.width !== w) {
      canvas.width = canvas.height = w;
      gl.viewport(0, 0, w, w);
      if (reduce) draw(30);
    }
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let visible = true, last = 0, raf = 0;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(canvas);
  const start = performance.now();
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (!visible || document.hidden || now - last < 32) return; // ~30 fps is plenty for slow ink
    last = now;
    draw((now - start) / 1000);
  };
  if (reduce) draw(30);
  else raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}

/** Scroll and pointer parallax: writes a transform on each [data-scroll] layer. */
function startParallax(root: HTMLElement): () => void {
  const hero = root.parentElement!;
  const layers = [...root.querySelectorAll<HTMLElement>('[data-scroll]')].map((l) => ({
    l, s: Number(l.dataset.scroll), m: Number(l.dataset.pointer),
  }));
  let sy = 0, px = 0, py = 0, cx = 0, cy = 0, raf = 0;
  const apply = () => {
    raf = 0;
    cx += (px - cx) * 0.08;
    cy += (py - cy) * 0.08;
    for (const { l, s, m } of layers) {
      l.style.transform = `translate3d(${(-cx * m).toFixed(2)}px, ${(sy * s - cy * m * 0.6).toFixed(2)}px, 0)`;
    }
    if (Math.abs(px - cx) > 0.001 || Math.abs(py - cy) > 0.001) tick();
  };
  const tick = () => { if (!raf) raf = requestAnimationFrame(apply); };
  const onScroll = () => { sy = Math.min(scrollY, hero.offsetHeight); tick(); };
  const onPointer = (e: PointerEvent) => {
    const r = hero.getBoundingClientRect();
    px = (e.clientX - r.left) / r.width - 0.5;
    py = (e.clientY - r.top) / r.height - 0.5;
    tick();
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const hover = matchMedia('(hover: hover)').matches;
  addEventListener('scroll', onScroll, { passive: true });
  if (hover) hero.addEventListener('pointermove', onPointer);
  onScroll();
  return () => {
    cancelAnimationFrame(raf);
    removeEventListener('scroll', onScroll);
    if (hover) hero.removeEventListener('pointermove', onPointer);
  };
}

/** Ink-wash background for the home hero: mountains, mist, a red sun and a rotating ink taiji. Place inside a `relative isolate overflow-hidden` hero. */
export default function InkHero() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fallback = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const stop = startInk(canvas.current!);
    if (stop) return stop;
    canvas.current!.hidden = true;
    fallback.current!.style.display = '';
  }, []);
  useEffect(() => startParallax(root.current!), []);

  const layer = (d: Depth, children: React.ReactNode) => (
    <div className="ink-layer" data-scroll={d.scroll} data-pointer={d.pointer}>{children}</div>
  );

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {layer(SUN, <div className="ink-sun" />)}
      {layer(FAR, <Ridge id="ink-far" d={MOUNTAINS.far} stops={[['#b9bcb8', 0.55, 0], ['#d9dbd7', 0, 0.75]]} filter={<feGaussianBlur stdDeviation="3" />} />)}
      {layer(TAIJI, <>
        <canvas ref={canvas} className="ink-taiji" />
        {/* static fallback without WebGL */}
        <svg ref={fallback} style={{ display: 'none' }} className="ink-taiji" viewBox="-200 -200 400 400">
          <circle r="100" fill="#fbfaf7" />
          <path d="M0,-100 A100,100 0 0,1 0,100 A50,50 0 0,1 0,0 A50,50 0 0,0 0,-100Z" fill="#1c1b19" />
          <circle cy="-50" r="13" fill="#1c1b19" />
          <circle cy="50" r="13" fill="#fbfaf7" />
          <circle r="108" fill="none" stroke="#1c1b19" strokeWidth="6" />
        </svg>
      </>)}
      {layer(MID, <Ridge id="ink-mid" d={MOUNTAINS.mid} stops={[['#8b8f8a', 0.7, 0], ['#c3c6c1', 0, 0.8]]} filter={ROUGH(11)} />)}
      {layer(MIST_A, (
        <div className="ink-mist a"><i style={{ left: '5%', top: 20, width: '38%', height: 90 }} /><i style={{ left: '50%', top: 40, width: '42%', height: 80 }} /></div>
      ))}
      {layer(NEAR, <Ridge id="ink-near" d={MOUNTAINS.near} stops={[['#3b3e3b', 0.85, 0], ['#8e928d', 0, 0.85]]} filter={ROUGH(12)} />)}
      {layer(MIST_B, (
        <div className="ink-mist b"><i style={{ left: '-2%', top: 30, width: '46%', height: 110 }} /><i style={{ left: '58%', top: 20, width: '40%', height: 100 }} /></div>
      ))}
      <div className="ink-grain" />
      <div className="ink-fade" />
    </div>
  );
}
