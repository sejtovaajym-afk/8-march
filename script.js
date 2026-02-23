// ===================== MOBILE VH FIX =====================
function setVh(){
  document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
}
setVh();
window.addEventListener("resize", setVh);

// ===================== ELEMENTS =====================
const card = document.getElementById("card");
const noBtn  = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const status = document.getElementById("status");

const musicToggle = document.getElementById("musicToggle");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const bgm = document.getElementById("bgm");

const typeText = document.getElementById("typeText");
const countdownEl = document.getElementById("countdown");

// ===================== PARALLAX =====================
let px = 0, py = 0;
window.addEventListener("pointermove", (e) => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  px = (e.clientX - cx) / 40;
  py = (e.clientY - cy) / 40;
  document.documentElement.style.setProperty("--px", `${px}px`);
  document.documentElement.style.setProperty("--py", `${py}px`);
});

// ===================== TYPEWRITER (KZ) =====================
const TEXT =
  "Құрметті оқытушылар! Сіздерді 8 Наурыз мерекесіне арналған жылы кездесуге шақырамыз ✨ " +
  "Жағымды атмосфера, шағын викторина және тәтті сыйлықтар болады. " +
  "Қатысатыныңызды “Барамын ✅” батырмасымен белгілеңіз.";

async function typewriter(el, text, speed = 15){
  el.textContent = "";
  for (let i = 0; i < text.length; i++){
    el.textContent += text[i];
    await new Promise(r => setTimeout(r, speed));
  }
}
typewriter(typeText, TEXT, 15);

// ===================== COUNTDOWN (4 наурыз 14:00) =====================
function getEventDate(){
  const now = new Date();
  const year = now.getFullYear();
  // ай: 0-11, наурыз = 2
  return new Date(year, 2, 4, 14, 0, 0);
}

function renderCountdown(){
  const target = getEventDate();
  const now = new Date();
  let diff = target - now;

  // егер өткен болса – 0
  if (diff < 0) diff = 0;

  const sec = Math.floor(diff / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;

  countdownEl.innerHTML = `
    <div class="chip"><span>${String(days).padStart(2,"0")}</span><small>күн</small></div>
    <div class="chip"><span>${String(hours).padStart(2,"0")}</span><small>сағ</small></div>
    <div class="chip"><span>${String(mins).padStart(2,"0")}</span><small>мин</small></div>
    <div class="chip"><span>${String(secs).padStart(2,"0")}</span><small>сек</small></div>
  `;
}
renderCountdown();
setInterval(renderCountdown, 1000);

// ===================== FULLSCREEN =====================
fullscreenBtn.addEventListener("click", async () => {
  try{
    if (!document.fullscreenElement){
      await document.documentElement.requestFullscreen();
      fullscreenBtn.textContent = "⛶ Шығу";
      status.textContent = "✅ Толық экран қосылды";
    } else {
      await document.exitFullscreen();
      fullscreenBtn.textContent = "⛶ Толық экран";
    }
  }catch(e){
    status.textContent = "Толық экран қосылмады (браузер шектеуі болуы мүмкін).";
  }
});

// ===================== MUSIC (FADE IN/OUT) =====================
let musicOn = false;
let fading = false;

function updateMusicButton(){
  musicToggle.textContent = musicOn ? "🔊 Әуен: Қосулы" : "🔇 Әуен: Өшірулі";
}

async function fadeTo(targetVolume, ms = 850){
  if (fading) return;
  fading = true;

  const steps = 24;
  const stepTime = ms / steps;
  const delta = (targetVolume - bgm.volume) / steps;

  for (let i=0;i<steps;i++){
    bgm.volume = Math.max(0, Math.min(1, bgm.volume + delta));
    await new Promise(r => setTimeout(r, stepTime));
  }

  bgm.volume = targetVolume;
  fading = false;
}

async function startMusic(){
  try{
    bgm.volume = 0;
    await bgm.play();          // тек қолданушы басқаннан кейін іске қосылады
    await fadeTo(0.35, 900);   // тыныш дыбыс
    musicOn = true;
  }catch(e){
    musicOn = false;
    status.textContent = "🔇 Әуен қосылмады. Алдымен бетке бір рет басып, қайта қосып көріңіз.";
  }
  updateMusicButton();
}

async function stopMusic(){
  try{
    await fadeTo(0.0, 600);
    bgm.pause();
  }catch(e){}
  musicOn = false;
  updateMusicButton();
}

musicToggle.addEventListener("click", async () => {
  if (!musicOn) await startMusic();
  else await stopMusic();
});
updateMusicButton();

// ===================== RUNAWAY ONLY ONCE =====================
let hasRunAway = false;

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function moveNoButtonOnce(){
  const pad = 12;
  const rect = noBtn.getBoundingClientRect();

  const maxX = window.innerWidth - rect.width - pad;
  const maxY = window.innerHeight - rect.height - pad;

  const x = clamp(Math.random() * maxX, pad, maxX);
  const y = clamp(Math.random() * maxY, pad, maxY);

  noBtn.style.left = `${x}px`;
  noBtn.style.top  = `${y}px`;
  noBtn.style.transform = "translate(0,0)";

  noBtn.animate(
    [
      { transform: "translate(0,0) scale(1)" },
      { transform: "translate(0,0) scale(1.06)" },
      { transform: "translate(0,0) scale(1)" }
    ],
    { duration: 160, easing: "ease-out" }
  );
}

function finalizeNoButton(){
  // “профессионально”: артық тыңдаушыларды алып тастаймыз
  noBtn.removeEventListener("pointerenter", onPointerEnter);
  noBtn.removeEventListener("pointerdown", onPointerDown);
  noBtn.removeEventListener("touchstart", onTouchStart);
}

function triggerRunAwayOnce(){
  if (hasRunAway) return;
  hasRunAway = true;

  moveNoButtonOnce();
  status.textContent = "😄"
  finalizeNoButton();
}

// handlers (removeEventListener үшін)
function onPointerEnter(){ triggerRunAwayOnce(); }
function onPointerDown(e){
  e.preventDefault(); // қашқан сәтте клик өтпесін
  triggerRunAwayOnce();
}
function onTouchStart(e){
  e.preventDefault();
  triggerRunAwayOnce();
}

noBtn.addEventListener("pointerenter", onPointerEnter);
noBtn.addEventListener("pointerdown", onPointerDown);
noBtn.addEventListener("touchstart", onTouchStart, { passive: false });

// 1 рет қашқаннан кейін басса – жай ғана мәтін
noBtn.addEventListener("click", () => {
  if (!hasRunAway){
    triggerRunAwayOnce();
    return;
  }
  status.textContent = "🙂 Түсінікті! Бірақ сізді күтеміз. Қаласаңыз “Барамын ✅” басыңыз!";
  yesBtn.animate(
    [
      { transform: "translateY(0) scale(1)" },
      { transform: "translateY(-2px) scale(1.02)" },
      { transform: "translateY(0) scale(1)" }
    ],
    { duration: 420, easing: "ease-out" }
  );
});

// ===================== CONFETTI =====================
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");

function resizeCanvas(){
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function rand(min,max){ return Math.random()*(max-min)+min; }

let pieces = [];
let running = false;

function burst(x, y, count = 90){
  for (let i=0;i<count;i++){
    pieces.push({
      x, y,
      vx: rand(-4.5, 4.5),
      vy: rand(-6.5, -1.0),
      g: 0.12,
      w: rand(6, 12),
      h: rand(8, 16),
      rot: rand(0, Math.PI*2),
      vr: rand(-0.22, 0.22),
      hue: Math.floor(rand(0, 360)),
      life: rand(80, 130),
    });
  }
}

function animate(){
  if (!running) return;
  ctx.clearRect(0,0,window.innerWidth, window.innerHeight);

  pieces.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.g;
    p.rot += p.vr;
    p.life -= 1;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, .95)`;
    ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
    ctx.restore();
  });

  pieces = pieces.filter(p => p.life > 0 && p.y < window.innerHeight + 80);

  if (pieces.length > 0) requestAnimationFrame(animate);
  else {
    running = false;
    ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
  }
}

function runCelebration(){
  running = true;
  pieces = [];
  burst(window.innerWidth*0.25, window.innerHeight*0.45, 110);
  burst(window.innerWidth*0.75, window.innerHeight*0.45, 110);
  burst(window.innerWidth*0.50, window.innerHeight*0.35, 130);
  requestAnimationFrame(animate);
}

// ===================== YES BUTTON =====================
yesBtn.addEventListener("click", async () => {
  if (!musicOn) await startMusic();

  runCelebration();

  status.innerHTML = `
    🎉 Керемет! Сізді күтеміз!<br/>
    <span style="color:rgba(255,255,255,.72)">4 наурыз, 14:00 — кездескенше 🌷</span>
  `;

  yesBtn.disabled = true;
  yesBtn.textContent = "Кездескенше! 🌸";
  yesBtn.style.cursor = "default";

  // “Бармаймын” әдемі жоғалады
  noBtn.animate(
    [
      { opacity: 1, transform: getComputedStyle(noBtn).transform },
      { opacity: 0, transform: "translate(0,0) scale(.7)" }
    ],
    { duration: 260, easing: "ease-out" }
  );
  noBtn.style.opacity = "0";
  noBtn.style.pointerEvents = "none";

  card.animate(
    [
      { transform: "translate3d(0,0,0) scale(1)" },
      { transform: "translate3d(0,-3px,0) scale(1.01)" },
      { transform: "translate3d(0,0,0) scale(1)" }
    ],
    { duration: 520, easing: "ease-out" }
  );
});
