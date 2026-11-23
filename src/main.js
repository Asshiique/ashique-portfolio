import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/* ───────────── content ───────────── */
const V = (id, t, wide = false) => ({ id, t, wide });
const EDITS = [V('edit1', 'Edit 01'), V('editA', 'Edit 02'), V('editB', 'Edit 03'), V('editC', 'Edit 04', true), V('edit6', 'Edit 05'), V('content1', 'Edit 06')];
const AI = [V('promo', 'AI promo', true), V('ai2', 'AI film 01'), V('ai1', 'AI film 02', true), V('lumina', 'AI promo 02', true), V('ai3', 'AI film 03'), V('ai3d', 'AI 3D'), V('ai4', 'AI film 04', true), V('ai5', 'AI film 05'), V('ai6', 'AI film 06'), V('ai7', 'AI film 07'), V('ai8', 'AI film 08')];
const POSTERS = ['poster-tarang', 'poster-hook', 'poster-sheep', 'poster-battery', 'poster-superhero', 'poster-onam', 'poster-childrens', 'poster-uae', 'poster-landcruiser', 'poster-plus2-way', 'poster-plus2-marks', 'poster-aplus', 'poster-tarang2', 'poster-ebs', 'poster-fail', 'poster-ff-global', 'poster-ff-abroad', 'poster-ivy', 'poster-brillianton', 'poster-resort', 'poster-emerald-kids', 'poster-hiroshima', 'poster-ramadan', 'poster-times', 'poster-bca', 'poster-inline-marketing', 'logo-electus'];
const CHAPTERS = {
  doors: ['Pick a door', 'Magic happens behind them. Hover to peek, click to walk in.'],
  edits: ['Edits', 'Short-form cuts built to hold attention. Scroll to walk through.'],
  ai: ['AI films', 'Scenes that were never filmed. Keep scrolling.'],
  cinema: ['Cinema', 'A short film, on the big screen. Click the screen to play it with sound.'],
  posters: ['Posters', 'Admissions, events and launches. Scroll or drag to spin the room.'],
};
const IDS = ['hero', 'doors', 'edits', 'ai', 'cinema', 'posters', 'about', 'contact'];
const Z = { doors: -60, edits: -125, ai: -225, cinema: -325, posters: -395, end: -480 };

const $ = (s) => document.querySelector(s);
// lite mode: phones, touch screens and data-saver get fewer effects so the page loads and runs fast
const FEED = matchMedia('(max-width:760px)').matches;
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
  // the film shows a private rating card once it has played to the end (stars open WhatsApp, nothing is stored or shown publicly)
  const wrap = mk('div', { className: 'vwrap' }); wrap.append(v);
  if (id === 'film') v.addEventListener('ended', () => { if (!wrap.querySelector('.rate')) wrap.append(rateCard(v)); });
  openLB(wrap); v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
};
function rateCard(v) {
  const wa = (t) => `https://wa.me/919947045212?text=${encodeURIComponent(t)}`, c = mk('div', { className: 'rate' });
  c.innerHTML = `<h3>How was it?</h3><div class="stars" role="group" aria-label="Rate the film">${[5, 4, 3, 2, 1].map((n) => `<button type="button" data-n="${n}" aria-label="${n} star${n > 1 ? 's' : ''}">★</button>`).join('')}</div><p>Tap a star and tell me on WhatsApp.</p><a class="btn" href="${wa("Hi Ashique, I watched your short film and I'd like one for my project.")}" target="_blank" rel="noopener">Want a film like this? Let's talk</a><button class="again" type="button">Watch again</button>`;
  c.querySelectorAll('.stars button').forEach((b) => b.addEventListener('click', () => open(wa(`Hi Ashique, I just watched your short film. My rating: ${b.dataset.n}/5.`), '_blank', 'noopener')));
  c.querySelector('.again').addEventListener('click', () => { c.remove(); v.currentTime = 0; v.play().catch(() => {}); });
  return c;
}
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
let introT0 = -1;
function startIntro() {
  if (scrollY > 400 || matchMedia('(prefers-reduced-motion: reduce)').matches) { introT0 = -2; return; }
  introT0 = performance.now(); document.body.classList.add('intro');
}
mgr.onLoad = () => setTimeout(() => { $('#loader').classList.add('done'); if (introT0 === -1) startIntro(); }, 250);
const texLoader = new THREE.TextureLoader(mgr);
const loadTex = (url) => { const t = texLoader.load(url); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = LITE ? 2 : 8; return t; };

let dustMat;
// dust that streaks past while you fly between rooms
{
  const N = LITE ? 700 : 2600, p = new Float32Array(N * 3), c = new Float32Array(N * 3), col = [new THREE.Color(0xff6a13), new THREE.Color(0x2f7bff), new THREE.Color(0xffffff)];
  for (let i = 0; i < N; i++) { p.set([(Math.random() - .5) * 60, (Math.random() - .5) * 28, 14 - Math.random() * 520], i * 3); const k = col[(Math.random() * 3) | 0]; c.set([k.r, k.g, k.b], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  scene.add(new THREE.Points(g, dustMat = new THREE.PointsMaterial({ size: .07, vertexColors: true, transparent: true, opacity: .8, depthWrite: false, blending: THREE.AdditiveBlending })));
}
const haloTex = (() => { const c = mk('canvas', { width: 128, height: 128 }), x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, '#fff'); g.addColorStop(.35, '#fff8'); g.addColorStop(1, '#fff0'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
const GLOWS = [], GRIDS = [];
const additive = (color, opacity) => { const m = new THREE.MeshBasicMaterial({ map: haloTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }); GLOWS.push({ m, o: opacity }); return m; };

/* ───────────── hero: glowing halo + portrait lit by the cursor ───────────── */
const hero = new THREE.Group(); scene.add(hero); hero.scale.setScalar(1.1);
const heroDark = loadTex('/media/img/ash-hero2.webp'), heroCut = loadTex('/media/img/ash-cutout.webp');
const heroMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: { uTex: { value: loadTex('/media/img/ash-hero2.webp') }, uLight: { value: 0 }, uTint: { value: new THREE.Color(0xff6a13) }, uTintAmt: { value: 0 }, uBlur: { value: .014 }, uDof: { value: .0012 }, uMouse: { value: new THREE.Vector2(.5, .6) }, uTime: { value: 0 } },
  vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: `varying vec2 vUv;uniform sampler2D uTex;uniform vec2 uMouse;uniform float uTime;uniform float uLight;uniform vec3 uTint;uniform float uTintAmt;uniform float uBlur;uniform float uDof;
  void main(){
    vec2 uv=vUv; float d=distance(uv*vec2(.7,1.),uMouse*vec2(.7,1.)); float spot=smoothstep(.6,.0,d);
    vec2 o=(uv-uMouse)*.014*spot;
    vec3 c=vec3(texture2D(uTex,uv+o*1.8+vec2(.003,0.)*spot).r,texture2D(uTex,uv+o).g,texture2D(uTex,uv+o*.3-vec2(.003,0.)*spot).b);
    float bl=uBlur+uDof*smoothstep(.18,.8,d);
    if(bl>.0004){ vec3 s=c; for(int i=0;i<8;i++){ float an=float(i)*.785398; vec2 dir=vec2(cos(an),sin(an)*1.3); s+=texture2D(uTex,uv+dir*bl).rgb; s+=texture2D(uTex,uv+dir*bl*2.).rgb; } c=mix(c,s/17.,clamp(bl*300.,0.,1.)); }
    c*=mix(.62+.7*spot,1.,uLight);
    c=mix(c,c*(uTint*1.7+.12)+uTint*.05,.55*uTintAmt);
    vec2 e=smoothstep(0.,.16,uv)*smoothstep(1.,.84,uv); float a=e.x*e.y*texture2D(uTex,uv).a;
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
let heroLight = false;
function layoutHero() {
  const visH = 2 * 6 * Math.tan(THREE.MathUtils.degToRad(19)), visW = visH * cam.aspect, wide = cam.aspect > 1;
  const AR = heroLight ? 1023 / 1537 : 1.5; let w, h, x, y, hx, hy;
  if (heroLight) { h = visH * (wide ? 1.12 : .8); w = h * AR; x = wide ? visW * .22 : 0; y = wide ? -.1 : visH * .08; hx = x; hy = y + h * .17; }
  else if (wide) { w = visW * .58; h = w / AR; x = visW * .21; y = -.05; hx = x; hy = y + h * .18; }
  else { w = visW * 1.12; h = w / AR; x = 0; y = visH * .2; hx = x; hy = y + h * .18; }
  portrait.scale.set(w, h, 1); portrait.position.set(x, y, 0);
  const R = (heroLight ? h : visH) * .36;
  [halo, haloBlue, ring, ring2].forEach((m) => { m.visible = heroLight; });
  halo.scale.setScalar(R * 3.4); halo.position.set(hx, hy, -.4); haloBlue.scale.setScalar(R * 4.4); haloBlue.position.set(hx - R * .5, hy + R * .3, -.5);
  ring.scale.setScalar(R); ring.position.set(hx, hy, -.3); ring2.scale.setScalar(R * 1.12); ring2.position.set(hx, hy, -.25);
  fxItems[0].userData.fx = .36; fxItems[0].userData.fy = .32;
  fxItems.forEach((o) => { const u = o.userData; u.bx = x + u.fx * w; u.by = y + u.fy * h; o.position.set(u.bx, u.by, u.z); o.scale.setScalar(u.sf(w, h)); });
}

/* hero backdrop: a colour wheel made of the site's own colours; pick one to grade the whole hero */
const heroBack = new THREE.Group(); scene.add(heroBack); const fxItems = [];
const fxPut = (obj, fx, fy, z, sf, rx, ry, rz = 0, flags = {}) => { obj.userData = { fx, fy, z, sf, rx, ry, rz, ...flags, ph: Math.random() * 6, bx: 0, by: 0 }; heroBack.add(obj); fxItems.push(obj); return obj; };
const SW = [0xff6a13, 0xdc143c, 0x8b4a2b, 0xffc46b, 0x19c79a, 0x2f7bff, 0x8b5cff], SEG = 360 / SW.length;
let gradeIdx = null, tintAmt = 0, wheel, puck, puckFill; const tintC = new THREE.Color(0xff6a13);
{
  const c = mk('canvas', { width: 512, height: 512 }), x = c.getContext('2d');
  SW.forEach((hex, i) => { const a0 = i * SEG + 1.5, a1 = (i + 1) * SEG - 1.5; x.beginPath(); x.moveTo(256, 256); x.arc(256, 256, 250, -a1 * Math.PI / 180, -a0 * Math.PI / 180); x.closePath(); x.fillStyle = '#' + hex.toString(16).padStart(6, '0'); x.fill(); });
  x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(256, 256, 156, 0, 6.3); x.fill();
  const wt = new THREE.CanvasTexture(c); wt.colorSpace = THREE.SRGBColorSpace; wt.anisotropy = 4;
  const wg = new THREE.Group(); wg.add(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ map: wt, transparent: true, toneMapped: false, opacity: .95 })));
  wheel = wg.children[0];
  puck = new THREE.Group(); puckFill = new THREE.Mesh(new THREE.CircleGeometry(.1, 32), new THREE.MeshBasicMaterial({ color: 0xff6a13 })); puck.add(puckFill, new THREE.Mesh(new THREE.RingGeometry(.1, .15, 32), new THREE.MeshBasicMaterial({ color: 0xffffff }))); puck.position.z = .02; wg.add(puck);
  fxPut(wg, .38, .33, .12, (w) => w * (heroLight ? .28 : .17) / 2.4, 0, 0, 0, { deskOnly: true });
}
// projector beam (dark mode only: light does nothing on a white page)
{
  const cw = 128, chh = 256, cv = mk('canvas', { width: cw, height: chh }), cx = cv.getContext('2d'), im = cx.createImageData(cw, chh);
  for (let y = 0; y < chh; y++) for (let x = 0; x < cw; x++) { const u = Math.abs(x / (cw - 1) * 2 - 1), v = y / (chh - 1), a = Math.pow(1 - u, 2.2) * Math.sin(Math.PI * Math.pow(v, .8)), i = (y * cw + x) * 4; im.data[i] = 255; im.data[i + 1] = 226; im.data[i + 2] = 180; im.data[i + 3] = Math.max(0, a) * 255; }
  cx.putImageData(im, 0, 0); const bt = new THREE.CanvasTexture(cv); bt.colorSpace = THREE.SRGBColorSpace;
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(.55, 1.4), new THREE.MeshBasicMaterial({ map: bt, transparent: true, opacity: .2, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  const grp = new THREE.Group(); grp.add(beam); fxPut(grp, -.12, .06, .3, (w, h) => h, 0, 0, .5, { lightOff: true });
}
const wheelOn = () => heroBack.visible && cam.aspect > .95;
const rgbOf = (col) => col.getStyle().match(/\d+/g).slice(0, 3).join(',');
function applyGradeCss() {
  const root = document.documentElement.style;
  if (gradeIdx === null) { root.removeProperty('--orRGB'); root.removeProperty('--blRGB'); return; }
  root.setProperty('--orRGB', rgbOf(new THREE.Color(SW[gradeIdx]))); root.setProperty('--blRGB', rgbOf(new THREE.Color(SW[(gradeIdx + 4) % SW.length])));
}
function heroBackTick(t, id, dt) {
  heroBack.visible = id === 'hero'; if (!heroBack.visible) return;
  fxItems.forEach((o) => { const u = o.userData; o.visible = !(u.deskOnly && cam.aspect <= .95) && !(u.lightOff && heroLight); o.position.set(u.bx + ptr.x * .1 * (1 + u.z), u.by + Math.sin(t * .8 + u.ph) * .05, u.z); o.rotation.set(u.rx - ptr.y * .08, u.ry + ptr.x * .12, u.rz + (u.lightOff ? Math.sin(t * .25) * .05 : 0)); });
  tintAmt = lerp(tintAmt, gradeIdx === null ? 0 : 1, .08);
  const idx = gradeIdx === null ? 0 : gradeIdx; tintC.set(SW[idx]);
  const a = (idx + .5) * SEG * Math.PI / 180; puck.position.set(Math.cos(a) * .95, Math.sin(a) * .95, .02); puckFill.material.color.copy(tintC);
  heroMat.uniforms.uTint.value.copy(tintC); heroMat.uniforms.uTintAmt.value = tintAmt;
}

const GRADE = { warm: [0xff5a10, 0x2f7bff, 0xffa24a, 0x4d93ff], cool: [0x2f7bff, 0xff6a13, 0x6fa8ff, 0xff9a4a] }; for (const k in GRADE) GRADE[k] = GRADE[k].map((c) => new THREE.Color(c));
/* ───────────── the doors ───────────── */
const doors = new THREE.Group(); doors.position.set(0, 0, Z.doors); scene.add(doors);
const DOOR_DEFS = [
  { label: 'Edits', go: 'edits', color: 0xff6a13, thumb: '/media/vid/edit1.jpg' },
  { label: 'AI films', go: 'ai', color: 0x2f7bff, thumb: '/media/vid/promo.jpg' },
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
  const n = doorObjs.length, stacked = cam.aspect < .95;
  doorObjs.forEach((g, i) => {
    if (stacked) { const row = (i / 2) | 0, alone = n % 2 && i === n - 1; g.position.set(alone ? 0 : (i % 2 ? 1 : -1) * 1.3, 1.0 - row * 2.5, 0); g.scale.setScalar(.46); }
    else { const visW = 2 * 6.4 * Math.tan(THREE.MathUtils.degToRad(25)) * cam.aspect, step = DW + .85; g.position.set((i - (n - 1) / 2) * step * Math.min(1, visW * .9 / (n * step)) , -DH / 2 + .2, 0); g.scale.setScalar(Math.min(1, visW * .9 / (n * step))); }
  });
}
document.fonts.load('800 40px "Big Shoulders Display"').finally(() => { DOOR_DEFS.forEach(makeDoor); layoutDoors(); });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x0a0b12, roughness: .7, metalness: .1 }));
floor.rotation.x = -Math.PI / 2; floor.position.set(0, -2.1, Z.doors); scene.add(floor);
const grid = (zc, len) => { const g = new THREE.GridHelper(len, len / 2, 0xff6a13, 0x2f7bff); g.material.transparent = true; g.material.opacity = .28; GRIDS.push(g.material); g.position.set(0, -2.3, zc); scene.add(g); };
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
if (FEED) Object.values(tunnels).forEach((T) => T.items.forEach((it) => { it.g.visible = false; }));
function setVideo(it, on) {
  if (on && !it.vid) {
    const v = mk('video', { src: `/media/vid/${it.v.id}.mp4`, loop: true, muted: true, playsInline: true, preload: 'auto' }); v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.play().catch(() => {}); it.vid = v; it.tex = new THREE.VideoTexture(v); it.tex.colorSpace = THREE.SRGBColorSpace; it.m.material.map = it.tex; it.m.material.needsUpdate = true;
  } else if (!on && it.vid) { it.vid.pause(); it.vid.removeAttribute('src'); it.vid.load(); it.tex.dispose(); it.vid = it.tex = null; it.m.material.map = it.poster; it.m.material.needsUpdate = true; }
}

/* ───────────── cinema: the short film, shown like a theatre ───────────── */
const cinema = new THREE.Group(); cinema.position.set(0, 0, Z.cinema); scene.add(cinema);
let cineScreen, cineVid = null, cineTex = null, cineOpen = 0; const curtains = [];
{
  const std = (c, r = .85) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
  const add = (geo, m, x, y, z, rx = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.x = rx; cinema.add(o); return o; };
  add(new THREE.PlaneGeometry(9.4, 5.6), new THREE.MeshBasicMaterial({ color: 0x050507 }), 0, 0, -.06);
  cineScreen = add(new THREE.PlaneGeometry(8.8, 4.95), new THREE.MeshBasicMaterial({ map: loadTex('/media/vid/film.jpg'), toneMapped: false }), 0, 0, 0);
  cineScreen.userData.screen = true;
  add(new THREE.PlaneGeometry(18, 10), additive(0xff6a13, .16), 0, 0, -.6);
  [-1, 1].forEach((side) => { const c = add(new THREE.PlaneGeometry(4.7, 5.9), std(0x4a0d12, .9), side * 2.35, 0, .3); c.userData.side = side; curtains.push(c); });
  add(new THREE.BoxGeometry(11.4, .7, .5), std(0x3a0a0e), 0, 3.1, .35);
  add(new THREE.PlaneGeometry(60, 60), std(0x0a0a0f, .9), 0, -2.45, 0, -Math.PI / 2);
  const beam = add(new THREE.ConeGeometry(4.8, 20, 40, 1, true), new THREE.MeshBasicMaterial({ color: 0xdfe8ff, transparent: true, opacity: .05, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), 0, 1.2, 10, Math.PI / 2);
}
function cinemaVideo(on) {
  if (LITE) return;
  if (on && !cineVid) { cineVid = mk('video', { src: '/media/vid/film.mp4', loop: true, muted: true, playsInline: true }); cineVid.setAttribute('muted', ''); cineVid.play().catch(() => {}); cineTex = new THREE.VideoTexture(cineVid); cineTex.colorSpace = THREE.SRGBColorSpace; cineScreen.material.map = cineTex; cineScreen.material.needsUpdate = true; }
  else if (!on && cineVid) { cineVid.pause(); cineTex.dispose(); cineVid = cineTex = null; cineScreen.material.map = loadTex('/media/vid/film.jpg'); cineScreen.material.needsUpdate = true; }
}

/* ───────────── poster room (you stand in the middle) ───────────── */
const room = new THREE.Group(); room.position.set(0, 0, Z.posters); scene.add(room);
const RR = Math.max(9.5, POSTERS.length * 2.9 / (2 * Math.PI)), posterMeshes = [];
const NOTES = { 'poster-hook': 'Social media campaign creative', 'poster-sheep': 'Marketing creative: ignore noise', 'poster-battery': 'Marketing creative: low budget, high creativity', 'poster-superhero': 'Superhero Day poster', 'poster-onam': 'Onam celebration poster', 'poster-childrens': "Children's Day poster", 'poster-uae': 'UAE National Day poster', 'poster-landcruiser': 'Car coating ad: 3M Car Care', 'poster-plus2-way': 'Plus Two tuition poster', 'poster-plus2-marks': 'Plus Two tuition poster', 'poster-aplus': 'A+ tuition poster', 'poster-ff-global': 'Brillianton Future Fellows', 'poster-ff-abroad': 'Brillianton Future Fellows', 'poster-hiroshima': 'Hiroshima Day poster', 'poster-tarang': 'Event poster: Tarang 26', 'poster-tarang2': 'Event poster: Tarang 26', 'poster-ebs': 'Admission orientation poster', 'poster-fail': 'Plus Two tuition poster', 'poster-times': 'Faculty hiring poster', 'poster-tuition': '8th Std tuition poster', 'poster-faculty': 'Faculty required poster', 'poster-future': 'Admissions open poster', 'poster-scholarship': 'Scholarship poster', 'poster-ivy': 'Ivy League mentorship poster', 'poster-bca': 'BCA, BSc AI and B.Ed admissions', 'poster-abroad': 'Study abroad orientation poster', 'poster-brillianton': 'Brillianton campaign poster', 'poster-resort': 'Emerald Hotels and Resorts poster', 'poster-ramadan': 'Ramadan special program poster', 'poster-ramayanam': 'Ramayanam event poster', 'poster-hiring': 'School hiring poster', 'poster-emerald-kids': 'Emerald International School campaign', 'poster-inline-marketing': 'Digital marketing course poster', 'logo-electus': 'Logo: Electus 26' };
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
  add(new THREE.BoxGeometry(1.56, 1.2, .07), black, 0, 1.05, -.35);
  deskScreen = add(new THREE.PlaneGeometry(1.44, 1.08), new THREE.MeshBasicMaterial({ map: loadTex('/media/vid/promo.jpg'), toneMapped: false }), 0, 1.05, -.31);
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
const DESK = ['promo', 'ai1', 'ai4']; let deskI = 0;
function deskVideo(on) {
  if (LITE) return;
  if (on && !deskVid) { deskVid = mk('video', { src: `/media/vid/${DESK[deskI]}.mp4`, muted: true, playsInline: true }); deskVid.setAttribute('muted', ''); deskVid.onended = () => { deskI = (deskI + 1) % DESK.length; deskVid.src = `/media/vid/${DESK[deskI]}.mp4`; deskVid.play().catch(() => {}); }; deskVid.play().catch(() => {}); deskTex = new THREE.VideoTexture(deskVid); deskTex.colorSpace = THREE.SRGBColorSpace; deskScreen.material.map = deskTex; deskScreen.material.needsUpdate = true; }
  else if (!on && deskVid) { deskVid.pause(); deskTex.dispose(); deskVid = deskTex = null; deskScreen.material.map = loadTex('/media/vid/promo.jpg'); deskScreen.material.needsUpdate = true; }
}


/* animated 3D character: greets you at the doors, then hangs around About and Contact */
const pet = new THREE.Group(); pet.visible = false; scene.add(pet); let petMixer = null;
new GLTFLoader().load('/models/hero.glb', (g) => {
  const m = g.scene, box = new THREE.Box3().setFromObject(m), k = 2.2 / box.getSize(new THREE.Vector3()).y;
  m.scale.setScalar(k); box.setFromObject(m); const c = box.getCenter(new THREE.Vector3()); m.position.set(-c.x, -box.min.y, -c.z);
  m.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
  if (g.animations[0]) { petMixer = new THREE.AnimationMixer(m); petMixer.clipAction(g.animations[0]).play(); }
  pet.add(m);
});
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
addEventListener('pointerdown', (e) => { ptr.x = e.clientX / innerWidth * 2 - 1; ptr.y = -(e.clientY / innerHeight * 2 - 1); ptr.px = e.clientX; ptr.py = e.clientY; if (e.target === canvas) drag = { x: e.clientX, moved: 0 }; });
addEventListener('pointerup', () => {
  if (drag && drag.moved < 8) {
    if (IDS[sectionIndex()] === 'doors') { v2.set(ptr.x, ptr.y); ray.setFromCamera(v2, cam); const hh = ray.intersectObjects(doorObjs.map((g) => g.userData.hit), false)[0]; hovered = hh ? { door: hh.object.userData.door } : null; }
    if (hovered) activate(hovered);
  }
  drag = null;
});
function activate(h) {
  if (h.door) { const g = h.door; g.userData.force = true; sfx('click'); setTimeout(() => { g.userData.force = false; goTo(g.userData.def.go); }, 520); }
  else if (h.tunnel) openVideo(h.tunnel.v.id);
  else if (h.poster) openImage(h.poster);
  else if (h.desk) openVideo(DESK[deskI]);
  else if (h.screen) openVideo('film');
}
function goTo(id) { scrollTo({ top: tops[IDS.indexOf(id)], behavior: 'smooth' }); }
document.querySelectorAll('[data-go]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goTo(a.dataset.go); }));
$('.mark').addEventListener('click', (e) => { e.preventDefault(); goTo('hero'); });

/* ───────────── page furniture: role card, stats, grade cord, form ───────────── */
{
  const words = ['Video editor', 'AI filmmaker', 'Poster designer'], card = $('#roleCard'), word = $('#roleWord'); let wi = 0;
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => { card.classList.add('flip'); setTimeout(() => { wi = (wi + 1) % words.length; word.textContent = words[wi]; }, 275); setTimeout(() => card.classList.remove('flip'), 560); }, 2800);
  const st = [[EDITS.length + AI.length, 'Videos on this site'], [POSTERS.length, 'Creatives and posters'], [4, 'Ways I can help']];
  $('#stats').innerHTML = st.map(([n, l]) => `<li><b data-n="${n}">0</b><span>${l}</span></li>`).join('');
  const cio = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; cio.unobserve(e.target); const el = e.target, n = +el.dataset.n, t0 = performance.now(); (function f() { const k = clamp((performance.now() - t0) / 1200); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(); }), { threshold: .6 });
  document.querySelectorAll('#stats b').forEach((b) => cio.observe(b));
  const cord = $('#cord'); cord.addEventListener('click', () => { const light = document.documentElement.classList.toggle('light'); cord.setAttribute('aria-pressed', light); cord.classList.add('pull'); setTimeout(() => cord.classList.remove('pull'), 180); sfx('click'); });
  $('#back').addEventListener('click', () => goTo('doors'));
  $('#brief').addEventListener('submit', (e) => {
    e.preventDefault(); const f = e.target, n = f.n.value.trim(), b = f.b.value.trim(), err = $('#briefErr');
    if (!n || !b) { err.textContent = !n ? 'Add your name so I know who to reply to.' : 'Add a line about the project.'; return; }
    err.textContent = ''; open(`https://wa.me/919947045212?text=${encodeURIComponent(`Hi Ashique, I'm ${n}. I need: ${f.t.value}.\n${b}`)}`, '_blank', 'noopener');
  });
}

/* ───────────── phones: swipe feed (autoplays the card in view; tap for the full video with sound) ───────────── */
if (FEED) {
  const el = (h) => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstChild; };
  const io = new IntersectionObserver((es) => es.forEach((e) => { const v = e.target.querySelector('video'); if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause(); }), { threshold: .6 });
  [['edits', EDITS, 'Edits', 'Swipe through. Tap one to watch it full screen with sound.'], ['ai', AI, 'AI films', 'Swipe through. Tap one to watch it with sound.']].forEach(([id, list, title, sub]) => {
    const sec = $('#' + id); sec.classList.add('feed'); sec.innerHTML = `<div class="feedHead"><h2>${title}</h2><p>${sub}</p></div><div class="strip"></div>`;
    list.forEach((v) => { const c = el(`<button class="fcard ${v.wide ? 'wide' : ''}" type="button" aria-label="Play ${v.t}"><video muted loop playsinline preload="none" poster="/media/vid/${v.id}.jpg" data-src="/media/vid/${v.id}.mp4"></video><span class="ftag">${v.t}</span><span class="fplay">Tap to watch</span></button>`); c.addEventListener('click', () => openVideo(v.id)); sec.querySelector('.strip').append(c); io.observe(c); });
  });
}
function fitName() {
  const h = $('h1'); if (innerWidth >= 760) { h.style.fontSize = ''; return; }
  h.style.fontSize = '100px'; const w = Math.max(...[...h.children].map((sp) => { const r = document.createRange(); r.selectNodeContents(sp); return r.getBoundingClientRect().width; })), box = h.parentElement, cs = getComputedStyle(box), avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  h.style.fontSize = Math.floor(100 * avail / w * .99) + 'px';
}
document.fonts.ready.then(fitName);

/* the song: official video in YouTube's own player (no audio file is hosted). Desktop: it plays on the 3D TV at Contact, muted at first
   (browsers require that for autoplay), with YouTube's controls to pause or unmute. Phones: the button opens a small player. Spider-Man dances while it plays. */
const YT = 'https://www.youtube-nocookie.com', YT_SRC = YT + '/embed/dQw4w9WgXcQ?rel=0&playsinline=1&enablejsapi=1&controls=1&modestbranding=1&start=81&origin=' + encodeURIComponent(location.origin);
let party = false, tvFrame = null, tvMuted = true, tvState = -1; const tunes = mk('div', { id: 'tunes', hidden: true });
tunes.innerHTML = '<button type="button" aria-label="Stop the song">×</button><div class="slot"></div><p>Never Gonna Give You Up, Rick Astley (official video, via YouTube)</p>'; document.body.append(tunes);
const partyBtn = $('#party');
function partyLabel() { partyBtn.textContent = tvFrame ? (tvState === 1 ? (tvMuted ? 'Turn the sound on' : 'Pause') : 'Play') : party ? 'Stop the music' : 'Make him dance'; partyBtn.setAttribute('aria-pressed', party); }
const ytCmd = (f, func) => f?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), YT);
function tvOn() {
  if (tvFrame) return; const loud = !!navigator.userActivation?.hasBeenActive; tvMuted = !loud; tvState = -1;   // sound only if the visitor has already interacted with the page
  tvFrame = mk('iframe', { className: 'tv', title: 'Never Gonna Give You Up (official video) on the TV', allow: 'autoplay; encrypted-media; picture-in-picture', src: YT_SRC + '&autoplay=1' + (loud ? '' : '&mute=1') });
  tvFrame.addEventListener('load', () => tvFrame?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), YT));
  document.body.append(tvFrame); partyLabel(); const f = tvFrame;
  if (loud) setTimeout(() => { if (tvFrame === f && tvState !== 1) { ytCmd(f, 'mute'); ytCmd(f, 'playVideo'); tvMuted = true; partyLabel(); } }, 3500);   // browser blocked sound: fall back to muted playback
  const once = () => { removeEventListener('pointerdown', once); removeEventListener('keydown', once); setTimeout(() => { if (tvFrame === f && tvMuted) { ytCmd(f, 'unMute'); ytCmd(f, 'playVideo'); tvMuted = false; partyLabel(); } }, 150); };
  addEventListener('pointerdown', once); addEventListener('keydown', once);   // first click, tap or key anywhere turns the sound on
}
function tvOff() { if (!tvFrame) return; tvFrame.remove(); tvFrame = null; tvState = -1; party = false; partyLabel(); }
addEventListener('message', (e) => {
  if (e.origin !== YT || !tvFrame || e.source !== tvFrame.contentWindow) return; let d; try { d = JSON.parse(e.data); } catch { return; }
  const st = d.event === 'onStateChange' ? d.info : d.info?.playerState; if (typeof st !== 'number') return;
  tvState = st; party = st === 1; partyLabel();
});
function startParty() {
  party = true; tunes.querySelector('.slot').innerHTML = `<iframe src="${YT_SRC}&autoplay=1" title="Never Gonna Give You Up" allow="autoplay; encrypted-media; picture-in-picture"></iframe>`;
  tunes.hidden = false; partyLabel(); if (ac && sndOn) master.gain.linearRampToValueAtTime(0, ac.currentTime + .4);
}
function stopParty() {
  if (!party || tvFrame) return; party = false; tunes.querySelector('.slot').innerHTML = ''; tunes.hidden = true; partyLabel(); if (ac && sndOn) master.gain.linearRampToValueAtTime(.6, ac.currentTime + .6);
}
partyBtn.addEventListener('click', () => {
  if (cam.aspect > 1) { if (!tvFrame) return tvOn(); if (tvMuted) { ytCmd(tvFrame, 'unMute'); ytCmd(tvFrame, 'playVideo'); tvMuted = false; partyLabel(); } else ytCmd(tvFrame, tvState === 1 ? 'pauseVideo' : 'playVideo'); }
  else party ? stopParty() : startParty();
});
tunes.querySelector('button').addEventListener('click', stopParty);
// pin the iframe onto the 3D monitor: map its rectangle to the screen quad (perspective included)
const tvCorners = [[-.72, .54], [.72, .54], [.72, -.54], [-.72, -.54]], tvV = new THREE.Vector3();
function placeTv() {
  if (!tvFrame) return; const ok = desk.visible && Math.abs(cam.position.z - (Z.end + 5)) < 1.6; tvFrame.style.visibility = ok ? 'visible' : 'hidden'; if (!ok) return;
  const P = tvCorners.map(([x, y]) => { tvV.set(x * .995, y * .995, 0); deskScreen.localToWorld(tvV); tvV.project(cam); return [(tvV.x + 1) / 2 * innerWidth, (1 - tvV.y) / 2 * innerHeight]; });
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = P, W = 480, H = 360, dx1 = x1 - x2, dx2 = x3 - x2, sx = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, sy = y0 - y1 + y2 - y3, den = dx1 * dy2 - dx2 * dy1;
  const g = (sx * dy2 - dx2 * sy) / den, h = (dx1 * sy - sx * dy1) / den, a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, d = y1 - y0 + g * y1, e = y3 - y0 + h * y3;
  tvFrame.style.transform = `matrix3d(${a / W},${d / W},0,${g / W},${b / H},${e / H},0,${h / H},0,0,1,0,${x0},${y0},0,1)`;
}

/* colour wheel: press or drag on it to grade the hero; double-click to reset */
{
  let wd = false; const v3 = new THREE.Vector3();
  const hitWheel = (e) => { if (!wheelOn() || e.target !== canvas || IDS[sectionIndex()] !== 'hero') return false; v2.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight * 2 - 1)); ray.setFromCamera(v2, cam); return ray.intersectObject(wheel, false).length > 0; };
  const grade = (e) => { wheel.getWorldPosition(v3); v3.project(cam); const a = Math.atan2(-(e.clientY - (1 - v3.y) / 2 * innerHeight), e.clientX - (v3.x + 1) / 2 * innerWidth); gradeIdx = Math.floor((((a * 180 / Math.PI) % 360) + 360) % 360 / SEG) % SW.length; applyGradeCss(); };
  addEventListener('pointerdown', (e) => { if (hitWheel(e)) { wd = true; grade(e); } });
  addEventListener('pointermove', (e) => { if (wd) grade(e); });
  addEventListener('pointerup', () => { wd = false; });
  addEventListener('dblclick', (e) => { if (hitWheel(e)) { gradeIdx = null; applyGradeCss(); } });
}

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
function resize() { fitName(); fx.width = innerWidth; fx.height = innerHeight; renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); measure(); layoutHero(); layoutDoors(); buildTicks(); }
addEventListener('resize', resize);
new ResizeObserver(() => { const t = total; measure(); if (Math.abs(t - total) > 4) buildTicks(); }).observe(document.body);

/* ───────────── loop ───────────── */
const clock = new THREE.Clock(), camLook = new THREE.Vector3(), camTarget = new THREE.Vector3(), lookTarget = new THREE.Vector3(0, 0, -10), mouseUv = new THREE.Vector2();
cam.position.set(0, 0, 6);
let shownCh = '', focusKey = '', lightK = 0; const bgC = new THREE.Color(), LIGHTC = new THREE.Color(0xf4f1ea), FLOORL = new THREE.Color(0xe4e0d6);
const heroH1 = $('h1'); let heroFx = .5, heroP = 50;
addEventListener('pointermove', (e) => { heroFx = e.clientX / innerWidth; });
const sectionIndex = () => { const mid = scrollY + innerHeight * .5; let i = 0; tops.forEach((t, k) => { if (t <= mid) i = k; }); return i; };
const pick = (objs) => { v2.set(ptr.x, ptr.y); ray.setFromCamera(v2, cam); const h = ray.intersectObjects(objs, false)[0]; return h ? h.object.userData : null; };

function tick() {
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
  scrollV = lerp(scrollV, (scrollY - lastY) / Math.max(dt, .001), .15); lastY = scrollY;
  const i = sectionIndex(), id = IDS[i], prog = clamp((scrollY - tops[i]) / Math.max(1, hs[i] - innerHeight));

  let fov = 50;
  if (id === 'hero') { camTarget.set(ptr.x * .25, ptr.y * .12, 6); lookTarget.set(0, 0, 0); fov = 38; }
  else if (id === 'doors') { camTarget.set(ptr.x * .35, .2 + ptr.y * .15, Z.doors + (cam.aspect < .95 ? 11 : 6.4)); lookTarget.set(0, 0, Z.doors); }
  else if (id === 'edits' || id === 'ai') { const T = tunnels[id], z = lerp(T.z0 + 11, T.end + 3, prog); camTarget.set(ptr.x * .45, ptr.y * .25, z); lookTarget.set(ptr.x * .8, ptr.y * .3, z - 10); }
  else if (id === 'cinema') { camTarget.set(ptr.x * .5, .3 + ptr.y * .25, Z.cinema + lerp(22, 17, prog)); lookTarget.set(ptr.x * .8, ptr.y * .3, Z.cinema); }
  else if (id === 'posters') { camTarget.set(0, ptr.y * .2, Z.posters); lookTarget.set(ptr.x * 1.2 * 0, ptr.y * .6, Z.posters - 10); }
  else { camTarget.set(ptr.x * .4, ptr.y * .2, Z.end + 5); lookTarget.set(0, 0, Z.end); fov = 46; }
  const k = 1 - Math.exp(-dt * (id === 'edits' || id === 'ai' ? 6 : 3.2)), prevZ = cam.position.z;
  cam.position.lerp(camTarget, k); camLook.lerp(lookTarget, k * 1.3); cam.lookAt(camLook);
  const speed = Math.abs(cam.position.z - prevZ) / Math.max(dt, .001);
  cam.fov = lerp(cam.fov, fov + Math.min(speed * .25, 16), .12); cam.updateProjectionMatrix();

  // white mode: background, fog, glows, floor and the hero photo ease over together
  { const lt = document.documentElement.classList.contains('light'); lightK = lerp(lightK, lt ? 1 : 0, .07);
    bgC.set(0x05060a).lerp(LIGHTC, lightK); renderer.setClearColor(bgC); scene.fog.color.copy(bgC);
    const normal = lightK > .5, bl = normal ? THREE.NormalBlending : THREE.AdditiveBlending;
    GLOWS.forEach((g) => { if (g.m.blending !== bl) { g.m.blending = bl; g.m.needsUpdate = true; } g.m.opacity = g.o * (normal ? .5 : 1); });
    [dustMat, ring.material, ring2.material].forEach((m) => { if (m.blending !== bl) { m.blending = bl; m.needsUpdate = true; } }); dustMat.opacity = normal ? .55 : .8;
    GRIDS.forEach((m) => { m.opacity = normal ? .4 : .28; }); floor.material.color.set(0x0a0b12).lerp(FLOORL, lightK);
    heroMat.uniforms.uLight.value = lightK; const want = normal ? heroCut : heroDark; if (heroMat.uniforms.uTex.value !== want) { heroMat.uniforms.uTex.value = want; heroLight = normal; layoutHero(); } }
  heroBackTick(t, id, dt);
  // opening: the photo pulls into focus while the camera eases in
  if (introT0 > 0) { const k = clamp((performance.now() - introT0 - 500) / 2400), e = 1 - Math.pow(1 - k, 3); heroMat.uniforms.uBlur.value = .014 * (1 - e); hero.scale.setScalar(1 + .1 * (1 - e)); if (k >= 1) introT0 = -2; }
  else if (introT0 === -2 && heroMat.uniforms.uBlur.value !== 0) { heroMat.uniforms.uBlur.value = 0; hero.scale.setScalar(1); }
  // hero
  heroMat.uniforms.uTime.value = t;
  heroMat.uniforms.uMouse.value.lerp(mouseUv.set(.5 + ptr.x * .32, .55 + ptr.y * .3), .08);
  hero.rotation.y = lerp(hero.rotation.y, ptr.x * .1, .06); hero.rotation.x = lerp(hero.rotation.x, -ptr.y * .05, .06);
  { const cool = document.documentElement.classList.contains('cool'), G = cool ? GRADE.cool : GRADE.warm; halo.material.color.lerp(G[0], .06); haloBlue.material.color.lerp(G[1], .06); ring.material.color.lerp(G[2], .06); ring2.material.color.lerp(G[3], .06); }
  ring2.rotation.z = -t * .5; ring.rotation.z = t * .1; halo.material.opacity = .75 + Math.sin(t * 1.6) * .1;

  // doors open toward you on hover
  const hit = id === 'doors' ? pick(doorObjs.map((g) => g.userData.hit)) : null;
  doorObjs.forEach((g) => { const u = g.userData, want = (hit && hit.door === g) || u.force ? 1 : 0; const was = u.open; u.open = lerp(u.open, want, 1 - Math.exp(-dt * 6)); if (was < .25 && u.open >= .25) sfx('open'); u.pivot.rotation.y = -u.open * 1.55; u.inner.material.color.setScalar(.2 + u.open * .8); u.glow.material.opacity = u.open * .8; u.light.intensity = u.open * 55; });

  // corridors: only the video in front of you plays
  for (const key of ['edits', 'ai']) {
    const T = tunnels[key], on = id === key && !FEED; let best = 0, bd = 1e9;
    T.items.forEach((it, n) => { const d = Math.abs(it.z - (cam.position.z - 5.5)); if (d < bd) { bd = d; best = n; } });
    T.items.forEach((it, n) => { setVideo(it, on && Math.abs(n - best) <= (LITE ? 0 : 1)); const dz = cam.position.z - it.z, sIn = on && dz > 0 ? clamp(1.25 - dz / 40, .5, 1) : 1; it.g.scale.setScalar(lerp(it.g.scale.x, (on && hovered?.tunnel === it ? 1.07 : 1) * sIn, .15)); });
    if (on) { const f = T.items[best], fk = key + best; if (fk !== focusKey) { focusKey = fk; $('#caption b').textContent = f.v.t; $('#caption span').textContent = 'Click to open'; } hovered = pick(T.items.map((it) => it.m)); }
  }
  // posters
  if (id === 'posters') { room.rotation.y = prog * Math.PI * 2 * .95 + ringDrag; ringVel *= .92; if (!drag) ringDrag += ringVel; hovered = pick(posterMeshes); }
  posterMeshes.forEach((m) => { const h = id === 'posters' && hovered?.poster === m.userData.poster; m.position.z = lerp(m.position.z, m.userData.base + (h ? 1.2 : 0), .14); m.scale.setScalar(lerp(m.scale.x, h ? 1.06 : 1, .14)); const u = m.material.uniforms.uPeel; u.value = lerp(u.value, h ? 1 : 0, .1); });
  if (id === 'doors') hovered = hit ? { door: hit.door } : null;
  else if (id === 'cinema') { v2.set(ptr.x, ptr.y); ray.setFromCamera(v2, cam); hovered = ray.intersectObject(cineScreen, false).length ? { screen: true } : null; }
  else if (id === 'contact') { v2.set(ptr.x, ptr.y); ray.setFromCamera(v2, cam); hovered = desk.visible && ray.intersectObject(deskScreen, false).length ? { desk: true } : null; }
  else if (id === 'hero') { v2.set(ptr.x, ptr.y); ray.setFromCamera(v2, cam); hovered = wheelOn() && ray.intersectObject(wheel, false).length ? { wheel: true } : null; }
  else if (id === 'about') hovered = null;

  { const doorsView = id === 'doors' && cam.aspect > .95, th = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * (doorsView ? 3.8 : 5), hw = th * cam.aspect;
    pet.visible = doorsView || id === 'contact' || (id === 'about' && prog > .6);
    pet.position.set(doorsView ? -hw * .62 : hw * (cam.aspect > 1 ? .64 : .4), -th * (doorsView ? .72 : .78), doorsView ? Z.doors + 2.6 : Z.end);
    pet.scale.setScalar((doorsView ? .55 : .8) * (cam.aspect > 1 ? 1 : .7)); pet.rotation.y = lerp(pet.rotation.y, (doorsView ? .5 : -.45) + ptr.x * .3, .08); petMixer?.update(dt * (party ? 1.7 : 1)); if (party) { pet.position.y += Math.abs(Math.sin(t * 6)) * .1; pet.rotation.z = Math.sin(t * 3) * .06; } else pet.rotation.z = 0; if (id !== 'contact' && (party || tvFrame)) { if (tvFrame) tvOff(); else stopParty(); } }
  { const on = id === 'cinema'; cinemaVideo(on); cineOpen = lerp(cineOpen, on ? 1 : 0, 1 - Math.exp(-dt * 1.5));
    curtains.forEach((c) => { const sc = lerp(1, .12, cineOpen), outer = 4.7 + (1 - sc) * .9; c.scale.x = sc; c.position.x = c.userData.side * (outer - 2.35 * sc); }); }
  // editing desk (Contact)
  { const dth = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * 6.2, dhw = dth * cam.aspect, showDesk = id === 'contact' && cam.aspect > 1;
    desk.visible = showDesk; deskScreen.visible = !tvFrame; deskVideo(showDesk && !tvFrame); if (showDesk && !tvFrame) tvOn(); desk.position.set(dhw * .34, -dth * .6, Z.end - 1.2); desk.scale.setScalar(.8); desk.rotation.y = -.25 + ptr.x * .06; }
  $('#back').classList.toggle('on', id === 'edits' || id === 'ai' || id === 'cinema' || id === 'posters');
  if (id === 'hero') { heroP = lerp(heroP, 50 + 34 * Math.sin(t * .45) + (heroFx - .5) * 40, .03); heroH1.style.backgroundPosition = heroP + '% 0'; }
  // overlays
  const ch = FEED && (id === 'edits' || id === 'ai') ? null : CHAPTERS[id], want = ch ? id : '';
  if (want !== shownCh) { shownCh = want; const el = $('#chapter'); el.classList.remove('on'); if (ch) setTimeout(() => { if (shownCh === id) { el.querySelector('h2').textContent = ch[0]; el.querySelector('p').textContent = ch[1]; el.classList.add('on'); } }, 250); }
  $('#caption').classList.toggle('on', (id === 'edits' || id === 'ai') && !FEED);
  ticks.forEach((b, n) => b.classList.toggle('on', n === i));
  head.style.left = (scrollY / total * 100) + '%'; tcode.textContent = tc(scrollY / total);
  if (hovered && (hovered.door || hovered.tunnel || hovered.poster || hovered.desk || hovered.screen || hovered.wheel)) { hov.hidden = false; hov.textContent = hovered.door ? hovered.door.userData.def.label : hovered.wheel ? 'Drag to colour-grade' : hovered.tunnel || hovered.desk || hovered.screen ? 'Play' : 'Zoom'; hov.style.left = ptr.px + 'px'; hov.style.top = ptr.py + 'px'; canvas.style.cursor = 'pointer'; }
  else { hov.hidden = true; canvas.style.cursor = id === 'posters' ? 'grab' : ''; }

  drawFx();
  renderer.render(scene, cam); placeTv();
  requestAnimationFrame(tick);
}
resize(); tick();

