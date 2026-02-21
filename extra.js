
'use strict';
// ══════════════════════════════════════════════
//  EXTRA.JS – 3D Avatar + Codex Cards + CSS
// ══════════════════════════════════════════════

// ── CODEX CARD INTERACTIVE ─────────────────────────────
const codexCSS = `
.codex-card{cursor:pointer;transition:transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s,border-color .35s,background .3s!important;}
.codex-card:hover{border-color:rgba(79,70,229,.6)!important;box-shadow:0 0 40px rgba(79,70,229,.2)!important;}
.codex-card .codex-more{max-height:0;overflow:hidden;transition:max-height .5s cubic-bezier(.16,1,.3,1),opacity .4s;opacity:0;}
.codex-card.expanded .codex-more{max-height:300px;opacity:1;}
.codex-card.expanded{border-color:rgba(79,70,229,.8)!important;background:rgba(79,70,229,.07)!important;}
.codex-card::after{content:'+ Expand';position:absolute;bottom:.8rem;right:1rem;font-size:.6rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(79,70,229,.6);transition:color .2s;}
.codex-card.expanded::after{content:'− Collapse';color:rgba(244,63,94,.7);}
.codex-card{position:relative;}

/* Codex hover scan-line */
.codex-card::before{content:'';position:absolute;inset:0;border-radius:1.25rem;background:linear-gradient(180deg,rgba(79,70,229,.06) 0%,transparent 60%);opacity:0;transition:opacity .3s;pointer-events:none;}
.codex-card:hover::before{opacity:1;}

/* AI Codex section interactive number badges */
.codex-num{display:inline-flex;align-items:center;justify-content:center;width:2rem;height:2rem;border-radius:50%;border:2px solid currentColor;font-size:.7rem;font-weight:900;flex-shrink:0;transition:transform .3s,box-shadow .3s;}
.codex-card:hover .codex-num{transform:scale(1.2) rotate(10deg);}
`;
const codexStyle = document.createElement('style');
codexStyle.textContent = codexCSS;
document.head.appendChild(codexStyle);

window.toggleCodex = function(el) {
  el.classList.toggle('expanded');
};

// Add extra hidden content blocks to codex cards
document.querySelectorAll('.codex-card').forEach((card, i) => {
  const extras = [
    'Neural networks find patterns by adjusting billions of internal weights via backpropagation. Each layer learns increasingly abstract representations.',
    'n8n supports 400+ native integrations. A single workflow can replace hours of manual data entry, email sorting, and reporting.',
    'GPT-4 and LLaMA-3 differ fundamentally: GPT-4 is closed-source with superior reasoning; LLaMA-3 is open-weight for fine-tuning your own vertical models.',
    'Modern AI ads use ControlNet for precise composition, IP-Adapter for brand consistency, and AnimateDiff for smooth motion synthesis.',
    'Business automation ROI typically ranges from 300–800% in the first year, with the highest gains in repetitive back-office tasks.',
    'Cinematic AI uses LoRA fine-tuning to inject a brand\'s visual identity into any generative model without full retraining.',
    'RAG systems use embedding similarity search (cosine distance on 1536-dim vectors) to retrieve the top-K most relevant documents for context.',
    'Effective prompts use four elements: Persona, Task, Context, and Format. Adding negative constraints cuts hallucinations by ~40%.',
    'Ollama enables running LLaMA-3 locally on consumer hardware (8GB VRAM), making enterprise AI feasible without cloud API costs.',
  ];
  if (extras[i]) {
    const more = document.createElement('div');
    more.className = 'codex-more mt-3 pt-3 text-gray-500 text-xs leading-relaxed';
    more.style.borderTop = '1px solid rgba(79,70,229,.15)';
    more.textContent = extras[i];
    card.appendChild(more);
  }
});

// ── 3D AVATAR (Three.js TorusKnot) ───────────────────────
(function init3DAvatar() {
  if (!window.THREE) return;
  function makeAvatarScene(canvasId) {
    const cv = document.getElementById(canvasId);
    if (!cv) return null;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 3.2;
    const renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(cv.offsetWidth || 176, cv.offsetHeight || 176);

    // Main geometry
    const geo = new THREE.TorusKnotGeometry(0.8, 0.28, 160, 24, 2, 3);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x4F46E5, emissive: 0x1a1060, specular: 0xffffff,
      shininess: 120, wireframe: false,
    });
    const knot = new THREE.Mesh(geo, mat);
    scene.add(knot);

    // Wireframe shell
    const wMat = new THREE.MeshBasicMaterial({ color: 0x818CF8, wireframe: true, transparent: true, opacity: 0.12 });
    scene.add(new THREE.Mesh(new THREE.TorusKnotGeometry(0.82, 0.30, 60, 10, 2, 3), wMat));

    // Lights
    scene.add(Object.assign(new THREE.AmbientLight(0x1a1060), {}));
    const pt = new THREE.PointLight(0x818CF8, 3, 8); pt.position.set(2, 2, 2); scene.add(pt);
    const pt2 = new THREE.PointLight(0xF43F5E, 1.5, 6); pt2.position.set(-2, -1, -1); scene.add(pt2);

    let hovX = 0, hovY = 0, isHov = false;
    cv.addEventListener('mouseenter', () => isHov = true);
    cv.addEventListener('mouseleave', () => { isHov = false; hovX = 0; hovY = 0; });
    cv.addEventListener('mousemove', e => {
      const r = cv.getBoundingClientRect();
      hovX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      hovY = -((e.clientY - r.top) / r.height - 0.5) * 2;
    });

    let t = 0;
    function animate() {
      requestAnimationFrame(animate); t += 0.012;
      knot.rotation.x += isHov ? hovY * 0.04 : 0.007;
      knot.rotation.y += isHov ? hovX * 0.04 : 0.011;
      pt.position.x = Math.sin(t) * 3;
      pt.position.y = Math.cos(t * 0.7) * 2;
      pt2.position.x = -Math.sin(t * 0.5) * 2;
      renderer.render(scene, camera);
    }
    animate();
    return renderer;
  }
  makeAvatarScene('avatar3d');
  // Make modal avatar too (but only when modal is opened)
  const origOpen = window.openProfile;
  window.openProfile = function() {
    origOpen && origOpen();
    setTimeout(() => makeAvatarScene('avatar3d-modal'), 100);
  };
})();

// ── DEEPGRAM VOICE FIX ───────────────────────────────────
// Override the startDG with improved error handling
const _origStartDG = window.startDG;
async function startDG2() {
  const vStatus = document.getElementById('voice-status');
  const waveBars = document.getElementById('wave-bars');
  const vStart = document.getElementById('voice-start');
  try {
    const tokenRes = await fetch('/api/deepgram/token', { method: 'POST' });
    const { key } = await tokenRes.json();
    if (!key) throw new Error('No key');

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const wsUrl = `wss://api.deepgram.com/v1/listen?language=en-US&punctuate=true&smart_format=true&model=nova-2`;
    const dgWs = new WebSocket(wsUrl, ['token', key]);

    dgWs.onopen = () => {
      if (vStatus) vStatus.textContent = '🎙️ Listening…';
      if (waveBars) waveBars.classList.remove('hidden');
      if (vStart) vStart.innerHTML = '<i class="fa-solid fa-stop"></i> Stop';

      const audCtx = new AudioContext();
      const src = audCtx.createMediaStreamSource(stream);
      const proc = audCtx.createScriptProcessor(4096, 1, 1);
      src.connect(proc); proc.connect(audCtx.destination);
      proc.onaudioprocess = ev => {
        if (dgWs.readyState !== 1) return;
        const f = ev.inputBuffer.getChannelData(0);
        const i16 = new Int16Array(f.length);
        for (let i = 0; i < f.length; i++) i16[i] = Math.max(-32768, Math.min(32767, f[i] * 32768));
        dgWs.send(i16.buffer);
      };
      vStart._cleanup = () => { proc.disconnect(); src.disconnect(); audCtx.close(); stream.getTracks().forEach(t => t.stop()); };
    };

    dgWs.onmessage = ev => {
      try {
        const d = JSON.parse(ev.data);
        const tr = d.channel?.alternatives?.[0]?.transcript;
        const vT = document.getElementById('voice-transcript');
        if (tr && vT) { vT.classList.remove('hidden'); vT.textContent = tr; }
        if (tr && d.is_final && tr.trim()) {
          sendMsg && sendMsg(tr);
          const vPanel = document.getElementById('voice-panel');
          if (vPanel) vPanel.classList.remove('open');
          dgWs.close();
        }
      } catch (_) {}
    };
    dgWs.onerror = dgWs.onclose = () => {
      if (vStart?._cleanup) vStart._cleanup();
      if (vStatus) vStatus.textContent = 'Press mic to start';
      if (waveBars) waveBars.classList.add('hidden');
      if (vStart) vStart.innerHTML = '<i class="fa-solid fa-microphone"></i> Start Listening';
      stream.getTracks().forEach(t => t.stop());
    };
    vStart._ws = dgWs;
  } catch (e) {
    console.error('DG error', e);
    if (vStatus) vStatus.textContent = 'Mic denied or API error.';
  }
}

const vStart2 = document.getElementById('voice-start');
if (vStart2) {
  vStart2.onclick = () => {
    if (vStart2._ws?.readyState === 1) {
      vStart2._ws.close(); if (vStart2._cleanup) vStart2._cleanup();
    } else { startDG2(); }
  };
}
