
'use strict';
// ═══════════════════════════════════════════════════════
//  EFFECTS V2 – 3D Hyperspace Starfield + 3D Orbit Spheres
// ═══════════════════════════════════════════════════════

// ── 3D HYPERSPACE STARFIELD ────────────────────────────
(function initStarfield3D() {
  const cv = document.createElement('canvas');
  cv.id = 'starfield';
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  document.body.insertBefore(cv, document.body.firstChild);
  const ctx = cv.getContext('2d');
  let W, H, stars = [], mx = 0, my = 0;
  const N = 350, FOV = 600, SPEED = 2.0;

  function resize() {
    W = cv.width = window.innerWidth;
    H = cv.height = window.innerHeight;
    stars = Array.from({ length: N }, () => newStar(true));
  }

  function newStar(random) {
    return {
      x: (Math.random() - 0.5) * W * 2.5,
      y: (Math.random() - 0.5) * H * 2.5,
      z: random ? Math.random() * FOV : FOV,
      pz: 0,
      color: ['#ffffff', '#818CF8', '#c4b5fd', '#FB7185', '#7dd3fc'][Math.floor(Math.random() * 5)]
    };
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mx = e.clientX - W / 2; my = e.clientY - H / 2; }, { passive: true });

  let t = 0;
  function draw() {
    t++;
    ctx.fillStyle = 'rgba(10,10,15,0.25)';
    ctx.fillRect(0, 0, W, H);

    const parallaxX = mx * 0.00015, parallaxY = my * 0.00015;

    stars.forEach(s => {
      s.pz = s.z;
      s.z -= SPEED + Math.abs(mx) * 0.003 + Math.abs(my) * 0.003;
      if (s.z <= 0) { Object.assign(s, newStar(false)); return; }

      const scl = FOV / s.z;
      const px = (s.x + parallaxX * s.z) * scl + W / 2;
      const py = (s.y + parallaxY * s.z) * scl + H / 2;

      const pscl = FOV / s.pz;
      const ppx = (s.x + parallaxX * s.pz) * pscl + W / 2;
      const ppy = (s.y + parallaxY * s.pz) * pscl + H / 2;

      if (px < -50 || px > W + 50 || py < -50 || py > H + 50) { Object.assign(s, newStar(false)); return; }

      const brightness = Math.min(1, (FOV - s.z) / FOV);
      const r2 = Math.max(0.5, (1 - s.z / FOV) * 3);

      ctx.beginPath();
      ctx.moveTo(ppx, ppy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = r2;
      ctx.globalAlpha = brightness * 0.9;
      ctx.stroke();

      // Bright core dot
      if (brightness > 0.7) {
        ctx.beginPath();
        ctx.arc(px, py, r2 * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = brightness * 0.6;
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── 3D SPHERE ORBIT ────────────────────────────────────
(function initOrbit3D() {
  const container = document.getElementById('orbit-container');
  if (!container) return;
  const cv = document.getElementById('orbit-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W2, H2, cxO, cyO;

  function resize2() {
    W2 = cv.width = container.offsetWidth || 460;
    H2 = cv.height = container.offsetHeight || 460;
    cxO = W2 / 2; cyO = H2 / 2;
  }
  resize2();
  window.addEventListener('resize', resize2);

  const FOV2 = 480;
  let hovSkill = null;
  let omx = 0, omy = 0;
  cv.addEventListener('mousemove', e => {
    const r = cv.getBoundingClientRect();
    omx = (e.clientX - r.left - cxO);
    omy = (e.clientY - r.top - cyO);
  });
  cv.addEventListener('mouseleave', () => { omx = 0; omy = 0; hovSkill = null; });

  const SKILLS = [
    { nm: 'n8n Automation', col: '#4F46E5', col2: '#6366F1', r: 90, tilt: 0.28, spd: 0.013, a: 0 },
    { nm: 'Python', col: '#22C55E', col2: '#4ADE80', r: 90, tilt: 0.28, spd: 0.013, a: 3.14 },
    { nm: 'Groq LLM', col: '#818CF8', col2: '#C4B5FD', r: 148, tilt: 0.52, spd: 0.008, a: 0 },
    { nm: 'Blender 3D', col: '#F59E0B', col2: '#FCD34D', r: 148, tilt: 0.52, spd: 0.008, a: 2.1 },
    { nm: 'RAG', col: '#38BDF8', col2: '#7DD3FC', r: 148, tilt: 0.52, spd: 0.008, a: 4.2 },
    { nm: 'Prompt Eng.', col: '#F43F5E', col2: '#FB7185', r: 200, tilt: 0.20, spd: 0.005, a: 1.0 },
    { nm: 'Adobe CC', col: '#EA580C', col2: '#FB923C', r: 200, tilt: 0.20, spd: 0.005, a: 3.3 },
    { nm: 'Vector DB', col: '#A78BFA', col2: '#DDD6FE', r: 193, tilt: 0.72, spd: 0.006, a: 0.5 },
    { nm: 'AI Agents', col: '#34D399', col2: '#6EE7B7', r: 193, tilt: 0.72, spd: 0.006, a: 2.6 },
  ];

  const RINGS = [
    { r: 90, tilt: 0.28 }, { r: 148, tilt: 0.52 },
    { r: 200, tilt: 0.20 }, { r: 193, tilt: 0.72 },
  ];

  function proj3(x3, y3, z3) {
    const sc = FOV2 / (FOV2 + z3 + 200);
    return { x: x3 * sc + cxO, y: y3 * sc + cyO, sc };
  }

  function drawSphere3D(x, y, radius, col, col2, alpha, isHov) {
    if (radius < 2) return;
    const r = isHov ? radius * 1.35 : radius;
    // Outer glow
    const gl = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
    gl.addColorStop(0, col + (isHov ? 'aa' : '55'));
    gl.addColorStop(1, col + '00');
    ctx.globalAlpha = alpha * 0.8;
    ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
    ctx.fillStyle = gl; ctx.fill();

    // Shadow (slightly offset)
    ctx.globalAlpha = alpha * 0.4;
    const shGrad = ctx.createRadialGradient(x + r * 0.3, y + r * 0.4, 0, x, y, r);
    shGrad.addColorStop(0.6, '#00000080');
    shGrad.addColorStop(1, '#00000000');
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = shGrad; ctx.fill();

    // 3D sphere body with proper lighting
    const lx = x - r * 0.42, ly = y - r * 0.42;
    const sGrad = ctx.createRadialGradient(lx, ly, 0, x, y, r);
    sGrad.addColorStop(0, '#ffffff');
    sGrad.addColorStop(0.18, col2);
    sGrad.addColorStop(0.55, col);
    sGrad.addColorStop(0.85, '#000000cc');
    sGrad.addColorStop(1, '#000000');
    ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = sGrad; ctx.fill();

    // Specular highlight
    const spGrad = ctx.createRadialGradient(lx + r * 0.1, ly + r * 0.1, 0, lx, ly, r * 0.55);
    spGrad.addColorStop(0, 'rgba(255,255,255,0.65)');
    spGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = spGrad; ctx.fill();

    ctx.globalAlpha = 1;
  }

  function drawRing(r, tilt, alpha) {
    ctx.beginPath(); let first = true;
    for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.06) {
      const x3 = Math.cos(a) * r, y3r = Math.sin(a) * r;
      const y3 = y3r * Math.cos(tilt), z3 = y3r * Math.sin(tilt);
      const p = proj3(x3, y3, z3);
      first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); first = false;
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
    ctx.lineWidth = 0.8; ctx.setLineDash([3, 8]);
    ctx.shadowColor = '#4F46E5'; ctx.shadowBlur = 3;
    ctx.stroke(); ctx.setLineDash([]); ctx.shadowBlur = 0;
  }

  // Sun glow particles
  const sunParticles = Array.from({ length: 12 }, (_, i) => ({
    a: (i / 12) * Math.PI * 2, r: 12 + Math.random() * 10, spd: 0.02 + Math.random() * 0.02
  }));

  let oT = 0;
  function animOrbit() {
    ctx.clearRect(0, 0, W2, H2);
    oT += 0.01;

    // Rings (back-pass)
    RINGS.forEach(rg => drawRing(rg.r, rg.tilt, 0.15 + 0.05 * Math.sin(oT)));

    // Sun
    sunParticles.forEach(p => {
      p.a += p.spd;
      const px = cxO + Math.cos(p.a) * p.r, py = cyO + Math.sin(p.a) * p.r;
      ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FDE68A'; ctx.globalAlpha = 0.6 + 0.4 * Math.sin(oT * 3 + p.a);
      ctx.fill(); ctx.globalAlpha = 1;
    });
    const sunR2 = 14 + Math.sin(oT * 2) * 2;
    const sunGl = ctx.createRadialGradient(cxO, cyO, 0, cxO, cyO, sunR2 * 4);
    sunGl.addColorStop(0, '#fff'); sunGl.addColorStop(0.3, '#FDE68A');
    sunGl.addColorStop(0.7, 'rgba(251,191,36,0.2)'); sunGl.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(cxO, cyO, sunR2 * 4, 0, Math.PI * 2);
    ctx.fillStyle = sunGl; ctx.fill();
    ctx.beginPath(); ctx.arc(cxO, cyO, sunR2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();

    // Compute + sort skills
    const pSkills = SKILLS.map(s => {
      s.a += s.spd;
      const x3 = Math.cos(s.a) * s.r;
      const y3r = Math.sin(s.a) * s.r;
      const y3 = y3r * Math.cos(s.tilt), z3 = y3r * Math.sin(s.tilt);
      const { x, y, sc } = proj3(x3, y3, z3);
      return { x, y, sc, s };
    });
    pSkills.sort((a, b) => a.sc - b.sc); // back-to-front

    // Hover detection
    hovSkill = null;
    pSkills.forEach(({ x, y, sc, s }) => {
      const sR = Math.max(6, sc * 22);
      if (Math.hypot(x - omx - cxO + cxO, y - omy - cyO + cyO) < sR + 8) hovSkill = s;
    });

    // Draw planets
    pSkills.forEach(({ x, y, sc, s }) => {
      const isHov = hovSkill === s;
      const sR = Math.max(6, sc * 22);
      drawSphere3D(x, y, sR, s.col, s.col2, 0.85 + sc * 0.15, isHov);

      // Label
      const fs = Math.max(9, Math.round(sc * 13));
      ctx.font = `700 ${fs}px Outfit,sans-serif`;
      ctx.textAlign = 'center';
      if (isHov || sc > 0.7) {
        const tw = ctx.measureText(s.nm).width;
        const lx2 = x, ly2 = y - sR - 8;
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(lx2 - tw / 2 - 6, ly2 - fs - 2, tw + 12, fs + 6);
        ctx.fillStyle = isHov ? '#fff' : s.col2;
        ctx.fillText(s.nm, lx2, ly2);
      }
    });

    // Central label
    ctx.textAlign = 'center'; ctx.font = 'bold 9px Outfit';
    ctx.fillStyle = 'rgba(251,191,36,0.8)';
    ctx.fillText('YOU', cxO, cyO + 5);

    requestAnimationFrame(animOrbit);
  }
  animOrbit();
})();
