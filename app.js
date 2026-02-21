'use strict';
// ─── GLOBALS ───────────────────────────────────────────────
let selectedLang = 'English'; // default – chat works immediately
let audioCtx;
const initAudio = () => { if (!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext); } if (audioCtx.state === 'suspended') audioCtx.resume(); };
document.body.addEventListener('click', initAudio, { once: true });

// ─── CUSTOM CURSOR ─────────────────────────────────────────
const cur = document.getElementById('cursor'), curR = document.getElementById('cursor-ring');
let mx = 0, my = 0, cx = 0, cy = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cur.style.transform = `translate(${mx}px,${my}px)`; }, { passive: true });
(function animCursor() { cx += (mx - cx) * .18; cy += (my - cy) * .18; if (curR) { curR.style.transform = `translate(${cx}px,${cy}px)`; } requestAnimationFrame(animCursor); })();
document.querySelectorAll('a,button,.magnetic-btn,.prank-dot').forEach(el => { el.addEventListener('mouseenter', () => { cur.style.width = '20px'; cur.style.height = '20px'; curR.style.width = '50px'; curR.style.height = '50px'; curR.style.borderColor = '#F43F5E'; }); el.addEventListener('mouseleave', () => { cur.style.width = '12px'; cur.style.height = '12px'; curR.style.width = '36px'; curR.style.height = '36px'; curR.style.borderColor = '#4F46E5'; }); });

// ─── CURSOR GLOW ───────────────────────────────────────────
const glow = document.getElementById('cursor-glow');
if (glow) { let gx = 0, gy = 0, gmx = 0, gmy = 0; document.addEventListener('mousemove', e => { gmx = e.clientX; gmy = e.clientY; glow.style.opacity = '1'; }); (function ag() { gx += (gmx - gx) * .12; gy += (gmy - gy) * .12; glow.style.transform = `translate(${gx - 128}px,${gy - 128}px)`; requestAnimationFrame(ag); })(); }

// ─── PRELOADER ─────────────────────────────────────────────
const preText = '>  Booting AryanOS... 100%'; let pc = 0;
const preEl = document.getElementById('pre-text');
function typePre() { if (!preEl) return; if (pc < preText.length) { preEl.textContent += preText[pc++]; setTimeout(typePre, 35); } else { const bo = document.getElementById('preloader-bar-outer'), bi = document.getElementById('preloader-bar-inner'); if (bo && bi) { bo.style.display = 'block'; setTimeout(() => bi.style.width = '100%', 50); } setTimeout(() => { const pl = document.getElementById('preloader'); if (pl) { pl.classList.add('loaded'); setTimeout(() => pl.remove(), 900); } }, 900); } }
setTimeout(typePre, 200);

// ─── LIVE TIME BADGE ───────────────────────────────────────
function updTime() { const el = document.getElementById('live-badge'); if (el) el.textContent = 'OPEN FOR WORK • ' + new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }); }
setInterval(updTime, 1000); updTime();

// ─── THREE.JS HERO ─────────────────────────────────────────
(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !window.THREE) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight || 1.7, 0.1, 1000);
  camera.position.z = 30;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(canvas.offsetWidth || window.innerWidth, canvas.offsetHeight || window.innerHeight);

  // Particles
  const count = 1200;
  const pos = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const c1 = new THREE.Color('#4F46E5'), c2 = new THREE.Color('#F43F5E'), c3 = new THREE.Color('#818CF8');
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - .5) * 80; pos[i * 3 + 1] = (Math.random() - .5) * 80; pos[i * 3 + 2] = (Math.random() - .5) * 80;
    const c = [c1, c2, c3][Math.floor(Math.random() * 3)];
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({ size: 0.25, vertexColors: true, transparent: true, opacity: 0.8 });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Floating geometric shapes
  const shapes = [];
  [{ c: '#4F46E5', x: -15, y: 5 }, { c: '#F43F5E', x: 15, y: -5 }, { c: '#3730A3', x: 0, y: -12 }].forEach(({ c, x, y }) => {
    const g = new THREE.IcosahedronGeometry(2.5, 0);
    const m = new THREE.MeshBasicMaterial({ color: c, wireframe: true, transparent: true, opacity: 0.15 });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(x, y, 0);
    scene.add(mesh); shapes.push(mesh);
  });

  let mx2 = 0, my2 = 0;
  document.addEventListener('mousemove', e => { mx2 = (e.clientX / window.innerWidth - .5) * 2; my2 = -(e.clientY / window.innerHeight - .5) * 2; });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate); t += 0.003;
    points.rotation.y = t * .3; points.rotation.x = t * .1;
    shapes.forEach((s, i) => { s.rotation.x += .004 * (i + 1); s.rotation.y += .006 * (i + 1); });
    camera.position.x += (mx2 * 4 - camera.position.x) * .05;
    camera.position.y += (my2 * 2 - camera.position.y) * .05;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
  });
})();

// ─── SCROLL: PROGRESS + NAVBAR + REVEAL ────────────────────
const pBar = document.getElementById('progress-bar');
const nav = document.getElementById('navbar');
let lastScroll = 0;
function onScroll() {
  const st = window.pageYOffset;
  if (pBar) { const sh = document.documentElement.scrollHeight - document.documentElement.clientHeight; pBar.style.width = (st / sh * 100) + '%'; }
  if (nav) { if (st > lastScroll && st > 100) nav.classList.add('hidden-nav'); else nav.classList.remove('hidden-nav'); }
  lastScroll = st;
}
window.addEventListener('scroll', onScroll, { passive: true });
const revObs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); }); }, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(r => revObs.observe(r));

// ─── MAGNETIC BUTTONS ──────────────────────────────────────
document.querySelectorAll('.magnetic-btn').forEach(btn => {
  btn.addEventListener('mousemove', e => { const r = btn.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; btn.style.transform = `translate(${x * .3}px,${y * .3}px)`; });
  btn.addEventListener('mouseleave', () => btn.style.transform = '');
});

// ─── 3D TILT ON CARDS ──────────────────────────────────────
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const rx = ((y - r.height / 2) / r.height) * -8, ry = ((x - r.width / 2) / r.width) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});

// ─── HOVER PREVIEW BOX ─────────────────────────────────────
const hbox = document.getElementById('hover-box'), hEmoji = document.getElementById('hb-emoji'), hTxt = document.getElementById('hb-text');
document.querySelectorAll('.hover-tip').forEach(el => {
  el.addEventListener('mousemove', e => { if (hbox) { hbox.style.left = e.clientX + 16 + 'px'; hbox.style.top = e.clientY + 16 + 'px'; } });
  el.addEventListener('mouseenter', e => { if (hbox && hEmoji && hTxt) { hEmoji.textContent = el.dataset.emoji || '✨'; hTxt.textContent = el.dataset.tip || 'Magic'; hbox.classList.add('show'); } });
  el.addEventListener('mouseleave', () => hbox && hbox.classList.remove('show'));
});

// ─── TAB VISIBILITY ────────────────────────────────────────
const oTitle = document.title;
document.addEventListener('visibilitychange', () => { document.title = document.hidden ? "Don't forget to automate! 🤖" : oTitle; });

// ─── TYPEWRITER FOOTER ─────────────────────────────────────
const words = [{ t: 'Automate?', c: '#818CF8' }, { t: 'Scale?', c: '#F43F5E' }, { t: 'Innovate?', c: '#4ade80' }, { t: 'Dominate?', c: '#fbbf24' }];
let wi = 0, ci = 0, del = false;
const twEl = document.getElementById('typewriter');
function typeW() {
  if (!twEl) return; const w = words[wi]; if (del) ci--; else ci++;
  twEl.textContent = w.t.slice(0, ci); twEl.style.color = w.c;
  let spd = del ? 45 : 100;
  if (!del && ci === w.t.length) { spd = 2000; del = true; }
  else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; spd = 400; }
  setTimeout(typeW, spd);
}
if (twEl) setTimeout(typeW, 1500);

// ─── GOD MODE ──────────────────────────────────────────────
let gk = [];
window.addEventListener('keydown', e => { gk.push(e.key.toLowerCase()); if (gk.length > 5) gk.shift(); if (gk.join('') === 'aryan') { initAudio(); document.body.classList.add('god-mode'); showToast('⚡ GOD MODE ACTIVATED'); setTimeout(() => document.body.classList.remove('god-mode'), 5000); } });

// ─── TOAST ─────────────────────────────────────────────────
function showToast(msg, dur = 3500) { const t = document.getElementById('toast'), m = document.getElementById('toast-msg'); if (!t || !m) return; m.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), dur); }
window.showToast = showToast;

// ─── COPY TEXT ─────────────────────────────────────────────
window.copyText = function (txt, label) { const i = document.createElement('input'); i.value = txt; document.body.appendChild(i); i.select(); document.execCommand('copy'); document.body.removeChild(i); showToast(label + ' copied! ✅'); };

// ─── AUDIO HELPERS ─────────────────────────────────────────
function mkOsc(type, freq, vol, dur, freqEnd) {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  o.type = type; o.frequency.setValueAtTime(freq, audioCtx.currentTime);
  g.gain.setValueAtTime(vol, audioCtx.currentTime);
  if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, audioCtx.currentTime + dur);
  if (vol > 0.001) g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  o.start(); o.stop(audioCtx.currentTime + dur);
}
function playSiren() { if (!audioCtx) return; for (let i = 0; i < 10; i++) { const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.connect(g); g.connect(audioCtx.destination); o.type = 'sawtooth'; const t = audioCtx.currentTime + i * .5; o.frequency.setValueAtTime(300, t); o.frequency.linearRampToValueAtTime(700, t + .25); o.frequency.linearRampToValueAtTime(300, t + .5); g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + .5); o.start(t); o.stop(t + .5); } }
function playWater() { if (!audioCtx) return; const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 3, audioCtx.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++)d[i] = Math.random() * 2 - 1; const s = audioCtx.createBufferSource(), g = audioCtx.createGain(), f = audioCtx.createBiquadFilter(); s.buffer = buf; f.type = 'lowpass'; f.frequency.value = 500; s.connect(f); f.connect(g); g.connect(audioCtx.destination); g.gain.setValueAtTime(0.4, audioCtx.currentTime); g.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 1.5); s.start(); }
function playRumble() { if (!audioCtx) return; for (let i = 0; i < 5; i++) { const o = audioCtx.createOscillator(), g = audioCtx.createGain(), lfo = audioCtx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 30 + i * 10; lfo.type = 'sine'; lfo.frequency.value = 6 + i; const lg = audioCtx.createGain(); lfo.connect(lg); lg.gain.value = 15; lg.connect(o.frequency); o.connect(g); g.connect(audioCtx.destination); g.gain.setValueAtTime(0.02, audioCtx.currentTime); g.gain.linearRampToValueAtTime(0.07, audioCtx.currentTime + .5); g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 4); lfo.start(); o.start(); lfo.stop(audioCtx.currentTime + 4); o.stop(audioCtx.currentTime + 4); } }
function playBeeps() { if (!audioCtx) return; for (let i = 0; i < 30; i++) { const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.type = 'square'; o.frequency.value = 1200 + Math.random() * 400; const t = audioCtx.currentTime + i * .12; g.gain.setValueAtTime(0.03, t); g.gain.exponentialRampToValueAtTime(0.001, t + .08); o.connect(g); g.connect(audioCtx.destination); o.start(t); o.stop(t + .1); } }
function playDrone() { if (!audioCtx) return; const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.type = 'sine'; o.frequency.value = 60; g.gain.setValueAtTime(0, audioCtx.currentTime); g.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 1.5); g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 4); o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + 4); }

// ─── PRANK UTILITIES ───────────────────────────────────────
function prankToast() { showToast('Haha! Pranked you! 😂 System is 100% safe.', 4000); }
const crack = document.getElementById('crack-overlay');

// ─── PRANK 1: MATRIX BREACH ────────────────────────────────
function triggerMatrix() {
  initAudio(); playSiren(); playDrone();
  const scr = document.getElementById('prank-matrix');
  const cv = document.getElementById('matrix-canvas');
  const bar = document.getElementById('prank-bar');
  const log = document.getElementById('matrix-log');
  if (!scr || !cv) return;
  document.body.style.overflow = 'hidden';
  scr.style.display = 'flex';
  // flash red warning 3x
  for (let i = 0; i < 3; i++)setTimeout(() => document.body.classList.toggle('suspense-flash'), i * 400);
  // matrix rain
  cv.width = window.innerWidth; cv.height = window.innerHeight;
  const ctx2 = cv.getContext('2d'), cols = Math.floor(cv.width / 14) + 1, drops = Array.from({ length: cols }).fill(1);
  const mInt = setInterval(() => {
    ctx2.fillStyle = 'rgba(0,0,0,0.08)'; ctx2.fillRect(0, 0, cv.width, cv.height);
    ctx2.fillStyle = '#0f0'; ctx2.font = '13px monospace';
    drops.forEach((d, i) => { ctx2.fillText(String.fromCharCode(33 + Math.random() * 94), i * 14, d * 14); if (d * 14 > cv.height && Math.random() > .975) drops[i] = 0; drops[i]++; });
  }, 40);
  if (bar) { bar.style.width = '0'; setTimeout(() => bar.style.width = '100%', 50); }
  const chars = '01ACCESS_DENIED_INTRUSION_DETECTED_';
  const lInt = setInterval(() => { if (log) log.textContent += chars[Math.floor(Math.random() * chars.length)]; if (log && log.textContent.length > 200) log.textContent = ''; }, 30);
  setTimeout(() => { clearInterval(mInt); clearInterval(lInt); scr.style.display = 'none'; document.body.style.overflow = ''; prankToast(); }, 4500);
}

// ─── PRANK 2: FLOOD ────────────────────────────────────────
function triggerFlood() {
  initAudio(); playWater();
  const scr = document.getElementById('prank-flood');
  const water = document.getElementById('flood-water');
  if (!scr || !water) return;
  document.body.style.overflow = 'hidden';
  scr.style.visibility = 'visible';
  // Suspense: screen slightly shakes 1.5s before
  setTimeout(() => { water.style.transition = 'height 4s ease-in'; water.style.height = '100vh'; }, 300);
  setTimeout(() => { water.style.height = '0'; setTimeout(() => { scr.style.visibility = 'hidden'; document.body.style.overflow = ''; prankToast(); }, 1200); }, 4500);
}

// ─── PRANK 3: EARTHQUAKE ───────────────────────────────────
function triggerEarthquake() {
  initAudio(); playRumble();
  if (crack) { crack.style.opacity = '1'; }
  // Slow build: gentle shake → strong shake
  document.body.style.animation = 'quake .4s infinite';
  setTimeout(() => { document.body.style.animationDuration = '.12s'; }, 1000);
  setTimeout(() => { document.body.style.animation = ''; if (crack) crack.style.opacity = '0'; prankToast(); }, 4000);
}

// ─── PRANK 4: FORMAT / BSOD ────────────────────────────────
function triggerFormat() {
  initAudio(); playBeeps();
  const scr = document.getElementById('prank-format');
  const log2 = document.getElementById('format-log');
  if (!scr || !log2) return;
  document.body.style.overflow = 'hidden';
  scr.style.display = 'block';
  log2.textContent = '';
  const files = ['/system32/kernel.dll', '/boot/loader.sys', '/etc/shadow', '/root/config', '/sys/bios.rom', '/home/aryan/portfolio'];
  let n = 0;
  const fi = setInterval(() => {
    if (n < 50) {
      const f = files[Math.floor(Math.random() * files.length)] + '/' + Math.random().toString(36).slice(2, 8) + '.sys';
      log2.textContent += `Permanently deleting ${f}... [DONE]\n`;
      scr.scrollTop = scr.scrollHeight; n++;
    } else {
      log2.textContent += '\n!! CRITICAL ERROR: KERNEL PANIC !!\n!! ALL DATA DELETED. REBOOTING... !!\n';
      clearInterval(fi);
    }
  }, 70);
  setTimeout(() => { clearInterval(fi); scr.style.display = 'none'; document.body.style.overflow = ''; prankToast(); }, 4500);
}

// ─── HOVER PRANK SETUP (hover over 3 targets in sequence) ──
function setupHoverPrank(ids, cb) {
  const [id1, id2, id3] = ids;
  const e1 = document.getElementById(id1), e2 = document.getElementById(id2), e3 = document.getElementById(id3);
  if (!e1 || !e2 || !e3) return;
  let seq = 0, timer, fired = false;
  const reset = () => { if (!fired) { seq = 0;[e1, e2, e3].forEach(e => e.classList.remove('prank-hover')); } };
  const hit = (n, el) => {
    if (fired) return;
    clearTimeout(timer);
    if (n === seq + 1) { seq = n; el.classList.add('prank-hover'); timer = setTimeout(reset, 2000); if (seq === 3) { fired = true; setTimeout(() => { [e1, e2, e3].forEach(e => e.classList.remove('prank-hover')); fired = false; cb(); }, 250); } }
  };
  e1.addEventListener('mouseenter', () => hit(1, e1));
  e2.addEventListener('mouseenter', () => hit(2, e2));
  e3.addEventListener('mouseenter', () => hit(3, e3));
  e1.addEventListener('mouseleave', () => setTimeout(() => { if (seq > 0 && !fired) reset(); }, 800));
}

setupHoverPrank(['h-blue', 'h-red', 'h-green'], triggerMatrix);
setupHoverPrank(['p-blue', 'p-red', 'p-green'], triggerFlood);
setupHoverPrank(['s-blue', 's-red', 's-green'], triggerEarthquake);
setupHoverPrank(['t-blue', 't-red', 't-green'], triggerFormat);

// ─── MODAL HELPERS ─────────────────────────────────────────
function openModal(id, boxId) { const m = document.getElementById(id), b = document.getElementById(boxId); if (m && b) { m.classList.add('open'); setTimeout(() => { b.classList.remove('scale-95', 'opacity-0'); b.classList.add('scale-100', 'opacity-100'); }, 10); } }
function closeModal(id, boxId) { const m = document.getElementById(id), b = document.getElementById(boxId); if (m && b) { b.classList.remove('scale-100', 'opacity-100'); b.classList.add('scale-95', 'opacity-0'); setTimeout(() => m.classList.remove('open'), 350); } }
window.openProfile = () => openModal('profile-modal', 'profile-box');
window.closeProfile = () => closeModal('profile-modal', 'profile-box');
window.openContact = (e) => { if (e) e.preventDefault(); openModal('contact-modal', 'contact-box'); };
window.closeContact = () => closeModal('contact-modal', 'contact-box');
window.submitForm = function (e) { e.preventDefault(); const n = document.getElementById('f-name')?.value || ''; const s = document.getElementById('f-service')?.value || ''; const b = document.querySelector('input[name=budget]:checked')?.value || 'Not specified'; const m = document.getElementById('f-msg')?.value || ''; const body = `Hi Aryan,%0D%0A%0D%0A${m}%0D%0A%0D%0AService: ${s}%0D%0ABudget: ${b}%0D%0A%0D%0ARegards,%0D%0A${n}`; window.location.href = `mailto:wizart035@gmail.com?subject=${encodeURIComponent(s + ' - from ' + n)}&body=${body}`; closeContact(); };

// ─── CHATBOT ───────────────────────────────────────────────
const chatWin = document.getElementById('chatbot-window');
const chatToggle = document.getElementById('chat-toggle');
const chatClose = document.getElementById('chat-close');
if (chatToggle) chatToggle.addEventListener('click', () => {
  chatWin.classList.toggle('open'); chatToggle.classList.toggle('bot-ripple');
  // Auto-init English if no language picked yet
  if (!selectedLang) {
    selectedLang = 'English';
    const st = document.getElementById('bot-status'); if (st) st.textContent = 'Online (English)';
    const wm = document.querySelector('.chat-msg-bot'); if (wm) wm.textContent = 'Hi! 👋 How can I help you today?';
    const qs = ['Aryan\'s Expertise?', 'Work Methodology?', 'Recent Projects?', 'Contact Details'];
    const lc = document.getElementById('lang-chips');
    if (lc) lc.innerHTML = qs.map(q => `<button class="chat-chip shrink-0 bg-brand/20 text-brand-light px-3 py-1.5 rounded-full text-[10px] font-bold hover:bg-brand hover:text-white transition-all">${q}</button>`).join('');
    const row = document.getElementById('chat-input-row'); if (row) row.classList.remove('hidden');
    const mic2 = document.getElementById('mic-btn'); if (mic2) mic2.classList.remove('hidden');
  }
});
if (chatClose) chatClose.addEventListener('click', () => { chatWin.classList.remove('open'); chatToggle && chatToggle.classList.add('bot-ripple'); });

async function callGroq(msg, sysPr, onToken) {
  try {
    const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg, system: sysPr, language: selectedLang }) });
    if (!r.ok) throw new Error();
    const reader = r.body.getReader(), dec = new TextDecoder(); let buf = '';
    while (true) { const { done, value } = await reader.read(); if (done) break; buf += dec.decode(value, { stream: true }); const lines = buf.split('\n'); buf = lines.pop(); for (const ln of lines) { const tr = ln.trim(); if (!tr || tr === 'data: [DONE]') continue; if (tr.startsWith('data: ')) { try { const j = JSON.parse(tr.slice(6)); if (j.token) onToken(j.token); if (j.error) onToken('[Error: ' + j.error + ']'); } catch (_) { } } } }
  } catch (e) { onToken('Email Aryan at wizart035@gmail.com 🤖'); }
}

function appendMsg(cls, text) { const d = document.getElementById('chat-msgs'); if (!d) return null; const el = document.createElement('div'); el.className = cls; el.textContent = text; d.appendChild(el); d.scrollTop = d.scrollHeight; return el; }

async function sendMsg(txt) {
  if (!txt.trim()) return;
  const inp = document.getElementById('chat-input'); if (inp) inp.value = '';
  appendMsg('chat-msg-user', txt);
  const thinking = appendMsg('chat-msg-bot streaming-dot', '');
  const sysPr = `You are Aryan Patel's personal AI Assistant. Language: ${selectedLang}. Refer to Aryan as "he/him". MANDATORY: Keep replies brief (1-2 sentences MAX). MANDATORY footer: "Reach out at wizart035@gmail.com or +91-9203320882!"`;
  await callGroq(txt, sysPr, (token) => { thinking.classList.remove('streaming-dot'); thinking.textContent += token; const d = document.getElementById('chat-msgs'); if (d) d.scrollTop = d.scrollHeight; });
}

const langChips = document.getElementById('lang-chips');
if (langChips) {
  langChips.addEventListener('click', function (e) {
    const chip = e.target.closest('.lang-chip,.chat-chip'); if (!chip) return;
    if (chip.classList.contains('lang-chip')) {
      selectedLang = chip.dataset.lang;
      const st = document.getElementById('bot-status'); if (st) st.textContent = 'Online (' + selectedLang + ')';
      const wm = document.querySelector('.chat-msg-bot'); if (wm) wm.textContent = { English: 'How can I help you today?', Hindi: 'आज मैं आपकी कैसे मदद कर सकता हूँ?', Hinglish: 'Aaj main aapki kaise help kar sakta hoon?' }[selectedLang] || 'How can I help?';
      const qs = { English: ['Aryan\'s Expertise?', 'Work Methodology?', 'Recent Projects?', 'Contact Details'], Hindi: ['विशेषज्ञता?', 'तरीका?', 'हालिया प्रोजेक्ट्स?', 'संपर्क विवरण'], Hinglish: ['Expertise?', 'Methodology?', 'Projects?', 'Contact bata'] }[selectedLang] || [];
      langChips.innerHTML = qs.map(q => `<button class="chat-chip shrink-0 bg-brand/20 text-brand-light px-3 py-1.5 rounded-full text-[10px] font-bold hover:bg-brand hover:text-white transition-all">${q}</button>`).join('');
      const row = document.getElementById('chat-input-row'); if (row) row.classList.remove('hidden');
    } else { sendMsg(chip.textContent); }
  });
}
const chatSend = document.getElementById('chat-send'), chatInp = document.getElementById('chat-input');
if (chatSend && chatInp) { chatSend.addEventListener('click', () => sendMsg(chatInp.value)); chatInp.addEventListener('keypress', e => { if (e.key === 'Enter') sendMsg(chatInp.value); }); }

// ─── VOICE TO TEXT (Web Speech API) ───────────────────────
const micBtn = document.getElementById('mic-btn');
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SR && micBtn) {
  micBtn.classList.remove('hidden');
  const rec = new SR(); rec.continuous = false; rec.interimResults = false;
  micBtn.addEventListener('click', () => { initAudio(); rec.start(); micBtn.classList.add('mic-active'); });
  rec.onresult = ev => { sendMsg(ev.results[0][0].transcript); micBtn.classList.remove('mic-active'); };
  rec.onerror = rec.onend = () => micBtn.classList.remove('mic-active');
}

// ─── DEMO SECTION (Groq Prompt Engineer) ──────────────────
const dBtn = document.getElementById('demo-btn');
if (dBtn) {
  dBtn.addEventListener('click', async () => {
    const inp = document.getElementById('demo-input'); const ow = document.getElementById('demo-out-wrap'); const ot = document.getElementById('demo-out');
    if (!inp?.value.trim()) return;
    if (ow) ow.classList.remove('hidden'); if (ot) ot.textContent = '';
    try { const r = await fetch('/api/engineer-prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idea: inp.value }) }); const d = await r.json(); if (ot) ot.textContent = d.result || 'Error generating prompt'; }
    catch (e) { if (ot) ot.textContent = 'Email Aryan directly at wizart035@gmail.com!'; }
  });
}

// ─── DEEPGRAM VOICE AGENT ─────────────────────────────────
let dgSocket = null, dgActive = false, dgStream = null;
const vBtn = document.getElementById('voice-agent-btn');
const vPanel = document.getElementById('voice-panel');
const vStart = document.getElementById('voice-start');
const vStatus = document.getElementById('voice-status');
const vTranscript = document.getElementById('voice-transcript');
const waveBars = document.getElementById('wave-bars');
window.closeVoicePanel = function () { if (vPanel) vPanel.classList.remove('open'); stopDG(); };
if (vBtn) vBtn.addEventListener('click', () => { if (vPanel) vPanel.classList.toggle('open'); });

async function startDG() {
  if (dgActive) return;
  try {
    const tok = await (await fetch('/api/deepgram/token', { method: 'POST' })).json();
    dgStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    dgSocket = new WebSocket('wss://api.deepgram.com/v1/listen?language=en&smart_format=true&interim_results=true', ['token', tok.key]);
    dgSocket.onopen = () => {
      dgActive = true; if (vStatus) vStatus.textContent = 'Listening...🎙️'; if (waveBars) waveBars.classList.remove('hidden'); if (vTranscript) { vTranscript.classList.remove('hidden'); vTranscript.textContent = ''; }
      if (vStart) vStart.textContent = '⏹ Stop Listening';
      const ctx = new AudioContext(), src = ctx.createMediaStreamSource(dgStream), proc = ctx.createScriptProcessor(4096, 1, 1);
      src.connect(proc); proc.connect(ctx.destination);
      proc.onaudioprocess = e => { if (dgSocket?.readyState === 1) { const f32 = e.inputBuffer.getChannelData(0); const i16 = new Int16Array(f32.length); for (let i = 0; i < f32.length; i++)i16[i] = Math.max(-32768, Math.min(32767, f32[i] * 32768)); dgSocket.send(i16.buffer); } };
    };
    dgSocket.onmessage = ev => {
      try { const d = JSON.parse(ev.data); const tr = d.channel?.alternatives?.[0]?.transcript; if (tr && vTranscript) { vTranscript.textContent = tr; if (d.is_final && tr.trim()) { sendMsg(tr); if (vPanel) vPanel.classList.remove('open'); stopDG(); } } } catch (_) { }
    };
    dgSocket.onclose = dgSocket.onerror = () => stopDG();
  } catch (e) { if (vStatus) vStatus.textContent = 'Mic access denied or error.'; console.error('DG error:', e); }
}
function stopDG() { dgActive = false; if (dgSocket) { dgSocket.close(); } if (dgStream) dgStream.getTracks().forEach(t => t.stop()); dgSocket = null; dgStream = null; if (vStatus) vStatus.textContent = 'Press mic to start'; if (waveBars) waveBars.classList.add('hidden'); if (vStart) vStart.innerHTML = '<i class="fa-solid fa-microphone"></i> Start Listening'; }
if (vStart) vStart.addEventListener('click', () => { if (dgActive) stopDG(); else startDG(); });
