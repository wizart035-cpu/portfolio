
'use strict';
// ═══════════════════════════════════════════════════════════════
//  PRANKS V3 — Hyper-realistic scary pranks + clean wire system
// ═══════════════════════════════════════════════════════════════

// ── AUDIO CONTEXT ──────────────────────────────────────────────
let pACtx;
const pAudio = () => {
  if (!pACtx) pACtx = new (window.AudioContext || window.webkitAudioContext)();
  if (pACtx.state === 'suspended') pACtx.resume();
  return pACtx;
};

function masterOut(vol) {
  const mg = pAudio().createGain(); mg.gain.value = vol;
  mg.connect(pAudio().destination); return mg;
}
function osc(type, freq, vol, dur, out) {
  const o = pAudio().createOscillator(), g = pAudio().createGain();
  o.type = type; o.frequency.value = freq; g.gain.value = vol;
  g.gain.exponentialRampToValueAtTime(0.001, pAudio().currentTime + dur);
  o.connect(g); g.connect(out || pAudio().destination );
  o.start(); o.stop(pAudio().currentTime + dur);
}
function noise(dur, lpFreq, startVol, endVol, out) {
  const ctx = pAudio(), buf = ctx.createBuffer(1, ctx.sampleRate*dur, ctx.sampleRate);
  const d = buf.getChannelData(0); for (let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  f.type='lowpass'; f.frequency.value=lpFreq;
  g.gain.setValueAtTime(startVol, ctx.currentTime);
  g.gain.linearRampToValueAtTime(endVol, ctx.currentTime+dur);
  s.buffer=buf; s.connect(f); f.connect(g); g.connect(out||ctx.destination); s.start();
}

// ══════════════════════════════════════════════════════════════
//  PRANK AUDIO ENGINES
// ══════════════════════════════════════════════════════════════
function soundBreach() {
  const ctx=pAudio(), now=ctx.currentTime, mg=masterOut(0.8);
  // Nuclear alarm: alternating 700/400 Hz saw, 14 bursts
  for (let i=0;i<14;i++){
    const t=now+i*0.38;
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sawtooth'; o.frequency.setValueAtTime(700,t); o.frequency.setValueAtTime(380,t+0.19);
    g.gain.setValueAtTime(0.12,t); g.gain.setValueAtTime(0.001,t+0.37);
    o.connect(g); g.connect(mg); o.start(t); o.stop(t+0.38);
  }
  // EMP crack
  noise(0.18, 4000, 1.5, 0.001, mg);
  // Deep heartbeat x10
  for (let i=0;i<10;i++) {
    [0,0.16].forEach(off=>{
      const t=now+i*0.6+off, o=ctx.createOscillator(), g=ctx.createGain();
      o.type='sine'; o.frequency.value=68;
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.22,t+0.04);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.16);
      o.connect(g); g.connect(mg); o.start(t); o.stop(t+0.17);
    });
  }
  // Voice
  if (window.speechSynthesis) {
    const u = new SpeechSynthesisUtterance('Warning. System breach detected. All files are being extracted. Do not power off this device.');
    u.rate=0.78; u.pitch=0.4; u.volume=1;
    setTimeout(()=>speechSynthesis.speak(u), 600);
  }
}

function soundWater() {
  const ctx=pAudio(), now=ctx.currentTime, mg=masterOut(1.0);
  // Rushing water: layered noise
  noise(6, 600, 0.04, 0.85, mg);
  noise(6, 200, 0.02, 0.45, mg);
  // Sub rumble
  const sub=ctx.createOscillator(), sg=ctx.createGain();
  sub.type='sine'; sub.frequency.value=35;
  sg.gain.setValueAtTime(0,now); sg.gain.linearRampToValueAtTime(0.3,now+2);
  sub.connect(sg); sg.connect(mg); sub.start(now); sub.stop(now+7);
  // 25 random bubbles
  for (let i=0;i<25;i++){
    const t=now+0.2+Math.random()*5;
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(200+Math.random()*350,t);
    o.frequency.exponentialRampToValueAtTime(60,t+0.22);
    g.gain.setValueAtTime(0.09,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.22);
    o.connect(g); g.connect(mg); o.start(t); o.stop(t+0.23);
  }
}

function soundQuake() {
  const ctx=pAudio(), now=ctx.currentTime, mg=masterOut(1.0);
  // 7 rumble oscillators building up
  for (let i=0;i<7;i++){
    const o=ctx.createOscillator(), lo=ctx.createOscillator(), lg=ctx.createGain(), g=ctx.createGain();
    o.type='sawtooth'; o.frequency.value=15+i*9;
    lo.type='sine'; lo.frequency.value=3+i*1.2;
    lg.gain.value=8+i*7; lo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0.001,now); g.gain.linearRampToValueAtTime(0.03+i*0.015,now+1.5);
    g.gain.linearRampToValueAtTime(0.12+i*0.02,now+4);
    o.connect(g); g.connect(mg); lo.start(now); o.start(now); lo.stop(now+5); o.stop(now+5);
  }
  // Glass crack transients
  for (let i=0;i<6;i++){
    const t=now+0.5+i*0.65;
    noise(0.06, 8000, 1.0, 0.001, mg);
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type='sawtooth'; o.frequency.value=180-i*20;
    g.gain.setValueAtTime(0.12,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.06);
    o.connect(g); g.connect(mg); o.start(t); o.stop(t+0.07);
  }
}

function soundBSOD() {
  const ctx=pAudio(), now=ctx.currentTime, mg=masterOut(1.0);
  // HDD seek grind
  const lfo=ctx.createOscillator(), lg=ctx.createGain(), o2=ctx.createOscillator(), g2=ctx.createGain();
  lfo.type='square'; lfo.frequency.value=22; lg.gain.value=400;
  o2.type='sawtooth'; o2.frequency.value=1000;
  lfo.connect(lg); lg.connect(o2.frequency);
  g2.gain.setValueAtTime(0.14,now); g2.gain.linearRampToValueAtTime(0.001,now+4.5);
  o2.connect(g2); g2.connect(mg); lfo.start(now); o2.start(now); lfo.stop(now+4.5); o2.stop(now+4.5);
  // 50 rapid error beeps
  for (let i=0;i<50;i++){
    const t=now+i*0.075, o=ctx.createOscillator(), g=ctx.createGain();
    o.type='square'; o.frequency.value=800+(i%7)*180;
    g.gain.setValueAtTime(0.08,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.06);
    o.connect(g); g.connect(mg); o.start(t); o.stop(t+0.07);
  }
  // Power whine down at end
  const pw=ctx.createOscillator(), pg=ctx.createGain();
  pw.type='sine'; pw.frequency.setValueAtTime(2200,now+3.5);
  pw.frequency.exponentialRampToValueAtTime(18,now+5.5);
  pg.gain.setValueAtTime(0.18,now+3.5); pg.gain.exponentialRampToValueAtTime(0.001,now+5.5);
  pw.connect(pg); pg.connect(mg); pw.start(now+3.5); pw.stop(now+5.6);
}

// ══════════════════════════════════════════════════════════════
//  PRANK SCREENS — Rebuilt as realistic full-page overlays
// ══════════════════════════════════════════════════════════════
function buildScreens() {
  // Remove old prank divs and create fresh DOM
  ['prank-matrix','prank-flood','prank-format'].forEach(id=>{
    const el=document.getElementById(id);
    if (el) el.parentNode.removeChild(el);
  });

  // ── 1. BREACH (Matrix) ──
  const breach=document.createElement('div');
  breach.id='prank-breach';
  breach.style.cssText='position:fixed;inset:0;z-index:999999;display:none;background:#000;font-family:monospace;overflow:hidden;';
  breach.innerHTML=`
    <canvas id="mc2" style="position:absolute;inset:0;width:100%;height:100%;"></canvas>
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:10;">
      <div style="text-align:center;background:rgba(0,0,0,0.85);border:2px solid #ff0000;border-radius:12px;padding:3rem 4rem;box-shadow:0 0 60px rgba(255,0,0,0.6),0 0 120px rgba(255,0,0,0.2);max-width:600px;">
        <div style="font-size:3rem;margin-bottom:0.5rem;animation:pulse2 0.5s infinite alternate;">☠️</div>
        <div style="color:#ff0000;font-size:2rem;font-weight:900;letter-spacing:0.15em;margin-bottom:0.5rem;" id="breach-title">SYSTEM BREACHED</div>
        <div style="color:#ff6060;font-size:0.8rem;letter-spacing:0.1em;margin-bottom:1.5rem;">CRITICAL SECURITY VIOLATION DETECTED</div>
        <div style="background:#0a0a0a;border:1px solid #333;border-radius:6px;padding:1rem;text-align:left;margin-bottom:1.5rem;height:130px;overflow:hidden;" id="breach-log">
          <span style="color:#00ff41;font-size:0.72rem;"></span>
        </div>
        <div style="color:#ff4040;font-size:0.75rem;margin-bottom:0.5rem;">DATA UPLOAD PROGRESS</div>
        <div style="background:#1a0000;border-radius:4px;height:12px;overflow:hidden;border:1px solid #ff0000;">
          <div id="breach-pbar" style="height:100%;width:0%;background:linear-gradient(90deg,#ff0000,#ff4040);transition:width 4s ease-out;box-shadow:0 0 10px #ff0000;"></div>
        </div>
        <div id="breach-pct" style="color:#ff4040;font-size:0.7rem;margin-top:0.4rem;">0%</div>
      </div>
    </div>`;
  document.body.appendChild(breach);

  // ── 2. FLOOD ──
  const flood=document.createElement('div');
  flood.id='prank-flood2';
  flood.style.cssText='position:fixed;inset:0;z-index:999999;display:none;overflow:hidden;background:#020814;';
  flood.innerHTML=`
    <canvas id="flood-cv2" style="position:absolute;inset:0;width:100%;height:100%;"></canvas>
    <div id="flood-alert" style="position:absolute;top:12%;left:50%;transform:translateX(-50%);z-index:5;text-align:center;opacity:0;transition:opacity 1.2s;">
      <div style="background:rgba(0,20,60,0.9);border:2px solid #38bdf8;border-radius:16px;padding:2.5rem 4rem;backdrop-filter:blur(12px);box-shadow:0 0 60px rgba(56,189,248,0.5);">
        <div style="font-size:4rem;margin-bottom:0.5rem;">🌊</div>
        <div style="color:#38bdf8;font-size:2.4rem;font-weight:900;letter-spacing:0.1em;">SYSTEM FLOODED</div>
        <div style="color:#7dd3fc;font-size:0.9rem;margin-top:0.5rem;">Emergency Protocol Alpha — Coolant Overflow Detected</div>
      </div>
    </div>`;
  document.body.appendChild(flood);

  // ── 3. QUAKE (no separate div — shakes body) ──
  // crack SVG already injected by previous code, but rebuild cleaner
  let sv=document.getElementById('crack-svg');
  if (sv) sv.parentNode.removeChild(sv);
  sv=document.createElementNS('http://www.w3.org/2000/svg','svg');
  sv.id='crack-svg2';
  sv.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:999997;opacity:0;transition:opacity 0.4s;';
  // radial cracks
  const crackPaths=[
    'M50%,48% Q35%,30% 10%,5%','M50%,48% Q62%,28% 90%,2%',
    'M50%,48% Q70%,55% 98%,62%','M50%,48% Q65%,72% 80%,99%',
    'M50%,48% Q48%,75% 30%,100%','M50%,48% Q25%,65% 2%,78%',
    'M50%,48% Q28%,40% 3%,32%','M50%,48% Q40%,25% 45%,2%',
  ];
  const W3=innerWidth, H3=innerHeight;
  crackPaths.forEach((d,i)=>{
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    // convert % to px
    const dp=d.replace(/(\d+\.?\d*)%/g,(m,v)=>(parseFloat(v)/100*(i%2===0?W3:H3))+'');
    path.setAttribute('d',dp);
    path.setAttribute('stroke',`rgba(255,${100+i*15},${80+i*10},0.85)`);
    path.setAttribute('stroke-width', i<2?'3':'2');
    path.setAttribute('fill','none');
    path.setAttribute('stroke-linecap','round');
    sv.appendChild(path);
    // Secondary smaller cracks
    const sub=document.createElementNS('http://www.w3.org/2000/svg','path');
    const midMatch=d.match(/Q(\S+),(\S+)/);
    if(midMatch){
      const mx=parseFloat(midMatch[1])/100*W3, my=parseFloat(midMatch[2])/100*H3;
      const ex=mx+(Math.random()-0.5)*100, ey=my+(Math.random()-0.5)*80;
      sub.setAttribute('d',`M${mx},${my} L${ex},${ey}`);
      sub.setAttribute('stroke','rgba(255,200,180,0.4)'); sub.setAttribute('stroke-width','1'); sub.setAttribute('fill','none');
      sv.appendChild(sub);
    }
  });
  document.body.appendChild(sv);

  // ── 4. BSOD FORMAT ──
  let old=document.getElementById('prank-format');
  if (old) old.parentNode.removeChild(old);
  const bsod=document.createElement('div');
  bsod.id='prank-bsod';
  bsod.style.cssText='position:fixed;inset:0;z-index:999999;display:none;background:#0050EF;font-family:"Segoe UI",monospace;color:#fff;padding:4rem 5rem;overflow:hidden;';
  bsod.innerHTML=`
    <div style="font-size:8rem;margin-bottom:1.5rem;line-height:1;">:(</div>
    <div style="font-size:1.4rem;font-weight:700;margin-bottom:2rem;max-width:680px;line-height:1.5;">Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.</div>
    <div id="bsod-pct-txt" style="font-size:2.8rem;font-weight:700;margin-bottom:3rem;">0% complete</div>
    <div style="font-size:0.85rem;color:rgba(255,255,255,0.8);margin-bottom:3rem;">If you'd like to know more, you can search online later for this error: <strong>SYSTEM_FORMAT_INITIATED</strong></div>
    <div style="font-family:monospace;font-size:0.72rem;color:rgba(255,255,255,0.55);" id="bsod-log"></div>
    <div style="position:absolute;bottom:3rem;right:5rem;text-align:right;">
      <div style="font-size:0.7rem;color:rgba(255,255,255,0.5);">Stop code: SYSTEM_FORMAT_INITIATED</div>
      <div style="font-size:0.6rem;color:rgba(255,255,255,0.35);">0x0000006B (0xC0000034, 0x00000002, 0x00000000, 0x00000000)</div>
    </div>`;
  document.body.appendChild(bsod);

  // Add pulse keyframe
  if (!document.getElementById('p2-style')) {
    const st=document.createElement('style');
    st.id='p2-style';
    st.textContent='@keyframes pulse2{from{opacity:1;transform:scale(1)}to{opacity:0.7;transform:scale(1.1)}} @keyframes glitch2{0%,100%{transform:none}20%{transform:translate(3px,-2px) skewX(1deg)}40%{transform:translate(-3px,2px) skewX(-1deg)}60%{transform:translate(2px,3px)}80%{transform:translate(-2px,-1px)}}';
    document.head.appendChild(st);
  }
}
buildScreens();

// ══════════════════════════════════════════════════════════════
//  WIRE CANVAS — Lines only, visible only when cursor nearby
// ══════════════════════════════════════════════════════════════
const wireCV = document.createElement('canvas');
wireCV.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99990;';
document.body.appendChild(wireCV);
const wCtx = wireCV.getContext('2d');
function szWire(){ wireCV.width=innerWidth; wireCV.height=innerHeight; }
szWire(); window.addEventListener('resize', szWire);

const GROUPS = [
  {ids:['h-blue','h-red','h-green'], color:'#818CF8'},
  {ids:['p-blue','p-red','p-green'], color:'#38BDF8'},
  {ids:['t-blue','t-red','t-green'], color:'#F43F5E'},
  {ids:['s-blue','s-red','s-green'], color:'#4ADE80'},
];
let wireMX=0, wireMY=0;
document.addEventListener('mousemove', e=>{ wireMX=e.clientX; wireMY=e.clientY; });
const wireSeq = GROUPS.map(()=>({ seq:0, fired:false }));

let wT=0;
function drawWires(){
  wCtx.clearRect(0,0,wireCV.width,wireCV.height); wT+=0.03;
  GROUPS.forEach((g, gi)=>{
    const pts = g.ids.map(id=>{ const el=document.getElementById(id); if(!el){return null;} const r=el.getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+r.height/2}; }).filter(Boolean);
    if(pts.length<2) return;
    // Only draw if cursor within 180px of any dot
    const near = pts.some(p=>Math.hypot(p.x-wireMX,p.y-wireMY)<180);
    if(!near && wireSeq[gi].seq===0) return;
    const st = wireSeq[gi];
    for(let i=0;i<pts.length-1;i++){
      const p1=pts[i], p2=pts[i+1], activated=st.seq>i;
      const mx=(p1.x+p2.x)/2+Math.sin(wT+i+gi*2.1)*6;
      const my=(p1.y+p2.y)/2+Math.cos(wT*1.3+i+gi)*6;
      wCtx.beginPath(); wCtx.moveTo(p1.x,p1.y); wCtx.quadraticCurveTo(mx,my,p2.x,p2.y);
      if(activated){
        wCtx.strokeStyle='#4ADE80'; wCtx.lineWidth=2.5; wCtx.setLineDash([]);
        wCtx.shadowColor='#4ADE80'; wCtx.shadowBlur=14;
      } else {
        const op=0.3+0.2*Math.sin(wT*2+gi); wCtx.globalAlpha=op;
        wCtx.strokeStyle=g.color; wCtx.lineWidth=1.5; wCtx.setLineDash([5,7]);
        wCtx.shadowColor=g.color; wCtx.shadowBlur=5;
      }
      wCtx.stroke(); wCtx.globalAlpha=1; wCtx.shadowBlur=0; wCtx.setLineDash([]);
    }
  });
  requestAnimationFrame(drawWires);
}
drawWires();

// ══════════════════════════════════════════════════════════════
//  HOVER ACTIVATION — clean, 5s timeout, feedback beeps
// ══════════════════════════════════════════════════════════════
function setupWirePrank(gi, cb){
  const g=GROUPS[gi], st=wireSeq[gi];
  const els=g.ids.map(id=>document.getElementById(id));
  let timer;
  function reset(){ if(!st.fired){ st.seq=0; } }
  els.forEach((el,i)=>{
    if(!el) return;
    el.style.cursor='crosshair';
    // Larger hit zones via padding trick
    if(el.classList.contains('prank-dot')){ el.style.padding='12px'; el.style.margin='-12px'; }
    el.addEventListener('mouseenter',()=>{
      if(st.fired) return;
      if(i===st.seq){
        clearTimeout(timer); st.seq++;
        // Audit beep
        if(pACtx){ const o=pACtx.createOscillator(),gn=pACtx.createGain(); o.frequency.value=300+st.seq*300; gn.gain.value=0.04; gn.gain.exponentialRampToValueAtTime(0.001,pACtx.currentTime+0.12); o.connect(gn); gn.connect(pACtx.destination); o.start(); o.stop(pACtx.currentTime+0.13); }
        timer=setTimeout(reset, 5000);
        if(st.seq===els.length){ st.fired=true; setTimeout(()=>{ st.seq=0; st.fired=false; cb(); },180); }
      }
    });
  });
}

// ══════════════════════════════════════════════════════════════
//  TRIGGER FUNCTIONS
// ══════════════════════════════════════════════════════════════
function triggerBreach(){
  pAudio(); soundBreach();
  const scr=document.getElementById('prank-breach');
  const mc=document.getElementById('mc2');
  const log=document.getElementById('breach-log');
  const pbar=document.getElementById('breach-pbar');
  const pct=document.getElementById('breach-pct');
  if(!scr) return;
  document.body.style.overflow='hidden';
  // Pre-flash 4x
  let fc=0; const fi=setInterval(()=>{ scr.style.display=fc%2===0?'block':'none'; fc++; if(fc>=8){clearInterval(fi);scr.style.display='block';}},90);
  if(mc){mc.width=innerWidth;mc.height=innerHeight;}
  // Matrix rain
  const mc_ctx=mc.getContext('2d');
  const cols=Math.floor(innerWidth/14)+1, drps=Array.from({length:cols}).fill(1);
  let phase=0, elapsed=0;
  const mInt=setInterval(()=>{
    elapsed+=35; phase=elapsed>2500?1:0;
    mc_ctx.fillStyle=phase?'rgba(0,0,0,0.06)':'rgba(0,0,0,0.08)';
    mc_ctx.fillRect(0,0,mc.width,mc.height);
    mc_ctx.fillStyle=phase?'#ff3030':'#00ff41';
    mc_ctx.font='13px monospace';
    drps.forEach((d,i)=>{mc_ctx.fillText(String.fromCharCode(33+Math.random()*94),i*14,d*14);if(d*14>mc.height&&Math.random()>.975)drps[i]=0;drps[i]++;});
  },35);
  if(pbar){setTimeout(()=>pbar.style.width='100%',60);}
  // Fake log messages
  const msgs=[
    '> Bypassing firewall..................[DONE]',
    '> Kernel access obtained..............[DONE]',
    '> Extracting /users/aryan/documents..[DONE]',
    '> Uploading to remote server..........',
    '> IP TRACED: 192.168.'+Math.floor(Math.random()*255)+'.'+Math.floor(Math.random()*255),
    '> TARGET IDENTIFIED. DATA TRANSFER: 100%',
    '!! YOUR FILES HAVE BEEN COPIED !!',
  ];
  let mi2=0;
  const logEl=log?.querySelector('span');
  const lInt=setInterval(()=>{ if(logEl&&mi2<msgs.length){logEl.textContent+=msgs[mi2++]+'\n';log.scrollTop=log.scrollHeight;} if(pct){const v=Math.min(100,Math.round(mi2/msgs.length*100));pct.textContent=v+'%';} },620);
  setTimeout(()=>{
    clearInterval(mInt);clearInterval(lInt);
    if(window.speechSynthesis)speechSynthesis.cancel();
    scr.style.display='none';document.body.style.overflow='';
    showToast('😂 Relax! You were pranked! System is 100% safe.',5000);
  },5500);
}

function triggerFlood(){
  pAudio(); soundWater();
  const scr=document.getElementById('prank-flood2');
  const fc=document.getElementById('flood-cv2');
  const alrt=document.getElementById('flood-alert');
  if(!scr||!fc) return;
  document.body.style.overflow='hidden';
  scr.style.display='block';
  fc.width=innerWidth; fc.height=innerHeight;
  const fc2=fc.getContext('2d');
  let wH=0, wT2=0, fin=false;
  function drawW(){
    if(fin) return;
    fc2.clearRect(0,0,fc.width,fc.height);
    const maxH=fc.height*0.97;
    wH=Math.min(wH+maxH/(60*5),maxH);
    const y0=fc.height-wH;
    // Deep ocean background
    fc2.fillStyle='#020814'; fc2.fillRect(0,0,fc.width,fc.height);
    // Animated wave surface
    fc2.beginPath(); fc2.moveTo(0,y0);
    for(let x=0;x<=fc.width;x+=3){
      const wy=y0+Math.sin(x*0.016+wT2)*14+Math.sin(x*0.035+wT2*1.7)*7+Math.sin(x*0.008+wT2*0.5)*20;
      fc2.lineTo(x,wy);
    }
    fc2.lineTo(fc.width,fc.height); fc2.lineTo(0,fc.height); fc2.closePath();
    const wg=fc2.createLinearGradient(0,y0,0,fc.height);
    wg.addColorStop(0,'rgba(30,140,255,0.8)');
    wg.addColorStop(0.3,'rgba(15,80,200,0.9)');
    wg.addColorStop(1,'rgba(5,20,100,0.98)');
    fc2.fillStyle=wg; fc2.fill();
    // Foam at surface
    fc2.strokeStyle='rgba(255,255,255,0.3)'; fc2.lineWidth=2;
    fc2.beginPath(); fc2.moveTo(0,y0);
    for(let x=0;x<=fc.width;x+=3){
      fc2.lineTo(x,y0+Math.sin(x*0.016+wT2)*14+Math.sin(x*0.035+wT2*1.7)*7+Math.sin(x*0.008+wT2*0.5)*20);
    }
    fc2.stroke();
    // Bubbles
    for(let i=0;i<4;i++){
      const bx=Math.random()*fc.width, by2=y0+30+Math.random()*(wH-30), br=2+Math.random()*6;
      fc2.beginPath(); fc2.arc(bx,by2,br,0,Math.PI*2);
      fc2.strokeStyle=`rgba(255,255,255,${0.15+Math.random()*0.2})`; fc2.lineWidth=1; fc2.stroke();
    }
    // Light rays through water
    for(let i=0;i<3;i++){
      const rx=fc.width*0.2+i*fc.width*0.3;
      const rg=fc2.createLinearGradient(rx,y0,rx+50,fc.height);
      rg.addColorStop(0,'rgba(100,180,255,0.07)'); rg.addColorStop(1,'rgba(100,180,255,0)');
      fc2.beginPath(); fc2.moveTo(rx,y0); fc2.lineTo(rx+60,fc.height); fc2.lineTo(rx-10,fc.height); fc2.closePath();
      fc2.fillStyle=rg; fc2.fill();
    }
    wT2+=0.04;
    if(alrt&&wH>fc.height*0.2) alrt.style.opacity='1';
    requestAnimationFrame(drawW);
  }
  drawW();
  setTimeout(()=>{
    fin=true; scr.style.display='none'; document.body.style.overflow='';
    if(alrt)alrt.style.opacity='0';
    showToast('🌊 Just a prank! No water damage! 😂',4000);
  },6000);
}

function triggerQuake(){
  pAudio(); soundQuake();
  const sv=document.getElementById('crack-svg2');
  // 4 escalating phases
  const phases=[
    {dur:700, ms:250, px:3},
    {dur:900, ms:120, px:7},
    {dur:1100, ms:60,  px:14},
    {dur:1500, ms:28,  px:22},
  ];
  let shkI, pi=0;
  if(sv)sv.style.opacity='0';
  function phase(i){
    if(i>=phases.length){
      clearInterval(shkI); document.body.style.transform=''; document.body.style.filter='';
      if(sv)sv.style.opacity='0';
      showToast('🌍 Pranked! No earthquake here! 😂',4000); return;
    }
    const ph=phases[i];
    if(sv&&i>=1) sv.style.opacity=String(Math.min(1,i*0.3));
    document.body.style.filter=`brightness(${Math.max(0.55,1-i*0.13)}) contrast(${1+i*0.25})`;
    clearInterval(shkI);
    shkI=setInterval(()=>{
      const x=(Math.random()-0.5)*ph.px*2, y=(Math.random()-0.5)*ph.px*2;
      const r=(Math.random()-0.5)*ph.px*0.4;
      document.body.style.transform=`translate(${x}px,${y}px) rotate(${r}deg)`;
    }, ph.ms);
    setTimeout(()=>{ clearInterval(shkI); phase(i+1); }, ph.dur);
  }
  phase(0);
}

function triggerBSOD(){
  pAudio(); soundBSOD();
  const scr=document.getElementById('prank-bsod');
  const pct=document.getElementById('bsod-pct-txt');
  const lg=document.getElementById('bsod-log');
  if(!scr) return;
  document.body.style.overflow='hidden';
  scr.style.display='flex'; scr.style.flexDirection='column'; scr.style.justifyContent='center';
  scr.style.animation='glitch2 0.15s infinite';
  // Shake the BSOD screen itself (NOT body — body transform breaks fixed positioning)
  const shk=setInterval(()=>{
    const x=(Math.random()-0.5)*18, y=(Math.random()-0.5)*18;
    scr.style.transform=`translate(${x}px,${y}px)`;
  },22);
  // Count up %
  let n2=0;
  const countI=setInterval(()=>{
    n2=Math.min(100,n2+1);
    if(pct) pct.textContent=n2+'% complete';
    if(lg&&n2%4===0){
      const f='/system32/'+Math.random().toString(36).slice(2,10)+'.dll';
      lg.textContent+=`Collecting error: ${f}\n`;
    }
    if(n2>=100) clearInterval(countI);
  },45);
  setTimeout(()=>{
    clearInterval(shk); clearInterval(countI);
    scr.style.transform=''; scr.style.display='none'; scr.style.animation='';
    document.body.style.overflow='';
    showToast('💀 Pranked! Your PC is totally fine! 😂',5000);
  },5200);
}

// ══════════════════════════════════════════════════════════════
//  REGISTER
// ══════════════════════════════════════════════════════════════
setupWirePrank(0, triggerBreach);
setupWirePrank(1, triggerFlood);
setupWirePrank(2, triggerQuake);
setupWirePrank(3, triggerBSOD);
