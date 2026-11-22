import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/* ───────────── content ───────────── */
const V = (id, t, wide = false) => ({ id, t, wide });
const EDITS = [V('edit1', 'Edit 01'), V('edit2', 'Edit 02'), V('edit3', 'Edit 03'), V('edit4', 'Edit 04'), V('edit6', 'Edit 05'), V('content2', 'Content 01'), V('content3', 'Content 02'), V('content1', 'Content 03')];
const AI = [V('ai1', 'AI film 01', true), V('ai2', 'AI film 02'), V('ai3', 'AI film 03'), V('ai4', 'AI film 04', true), V('ai5', 'AI film 05'), V('ai6', 'AI film 06'), V('ai7', 'AI film 07'), V('ai8', 'AI film 08'), V('ai3d', 'AI 3D')];
const POSTERS = ['poster-tarang', 'poster-tarang2', 'poster-ebs', 'poster-fail', 'poster-times', 'poster-tuition', 'poster-faculty', 'poster-future', 'poster-scholarship', 'poster-ivy', 'poster-bca', 'poster-abroad', 'poster-brillianton', 'poster-resort', 'poster-ramadan', 'poster-ramayanam', 'poster-hiring', 'poster-emerald-kids', 'poster-inline-marketing', 'logo-electus'];
const CHAPTERS = {
  doors: ['Pick a door', 'Magic happens behind them. Hover to peek, click to walk in.'],
  edits: ['Edits', 'Short-form cuts built to hold attention. Scroll to walk through.'],
  ai: ['AI films', 'Scenes that were never filmed. Keep scrolling.'],
  posters: ['Posters', 'Admissions, events and launches. Scroll or drag to spin the room.'],
};
const IDS = ['hero', 'doors', 'edits', 'ai', 'posters', 'about', 'contact'];
const Z = { doors: -60, edits: -125, ai: -225, posters: -345, end: -430 };

const $ = (s) => document.querySelector(s);
// lite mode: phones, touch screens and data-saver get fewer effects so the page loads and runs fast
const LITE = matchMedia('(pointer:coarse)').matches || innerWidth < 760 || !!navigator.connection?.saveData;
document.body.classList.toggle('lite', LITE);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const mk = (tag, attrs) => Object.assign(document.createElement(tag), attrs);
const secEls = IDS.map((id) => document.getElementById(id));
let tops = [], hs = [], total = 1;
const measure = () => { tops = secEls.map((e) => e.offsetTop); hs = secEls.map((e) => e.offsetHeight); total = Math.max(1, document.documentElement.scrollHeight - innerHeight); };

/* ───────────── lightbox ───────────── */
const lb = $('#lightbox'), lbb = $('#lbbody');
const closeLB = () => { lb.hidden = true; lbb.replaceChildren(); };
const openLB = (node) => { lbb.replaceChildren(node); lb.hidden = false; node.play?.(); };
$('#lbx').onclick = closeLB; lb.onclick = (e) => e.target === lb && closeLB();
addEventListener('keydown', (e) => e.key === 'Escape' && closeLB());
// the corridor loops a 9-second preview; clicking opens the full video with sound (falls back to the preview if the full file is missing)
const openVideo = (id) => {
  const v = mk('video', { src: `/media/full/${id}.mp4`, playsInline: true, controls: true, autoplay: true, preload: 'auto' });
  v.onerror = () => { v.onerror = null; v.src = `/media/vid/${id}.mp4`; v.loop = true; v.play().catch(() => {}); };
  openLB(v); v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
};
const openImage = (id) => openLB(mk('img', { src: `/media/img/${id}.webp`, alt: 'Poster design' }));
$('#yr').textContent = new Date().getFullYear();

/* ───────────── renderer / scene ───────────── */
const canvas = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !LITE, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, LITE ? 1.25 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x05060a);
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05060a, 0.017);
const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 600);
scene.add(new THREE.HemisphereLight(0xaab4ff, 0x2a1208, 1.0));
const sun = new THREE.DirectionalLight(0xfff0dd, 2.4); sun.position.set(2, 4, 8); scene.add(sun);

const mgr = new THREE.LoadingManager();
mgr.onProgress = (_, a, b) => { const f = Math.round(a / b * 72); $('#ldtime').textContent = '00:0' + Math.floor(f / 24) + ':' + String(f % 24).padStart(2, '0'); };
mgr.onLoad = () => setTimeout(() => $('#loader').classList.add('done'), 250);
const texLoader = new THREE.TextureLoader(mgr);
const loadTex = (url) => { const t = texLoader.load(url); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = LITE ? 2 : 8; return t; };

// dust that streaks past while you fly between rooms
{
  const N = LITE ? 700 : 2600, p = new Float32Array(N * 3), c = new Float32Array(N * 3), col = [new THREE.Color(0xff6a13), new THREE.Color(0x2f7bff), new THREE.Color(0xffffff)];
  for (let i = 0; i < N; i++) { p.set([(Math.random() - .5) * 60, (Math.random() - .5) * 28, 14 - Math.random() * 470], i * 3); const k = col[(Math.random() * 3) | 0]; c.set([k.r, k.g, k.b], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: .07, vertexColors: true, transparent: true, opacity: .8, depthWrite: false, blending: THREE.AdditiveBlending })));
}
const haloTex = (() => { const c = mk('canvas', { width: 128, height: 128 }), x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, '#fff'); g.addColorStop(.35, '#fff8'); g.addColorStop(1, '#fff0'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
const additive = (color, opacity) => new THREE.MeshBasicMaterial({ map: haloTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });

/* ───────────── hero: glowing halo + portrait lit by the cursor ───────────── */
const hero = new THREE.Group(); scene.add(hero);
const heroMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: { uTex: { value: loadTex('/media/img/ash-hero.webp') }, uMouse: { value: new THREE.Vector2(.5, .6) }, uTime: { value: 0 } },
  vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: `varying vec2 vUv;uniform sampler2D uTex;uniform vec2 uMouse;uniform float uTime;
  void main(){
    vec2 uv=vUv; float d=distance(uv*vec2(.7,1.),uMouse*vec2(.7,1.)); float spot=smoothstep(.6,.0,d);
    vec2 o=(uv-uMouse)*.014*spot;
    vec3 c=vec3(texture2D(uTex,uv+o*1.8+vec2(.003,0.)*spot).r,texture2D(uTex,uv+o).g,texture2D(uTex,uv+o*.3-vec2(.003,0.)*spot).b);
    c*=.62+.7*spot;
    vec2 e=smoothstep(0.,.16,uv)*smoothstep(1.,.84,uv); float a=e.x*e.y;
    float n=fract(sin(dot(uv*vec2(1000.,700.)+uTime,vec2(12.9898,78.233)))*43758.5453); c+=(n-.5)*.025;
    gl_FragColor=vec4(c,a);
    #include <colorspace_fragment>
  }`,
});
const portrait = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), heroMat);
const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), additive(0xff5a10, .85));
const haloBlue = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), additive(0x2f7bff, .55));
const neon = (color, arc) => new THREE.Mesh(new THREE.RingGeometry(.985, 1, 128, 1, 0, arc), new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
const ring = neon(0xffa24a, Math.PI * 2), ring2 = neon(0x4d93ff, Math.PI * 1.1);
hero.add(haloBlue, halo, ring, ring2, portrait);
function layoutHero() {
  const visH = 2 * 6 * Math.tan(THREE.MathUtils.degToRad(19)), visW = visH * cam.aspect, wide = cam.aspect > 1;
  const h = visH * (wide ? 1.12 : .8), w = h * 933 / 1400, x = wide ? visW * .22 : 0, y = wide ? -.1 : visH * .08;
  portrait.scale.set(w, h, 1); portrait.position.set(x, y, 0);
  const R = h * .36, hy = y + h * .17;
  halo.scale.setScalar(R * 3.4); halo.position.set(x, hy, -.4); haloBlue.scale.setScalar(R * 4.4); haloBlue.position.set(x - R * .5, hy + R * .3, -.5);
  ring.scale.setScalar(R); ring.position.set(x, hy, -.3); ring2.scale.setScalar(R * 1.12); ring2.position.set(x, hy, -.25);
}

/* ───────────── the doors ───────────── */
const doors = new THREE.Group(); doors.position.set(0, 0, Z.doors); scene.add(doors);
const DOOR_DEFS = [
  { label: 'Edits', go: 'edits', color: 0xff6a13, thumb: '/media/vid/edit1.jpg' },
  { label: 'AI films', go: 'ai', color: 0x2f7bff, thumb: '/media/vid/ai2.jpg' },
  { label: 'Posters', go: 'posters', color: 0x8b5cff, thumb: '/media/img/poster-tarang.webp' },
  { label: 'Say hi', go: 'contact', color: 0x19c79a, thumb: '/media/img/ash-studio.webp' },
];
const DW = 2.5, DH = 4.2, doorObjs = [];
function plaque(label) {
  const c = mk('canvas', { width: 320, height: 96 }), x = c.getContext('2d');
  x.fillStyle = '#e8b657'; x.beginPath(); x.roundRect(4, 4, 312, 88, 14); x.fill();
  x.strokeStyle = '#7a5a1c'; x.lineWidth = 4; x.stroke();
  x.fillStyle = '#2a1d06'; x.font = '800 52px "Big Shoulders Display", Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(label.toUpperCase(), 160, 52);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function makeDoor(def) {
  const g = new THREE.Group(), frameMat = new THREE.MeshStandardMaterial({ color: 0x15161d, roughness: .6 });
  const fr = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .5), frameMat); m.position.set(x, y, -.1); g.add(m); };
  fr(.22, DH + .22, -DW / 2 - .11, DH / 2); fr(.22, DH + .22, DW / 2 + .11, DH / 2); fr(DW + .44, .22, 0, DH + .11);
  const inner = new THREE.Mesh(new THREE.PlaneGeometry(DW, DH), new THREE.MeshBasicMaterial({ map: loadTex(def.thumb), color: 0x333333, toneMapped: false }));
  inner.position.set(0, DH / 2, -.34); g.add(inner);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(DW * 2.4, DH * 1.5), additive(def.color, 0)); glow.position.set(0, DH / 2, -.2); g.add(glow);
  const light = new THREE.PointLight(def.color, 0, 14); light.position.set(0, DH / 2, 1.2); g.add(light);
  const pivot = new THREE.Group(); pivot.position.set(-DW / 2, 0, .05); g.add(pivot);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(DW, DH, .14), new THREE.MeshStandardMaterial({ color: def.color, roughness: .42, metalness: .15 })); panel.position.set(DW / 2, DH / 2, 0); pivot.add(panel);
  const insetMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(def.color).multiplyScalar(.7), roughness: .5 });
  [.66, .27].forEach((f) => { const i = new THREE.Mesh(new THREE.BoxGeometry(DW * .68, DH * .3, .04), insetMat); i.position.set(DW / 2, DH * f, .08); pivot.add(i); });
  const gold = new THREE.MeshStandardMaterial({ color: 0xe8b657, roughness: .25, metalness: .9 });
  const knob = new THREE.Mesh(new THREE.SphereGeometry(.1, 24, 16), gold); knob.position.set(DW - .24, DH * .48, .16); pivot.add(knob);
  const plq = new THREE.Mesh(new THREE.PlaneGeometry(1.25, .375), new THREE.MeshBasicMaterial({ map: plaque(def.label), transparent: true, toneMapped: false })); plq.position.set(DW / 2, DH * .76, .1); pivot.add(plq);
  const hit = new THREE.Mesh(new THREE.PlaneGeometry(DW + .3, DH + .3), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); hit.position.set(0, DH / 2, .4); g.add(hit);
  g.userData = { def, pivot, inner, glow, light, open: 0, panel, hit }; hit.userData.door = g;
  doors.add(g); doorObjs.push(g);
}
function layoutDoors() {
  const stacked = cam.aspect < .95, n = DOOR_DEFS.length;
  doorObjs.forEach((g, i) => {
    if (stacked) { g.position.set((i % 2 ? 1 : -1) * 1.85, 1.0 - ((i / 2) | 0) * 3.15 - DH / 2 * .7, 0); g.scale.setScalar(.7); }
    else { g.position.set((i - (n - 1) / 2) * (DW + .85), -DH / 2 + .2, 0); g.scale.setScalar(Math.min(1, cam.aspect * .62)); }
  });
}
document.fonts.load('800 40px "Big Shoulders Display"').finally(() => { DOOR_DEFS.forEach(makeDoor); layoutDoors(); });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x0a0b12, roughness: .7, metalness: .1 }));
floor.rotation.x = -Math.PI / 2; floor.position.set(0, -2.1, Z.doors); scene.add(floor);
const grid = (zc, len) => { const g = new THREE.GridHelper(len, len / 2, 0xff6a13, 0x2f7bff); g.material.transparent = true; g.material.opacity = .28; g.position.set(0, -2.3, zc); scene.add(g); };
grid(Z.doors, 60);

/* ───────────── video corridors ───────────── */
const STEP = 5.4, tunnels = {};
function buildTunnel(key, list, z0) {
  const items = [];
  list.forEach((v, i) => {
    const side = i % 2 ? -1 : 1, w = v.wide ? 4.8 : 2.05, h = v.wide ? 2.7 : 3.65, col = i % 2 ? 0x2f7bff : 0xff6a13;
    const g = new THREE.Group(); g.position.set(side * (v.wide ? 3.7 : 2.55), Math.sin(i * 1.9) * .3, z0 - i * STEP); g.rotation.y = -side * .3;
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(w * 2.1, h * 1.6), additive(col, .45)); glow.position.z = -.05;
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(w + .12, h + .12), new THREE.MeshBasicMaterial({ color: col })); edge.position.z = -.01;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: loadTex(`/media/vid/${v.id}.jpg`), toneMapped: false }));
    g.add(glow, edge, m); scene.add(g);
    const it = { v, g, m, z: g.position.z, vid: null, tex: null, poster: m.material.map }; m.userData.tunnel = it; items.push(it);
  });
  grid(z0 - (list.length * STEP) / 2, list.length * STEP + 20);
  tunnels[key] = { items, z0, end: z0 - (list.length - 1) * STEP };
}
buildTunnel('edits', EDITS, Z.edits); buildTunnel('ai', AI, Z.ai);
function setVideo(it, on) {
  if (on && !it.vid) {
    const v = mk('video', { src: `/media/vid/${it.v.id}.mp4`, loop: true, muted: true, playsInline: true, preload: 'auto' }); v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.play().catch(() => {}); it.vid = v; it.tex = new THREE.VideoTexture(v); it.tex.colorSpace = THREE.SRGBColorSpace; it.m.material.map = it.tex; it.m.material.needsUpdate = true;
  } else if (!on && it.vid) { it.vid.pause(); it.vid.removeAttribute('src'); it.vid.load(); it.tex.dispose(); it.vid = it.tex = null; it.m.material.map = it.poster; it.m.material.needsUpdate = true; }
}

/* ───────────── poster room (you stand in the middle) ───────────── */
const room = new THREE.Group(); room.position.set(0, 0, Z.posters); scene.add(room);
const RR = 9.5, posterMeshes = [];
const NOTES = { 'poster-tarang': 'Event poster: Tarang 26', 'poster-tarang2': 'Event poster: Tarang 26', 'poster-ebs': 'Admission orientation poster', 'poster-fail': 'Plus Two tuition poster', 'poster-times': 'Faculty hiring poster', 'poster-tuition': '8th Std tuition poster', 'poster-faculty': 'Faculty required poster', 'poster-future': 'Admissions open poster', 'poster-scholarship': 'Scholarship poster', 'poster-ivy': 'Ivy League mentorship poster', 'poster-bca': 'BCA, BSc AI and B.Ed admissions', 'poster-abroad': 'Study abroad orientation poster', 'poster-brillianton': 'Brillianton campaign poster', 'poster-resort': 'Emerald Hotels and Resorts poster', 'poster-ramadan': 'Ramadan special program poster', 'poster-ramayanam': 'Ramayanam event poster', 'poster-hiring': 'School hiring poster', 'poster-emerald-kids': 'Emerald International School campaign', 'poster-inline-marketing': 'Digital marketing course poster', 'logo-electus': 'Logo: Electus 26' };
function noteTex(text) {
  // the note sits in the peeled corner (bottom-right), so it is right-aligned, short lines, anchored to the bottom
  const c = mk('canvas', { width: 256, height: 358 }), x = c.getContext('2d'); x.fillStyle = '#12131a'; x.fillRect(0, 0, 256, 358);
  x.fillStyle = '#f2efe9'; x.font = '700 18px "Hanken Grotesk", sans-serif'; x.textAlign = 'right'; x.textBaseline = 'alphabetic';
  const words = text.split(' '), lines = []; let cur = '';
  words.forEach((w) => { const t = cur ? cur + ' ' + w : w; if (x.measureText(t).width > 92 && cur) { lines.push(cur); cur = w; } else cur = t; }); lines.push(cur);
  const show = lines.slice(0, 3); show.forEach((l, i) => x.fillText(l, 248, 350 - (show.length - 1 - i) * 22));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const PEEL_FS = `varying vec2 vUv;uniform sampler2D uTex;uniform sampler2D uNote;uniform float uPeel;
void main(){
  vec2 uv=vUv; float d=(1.-uv.x)+uv.y; float t=uPeel*.6; float f=t*1.4;
  vec3 c=texture2D(uTex,uv).rgb;
  if(uPeel>.001){
    if(d<t){ c=texture2D(uNote,uv).rgb; c*=1.-.45*smoothstep(t-.12,t,d); }
    else if(d<f){ float k=(d-t)/(f-t); c=mix(vec3(.96,.93,.87),vec3(.6,.58,.54),k*k); }
    else if(d<f+.09){ c*=mix(.55,1.,(d-f)/.09); }
  }
  gl_FragColor=vec4(c,1.);
  #include <colorspace_fragment>
}`;
POSTERS.forEach((p, i) => {
  const th = (i / POSTERS.length) * Math.PI * 2, holder = new THREE.Group();
  const mat = new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: { uTex: { value: loadTex(`/media/img/${p}.webp`) }, uNote: { value: noteTex(NOTES[p] || 'Poster design') }, uPeel: { value: 0 } }, vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader: PEEL_FS });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 3.5), mat);
  m.position.set(0, 0, -RR); holder.rotation.y = -th; holder.add(m); room.add(holder);
  m.userData.poster = p; m.userData.base = -RR; posterMeshes.push(m);
});

/* ───────────── editing desk (Contact): the monitor plays an edit ───────────── */
const desk = new THREE.Group(); desk.visible = false; scene.add(desk);
let deskScreen, deskVid = null, deskTex = null;
{
  const dark = new THREE.MeshStandardMaterial({ color: 0x15161d, roughness: .5, metalness: .3 }), black = new THREE.MeshStandardMaterial({ color: 0x08080b, roughness: .35, metalness: .5 });
  const add = (geo, mat, x, y, z, rx = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.x = rx; desk.add(m); return m; };
  add(new THREE.BoxGeometry(3.4, .1, 1.5), dark, 0, 0, 0);
  add(new THREE.BoxGeometry(.1, 1.7, 1.3), dark, -1.55, -.9, 0); add(new THREE.BoxGeometry(.1, 1.7, 1.3), dark, 1.55, -.9, 0);
  add(new THREE.BoxGeometry(2.04, 1.24, .07), black, 0, 1.05, -.35);
  deskScreen = add(new THREE.PlaneGeometry(1.92, 1.12), new THREE.MeshBasicMaterial({ map: loadTex('/media/vid/edit1.jpg'), toneMapped: false }), 0, 1.05, -.31);
  deskScreen.userData.desk = true;
  add(new THREE.BoxGeometry(.12, .5, .1), black, 0, .35, -.37); add(new THREE.BoxGeometry(.8, .04, .45), black, 0, .08, -.3);
  add(new THREE.BoxGeometry(1.1, .03, .32), black, 0, .07, .38);
  add(new THREE.BoxGeometry(.95, .04, .62), black, -1.1, .08, .15, -.12);
  add(new THREE.PlaneGeometry(.86, .54), new THREE.MeshBasicMaterial({ color: 0x2f7bff }), -1.1, .106, .15, -Math.PI / 2 - .12);
  add(new THREE.BoxGeometry(.52, .34, .32), black, 1.15, .27, .1);
  const lens = add(new THREE.CylinderGeometry(.13, .15, .2, 24), dark, 1.15, .27, .32, Math.PI / 2);
  add(new THREE.CircleGeometry(.1, 24), new THREE.MeshBasicMaterial({ color: 0x2f7bff }), 1.15, .27, .425);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.2), additive(0xff6a13, .35)); glow.position.set(0, 1.05, -.6); desk.add(glow);
}
function deskVideo(on) {
  if (LITE) return;
  if (on && !deskVid) { deskVid = mk('video', { src: '/media/vid/edit1.mp4', loop: true, muted: true, playsInline: true }); deskVid.setAttribute('muted', ''); deskVid.play().catch(() => {}); deskTex = new THREE.VideoTexture(deskVid); deskTex.colorSpace = THREE.SRGBColorSpace; deskScreen.material.map = deskTex; deskScreen.material.needsUpdate = true; }
  else if (!on && deskVid) { deskVid.pause(); deskTex.dispose(); deskVid = deskTex = null; deskScreen.material.map = loadTex('/media/vid/edit1.jpg'); deskScreen.material.needsUpdate = true; }
}

/* (old rope sprite kept hidden) */
const mini = new THREE.Group(); mini.visible = false;
{
  const h = 3.2, m = new THREE.Mesh(new THREE.PlaneGeometry(h * .592, h), new THREE.MeshBasicMaterial({ map: loadTex('/media/img/ash-mini.webp'), transparent: true, toneMapped: false, depthWrite: false }));
  m.position.y = -h / 2; m.userData.mini = true; mini.add(m); mini.userData = { a: 0, w: 0, mesh: m };
}

/* real 3D mini Ashique (Blender): waits at the contact desk, looks at your cursor */
const mc = new THREE.Group(); mc.visible = false; scene.add(mc);
let mcHead, mcArmR, mcArmL, mcLegR, mcLegL, jumpT = 0, waveT = 2;
new GLTFLoader().load('/models/mini-ashique.glb', (g) => {
  const m = g.scene; m.scale.setScalar(1.9); mc.add(m);
  mcHead = m.getObjectByName('Head'); mcArmR = m.getObjectByName('ArmR'); mcArmL = m.getObjectByName('ArmL'); mcLegR = m.getObjectByName('LegR'); mcLegL = m.getObjectByName('LegL');
  m.traverse((o) => { if (o.isMesh) { o.userData.mini = true; o.frustumCulled = false; } });
});
const mcLight = new THREE.PointLight(0xff8a3a, 30, 12); mcLight.position.set(0, 2, Z.end + 3); scene.add(mcLight);
const mcLight2 = new THREE.PointLight(0xffa060, 22, 10); mcLight2.position.set(-3, 1, Z.doors + 5); scene.add(mcLight2);

/* ───────────── sound (synthesized, off until you switch it on) ───────────── */
let ac, master, sndOn = false;
function initAudio() {
  ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.connect(master);
  const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .06; lg.gain.value = 320; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
  [55, 82.41, 110, 164.81, 220.5].forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = (i - 2) * 6; g.gain.value = .05 / (1 + i * .35); o.connect(g); g.connect(lp); o.start(); });
}
function sfx(kind) {
  if (!sndOn || !ac) return; const t0 = ac.currentTime, g = ac.createGain(); g.connect(master);
  if (kind === 'click') { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(220, t0); o.frequency.exponentialRampToValueAtTime(55, t0 + .16); g.gain.setValueAtTime(.9, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + .22); o.connect(g); o.start(t0); o.stop(t0 + .25); }
  else { const len = ac.sampleRate * .4, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len); const n = ac.createBufferSource(), f = ac.createBiquadFilter(); n.buffer = buf; f.type = 'bandpass'; f.frequency.setValueAtTime(300, t0); f.frequency.exponentialRampToValueAtTime(1800, t0 + .35); g.gain.value = .35; n.connect(f); f.connect(g); n.start(t0); }
}
const sndBtn = $('#snd');
sndBtn.addEventListener('click', () => {
  if (!ac) initAudio(); sndOn = !sndOn; ac.resume();
  master.gain.cancelScheduledValues(ac.currentTime); master.gain.linearRampToValueAtTime(sndOn ? .6 : 0, ac.currentTime + .8);
  sndBtn.setAttribute('aria-pressed', sndOn); sndBtn.querySelector('span').textContent = sndOn ? 'Sound on' : 'Sound off'; sfx('click');
});

/* ───────────── film look: light leaks + cursor trail ───────────── */
const fx = $('#fx'), fxc = fx.getContext('2d'), leak = $('#leak'), trail = []; let lx = .7, ly = .3;
addEventListener('pointermove', (e) => { if (!LITE) { trail.push({ x: e.clientX, y: e.clientY, t: performance.now() }); if (trail.length > 40) trail.shift(); } });
function drawFx() {
  if (LITE) return;
  lx = lerp(lx, ptr.px / innerWidth || .7, .05); ly = lerp(ly, ptr.py / innerHeight || .3, .05);
  leak.style.setProperty('--mx', lx * 100 + '%'); leak.style.setProperty('--my', ly * 100 + '%');
  fxc.clearRect(0, 0, fx.width, fx.height); fxc.globalCompositeOperation = 'lighter'; const now = performance.now();
  for (let i = trail.length - 1; i >= 0; i--) { const q = trail[i], a = (now - q.t) / 700; if (a >= 1) { trail.splice(i, 1); continue; } const r = 16 * (1 - a) + 2, g = fxc.createRadialGradient(q.x, q.y, 0, q.x, q.y, r); g.addColorStop(0, `rgba(255,150,60,${.55 * (1 - a)})`); g.addColorStop(1, 'rgba(255,106,19,0)'); fxc.fillStyle = g; fxc.beginPath(); fxc.arc(q.x, q.y, r, 0, 6.3); fxc.fill(); }
}

/* ───────────── input ───────────── */
const ptr = { x: 0, y: 0, px: 0, py: 0, vx: 0 };
const ray = new THREE.Raycaster(), v2 = new THREE.Vector2(), hov = $('#hover');
let ringDrag = 0, ringVel = 0, drag = null, hovered = null, scrollV = 0, lastY = scrollY;
addEventListener('pointermove', (e) => {
  const nx = e.clientX / innerWidth * 2 - 1; ptr.vx = nx - ptr.x; ptr.x = nx; ptr.y = -(e.clientY / innerHeight * 2 - 1); ptr.px = e.clientX; ptr.py = e.clientY;
  if (drag) { ringVel = (e.clientX - drag.x) * .0035; ringDrag += ringVel; drag.moved += Math.abs(e.clientX - drag.x); drag.x = e.clientX; }
});
addEventListener('pointerdown', (e) => { if (e.target === canvas) drag = { x: e.clientX, moved: 0 }; });
addEventListener('pointerup', () => { if (drag && drag.moved < 8 && hovered) activate(hovered); drag = null; });
function activate(h) {
  if (h.door) { sfx('click'); goTo(h.door.userData.def.go); }
  else if (h.tunnel) openVideo(h.tunnel.v.id);
  else if (h.poster) openImage(h.poster);
  else if (h.mini) { jumpT = 1; waveT = 2; }
  else if (h.desk) openVideo('edit1');
}
function goTo(id) { scrollTo({ top: tops[IDS.indexOf(id)], behavior: 'smooth' }); }
document.querySelectorAll('[data-go]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goTo(a.dataset.go); }));
$('.mark').addEventListener('click', (e) => { e.preventDefault(); goTo('hero'); });

/* ───────────── timeline ───────────── */
const rail = $('#rail'), head = $('#head'), tcode = $('#tcode'), ticks = [];
function buildTicks() {
  ticks.forEach((t) => t.remove()); ticks.length = 0;
  secEls.forEach((s, i) => {
    const next = i < IDS.length - 1 ? tops[i + 1] : total, b = mk('button', { className: 'tick', textContent: s.dataset.ch });
    b.style.left = (tops[i] / total * 100) + '%'; b.style.width = Math.max((next - tops[i]) / total * 100, 3) + '%'; b.onclick = () => goTo(IDS[i]); rail.append(b); ticks.push(b);
  });
}
let railDrag = false;
const scrub = (e) => { const r = rail.getBoundingClientRect(); scrollTo({ top: clamp((e.clientX - r.left) / r.width) * total, behavior: 'instant' }); };
rail.addEventListener('pointerdown', (e) => { if (e.target.closest('.tick')) return; railDrag = true; rail.setPointerCapture(e.pointerId); scrub(e); });
rail.addEventListener('pointermove', (e) => railDrag && scrub(e)); rail.addEventListener('pointerup', () => (railDrag = false));
const tc = (p) => { const f = Math.floor(p * 180 * 24); return `00:${String(Math.floor(f / 1440)).padStart(2, '0')}:${String(Math.floor(f / 24) % 60).padStart(2, '0')}:${String(f % 24).padStart(2, '0')}`; };

/* ───────────── resize ───────────── */
function resize() { fx.width = innerWidth; fx.height = innerHeight; renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); measure(); layoutHero(); layoutDoors(); buildTicks(); }
addEventListener('resize', resize);
new ResizeObserver(() => { const t = total; measure(); if (Math.abs(t - total) > 4) buildTicks(); }).observe(document.body);

/* ───────────── loop ───────────── */
const clock = new THREE.Clock(), camLook = new THREE.Vector3(), camTarget = new THREE.Vector3(), lookTarget = new THREE.Vector3(0, 0, -10), mouseUv = new THREE.Vector2();
cam.position.set(0, 0, 6);
let shownCh = '', focusKey = '';
const sectionIndex = () => { const mid = scrollY + innerHeight * .5; let i = 0; tops.forEach((t, k) => { if (t <= mid) i = k; }); return i; };
const pick = (objs) => { v2.set(ptr.x, ptr.y); ray.setFromCamera(v2, cam); const h = ray.intersectObjects(objs, false)[0]; return h ? h.object.userData : null; };

function tick() {
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
  scrollV = lerp(scrollV, (scrollY - lastY) / Math.max(dt, .001), .15); lastY = scrollY;
  const i = sectionIndex(), id = IDS[i], prog = clamp((scrollY - tops[i]) / Math.max(1, hs[i] - innerHeight));

  let fov = 50;
  if (id === 'hero') { camTarget.set(ptr.x * .25, ptr.y * .12, 6); lookTarget.set(0, 0, 0); fov = 38; }
  else if (id === 'doors') { camTarget.set(ptr.x * .35, .2 + ptr.y * .15, Z.doors + (cam.aspect < .95 ? 11 : 6.4)); lookTarget.set(0, 0, Z.doors); }
  else if (id === 'edits' || id === 'ai') { const T = tunnels[id], z = lerp(T.z0 + 4.6, T.end + 3, prog); camTarget.set(ptr.x * .45, ptr.y * .25, z); lookTarget.set(ptr.x * .8, ptr.y * .3, z - 10); }
  else if (id === 'posters') { camTarget.set(0, ptr.y * .2, Z.posters); lookTarget.set(ptr.x * 1.2 * 0, ptr.y * .6, Z.posters - 10); }
  else { camTarget.set(ptr.x * .4, ptr.y * .2, Z.end + 5); lookTarget.set(0, 0, Z.end); fov = 46; }
  const k = 1 - Math.exp(-dt * (id === 'edits' || id === 'ai' ? 6 : 3.2)), prevZ = cam.position.z;
  cam.position.lerp(camTarget, k); camLook.lerp(lookTarget, k * 1.3); cam.lookAt(camLook);
  const speed = Math.abs(cam.position.z - prevZ) / Math.max(dt, .001);
  cam.fov = lerp(cam.fov, fov + Math.min(speed * .25, 16), .12); cam.updateProjectionMatrix();

  // hero
  heroMat.uniforms.uTime.value = t;
  heroMat.uniforms.uMouse.value.lerp(mouseUv.set(.5 + ptr.x * .32, .55 + ptr.y * .3), .08);
  hero.rotation.y = lerp(hero.rotation.y, ptr.x * .1, .06); hero.rotation.x = lerp(hero.rotation.x, -ptr.y * .05, .06);
  ring2.rotation.z = -t * .5; ring.rotation.z = t * .1; halo.material.opacity = .75 + Math.sin(t * 1.6) * .1;

  // doors open toward you on hover
  const hit = id === 'doors' ? pick(doorObjs.map((g) => g.userData.hit)) : null;
  doorObjs.forEach((g) => { const u = g.userData, want = hit && hit.door === g ? 1 : 0; const was = u.open; u.open = lerp(u.open, want, 1 - Math.exp(-dt * 6)); if (was < .25 && u.open >= .25) sfx('open'); u.pivot.rotation.y = -u.open * 1.55; u.inner.material.color.setScalar(.2 + u.open * .8); u.glow.material.opacity = u.open * .8; u.light.intensity = u.open * 55; });

  // corridors: only the video in front of you plays
  for (const key of ['edits', 'ai']) {
    const T = tunnels[key], on = id === key; let best = 0, bd = 1e9;
    T.items.forEach((it, n) => { const d = Math.abs(it.z - (cam.position.z - 5.5)); if (d < bd) { bd = d; best = n; } });
    T.items.forEach((it, n) => { setVideo(it, on && Math.abs(n - best) <= (LITE ? 0 : 1)); it.g.scale.setScalar(lerp(it.g.scale.x, on && hovered?.tunnel === it ? 1.07 : 1, .15)); });
    if (on) { const f = T.items[best], fk = key + best; if (fk !== focusKey) { focusKey = fk; $('#caption b').textContent = f.v.t; $('#caption span').textContent = 'Click to open'; } hovered = pick(T.items.map((it) => it.m)); }
  }
  // posters
  if (id === 'posters') { room.rotation.y = prog * Math.PI * 2 * .95 + ringDrag; ringVel *= .92; if (!drag) ringDrag += ringVel; hovered = pick(posterMeshes); }
  posterMeshes.forEach((m) => { const h = id === 'posters' && hovered?.poster === m.userData.poster; m.position.z = lerp(m.position.z, m.userData.base + (h ? 1.2 : 0), .14); m.scale.setScalar(lerp(m.scale.x, h ? 1.06 : 1, .14)); const u = m.material.uniforms.uPeel; u.value = lerp(u.value, h ? 1 : 0, .1); });
  if (id === 'doors') hovered = hit ? { door: hit.door } : null;
  else if (id === 'contact') { v2.set(ptr.x, ptr.y); ray.setFromCamera(v2, cam); hovered = mcHead && ray.intersectObject(mc, true).length ? { mini: true } : desk.visible && ray.intersectObject(deskScreen, false).length ? { desk: true } : null; }
  else if (id === 'hero' || id === 'about') hovered = null;

  // mini Ashique: greets you at the doors, then waits at About and Contact
  { const doorsView = id === 'doors', dist = doorsView ? 6.4 - 2.6 : 5, th = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * dist, hw = th * cam.aspect;
    mc.visible = !!mcHead && (doorsView || id === 'contact' || (id === 'about' && prog > .6));
    const zPos = doorsView ? Z.doors + 2.6 : Z.end, sc = (doorsView ? .5 : .88) * (cam.aspect > 1 ? 1 : .7);
    if (mc.visible && !mc.userData.was) waveT = 2.2; mc.userData.was = mc.visible;
    mc.position.set(doorsView ? -hw * .72 : hw * (cam.aspect > 1 ? .8 : .38), -th * (doorsView ? .8 : .78) + Math.sin(t * 2) * .02 + (jumpT > 0 ? Math.sin((1 - jumpT) * Math.PI) * .5 : 0), zPos);
    { const dd = 6.2, dth = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * dd, dhw = dth * cam.aspect, showDesk = id === 'contact' && cam.aspect > 1;
      desk.visible = showDesk; deskVideo(showDesk); desk.position.set(dhw * .34, -dth * .6, Z.end - 1.2); desk.scale.setScalar(.8); desk.rotation.y = -.25 + ptr.x * .06; }
    jumpT = Math.max(0, jumpT - dt * 1.5); waveT = Math.max(0, waveT - dt);
    mc.scale.setScalar(sc); mc.rotation.y = lerp(mc.rotation.y, (doorsView ? .45 : -.35) + ptr.x * .25, .08);
    if (mcHead) {
      mcHead.rotation.y = lerp(mcHead.rotation.y, clamp(ptr.x * .9 - (doorsView ? -.2 : .3), -.8, .8), .1); mcHead.rotation.x = lerp(mcHead.rotation.x, clamp(-ptr.y * .4, -.4, .4), .1); mcHead.rotation.z = Math.sin(t * 1.3) * .03;
      mcArmR.rotation.z = lerp(mcArmR.rotation.z, waveT > 0 ? 2.6 + Math.sin(t * 12) * .3 : .1 + Math.sin(t * 1.5) * .03, .15);
      mcArmL.rotation.z = lerp(mcArmL.rotation.z, -.1 - Math.sin(t * 1.5) * .03, .1);
    } }
  // overlays
  const ch = CHAPTERS[id], want = ch ? id : '';
  if (want !== shownCh) { shownCh = want; const el = $('#chapter'); el.classList.remove('on'); if (ch) setTimeout(() => { if (shownCh === id) { el.querySelector('h2').textContent = ch[0]; el.querySelector('p').textContent = ch[1]; el.classList.add('on'); } }, 250); }
  $('#caption').classList.toggle('on', id === 'edits' || id === 'ai');
  ticks.forEach((b, n) => b.classList.toggle('on', n === i));
  head.style.left = (scrollY / total * 100) + '%'; tcode.textContent = tc(scrollY / total);
  if (hovered && (hovered.door || hovered.tunnel || hovered.poster || hovered.mini || hovered.desk)) { hov.hidden = false; hov.textContent = hovered.door ? hovered.door.userData.def.label : hovered.tunnel || hovered.desk ? 'Play' : hovered.poster ? 'Zoom' : 'Poke'; hov.style.left = ptr.px + 'px'; hov.style.top = ptr.py + 'px'; canvas.style.cursor = 'pointer'; }
  else { hov.hidden = true; canvas.style.cursor = id === 'posters' ? 'grab' : ''; }

  drawFx();
  renderer.render(scene, cam);
  requestAnimationFrame(tick);
}
resize(); tick();

