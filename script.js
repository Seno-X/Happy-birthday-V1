const cutter = document.getElementById('cutter');
const giftContainer = document.getElementById('gift-container');
const giftBox = document.getElementById('gift-box');
const giftCanvas = document.getElementById('giftCanvas');
const gCtx = giftCanvas.getContext('2d');
const healthFill = document.getElementById('health-fill');
const msgSub = document.getElementById('msg-sub');
const whiteFlash = document.getElementById('white-flash');

// --- แก้ไขจุดนี้: ระบบสุ่มจำนวนครั้ง (Random 5 - 10 ครั้ง) ---
let catchesNeeded = Math.floor(Math.random() * 11) + 10; 
let currentCatches = 0;
let isEscaping = true;
let isDragging = false;
let progress = 0;
let lastX, lastY;
let fwParticles = [];
let sparks = [];

const randomGreetings = [
    "ขอให้ปีนี้เป็นปีที่เปล่งประกายเหมือนทองคำนะ!",
    "คิดเงินได้เงิน คิดทองได้ทอง รวยๆ ปังๆ!",
    "ขอให้ทุกวันของคุณเต็มไปด้วยความสุขและรอยยิ้ม!",
    "สุขภาพแข็งแรง มีพลังทำตามความฝันให้สำเร็จ!",
    "ขอให้เป็นปีที่โชคดีที่สุดในทุกๆ เรื่องเลย!"
];

function initGiftCanvas() {
    giftCanvas.width = 220; giftCanvas.height = 220;
    gCtx.lineCap = 'round'; gCtx.lineJoin = 'round';
}
initGiftCanvas();

// --- พลุสีทองล้วน ---
setInterval(() => {
    if(giftContainer.style.display !== 'none') 
        createFirework(Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.4, false);
}, 1500);

function createFirework(x, y, isMega = false) {
    const count = isMega ? 150 : 35;
    for(let i=0; i<count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (isMega ? 12 : 5.5);
        fwParticles.push({
            x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            color: `hsl(45, 100%, ${50 + Math.random() * 30}%)`,
            alpha: 1, size: Math.random() * 2 + 1, decay: Math.random() * 0.01 + 0.005
        });
    }
}

function createSparks(x, y) {
    for(let i=0; i<5; i++) {
        sparks.push({
            x, y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10,
            alpha: 1, size: Math.random()*2+1
        });
    }
}

function drawAdvancedRip(x1, y1, x2, y2) {
    gCtx.strokeStyle = 'rgba(26, 26, 26, 0.9)';
    gCtx.lineWidth = 5;
    gCtx.beginPath();
    gCtx.moveTo(x1, y1);
    let mx = (x1+x2)/2 + (Math.random()-0.5)*6;
    let my = (y1+y2)/2 + (Math.random()-0.5)*6;
    gCtx.lineTo(mx, my); gCtx.lineTo(x2, y2);
    gCtx.stroke();

    gCtx.strokeStyle = 'rgba(255, 224, 102, 0.5)';
    gCtx.lineWidth = 1.5;
    gCtx.beginPath();
    gCtx.moveTo(x1+2, y1+2); gCtx.lineTo(x2+2, y2+2);
    gCtx.stroke();
}

function cutterJump() {
    if (!isEscaping) return;
    currentCatches++;
    if (currentCatches < catchesNeeded) {
        const x = Math.random() * (window.innerWidth - 100) + 50;
        const y = Math.random() * (window.innerHeight - 150) + 50;
        cutter.style.left = `${x}px`; cutter.style.top = `${y}px`;
        cutter.style.transition = 'all 0.15s cubic-bezier(0.2, 1, 0.2, 1)';
        msgSub.innerText = "จับไม่ได้หรอกก!";
    } else {
        isEscaping = false; msgSub.innerText = "จับได้แล้ว! กรีดกล่องเลย!";
        cutter.style.transition = 'none';
    }
}

cutter.addEventListener('mouseover', cutterJump);
cutter.addEventListener('touchstart', (e) => { e.preventDefault(); cutterJump(); });

function handleMove(e) {
    if (!isDragging || isEscaping) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    
    cutter.style.left = `${cx - 8}px`; cutter.style.top = `${cy - 15}px`;
    const rect = giftBox.getBoundingClientRect();
    const gx = cx - rect.left, gy = cy - rect.top;

    if (cx > rect.left && cx < rect.right && cy > rect.top && cy < rect.bottom) {
        if (lastX !== undefined) {
            drawAdvancedRip(lastX, lastY, gx, gy);
            createSparks(cx, cy);
        }
        progress += 1.5;
        healthFill.style.width = `${Math.min(progress, 100)}%`;
        giftContainer.classList.add('shake');
        if (progress >= 100) openGift();
    } else { giftContainer.classList.remove('shake'); }
    lastX = gx; lastY = gy;
}

const startAction = (e) => {
    if(isEscaping) return; isDragging = true;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = giftBox.getBoundingClientRect();
    lastX = cx - rect.left; lastY = cy - rect.top;
};

document.addEventListener('mousedown', startAction);
document.addEventListener('touchstart', startAction, {passive:false});
document.addEventListener('mousemove', handleMove);
document.addEventListener('touchmove', handleMove, {passive:false});
document.addEventListener('mouseup', () => { isDragging = false; giftContainer.classList.remove('shake'); lastX = undefined; });
document.addEventListener('touchend', () => { isDragging = false; giftContainer.classList.remove('shake'); lastX = undefined; });

function openGift() {
    if (giftContainer.style.display === 'none') return;
    whiteFlash.style.opacity = '1';
    setTimeout(() => {
        giftContainer.style.display = 'none'; cutter.style.display = 'none';
        document.getElementById('msg-main').innerText = "HAPPY BIRTHDAY!";
        msgSub.innerText = randomGreetings[Math.floor(Math.random() * randomGreetings.length)];
        whiteFlash.style.opacity = '0';
        for(let i=0; i<15; i++) setTimeout(() => createFirework(Math.random()*window.innerWidth, Math.random()*window.innerHeight*0.5, true), i*150);
    }, 600);
}

const fwCanvas = document.getElementById('fireworksCanvas'), fwCtx = fwCanvas.getContext('2d');
const shadowCanvas = document.getElementById('shadowCanvas'), shadowCtx = shadowCanvas.getContext('2d');

function resize() { fwCanvas.width = shadowCanvas.width = window.innerWidth; fwCanvas.height = shadowCanvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();

function animate() {
    requestAnimationFrame(animate);
    fwCtx.fillStyle = 'rgba(10, 10, 15, 0.2)';
    fwCtx.fillRect(0,0,fwCanvas.width, fwCanvas.height);
    
    fwParticles.forEach((p, i) => {
        p.vy += 0.05; p.x += p.vx; p.y += p.vy; p.alpha -= p.decay;
        if(p.alpha > 0) {
            fwCtx.globalAlpha = p.alpha; fwCtx.beginPath();
            fwCtx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            fwCtx.fillStyle = p.color; fwCtx.fill();
        } else fwParticles.splice(i, 1);
    });

    sparks.forEach((s, i) => {
        s.vy += 0.2; s.x += s.vx; s.y += s.vy; s.alpha -= 0.05;
        if(s.alpha > 0) {
            fwCtx.globalAlpha = s.alpha; fwCtx.beginPath();
            fwCtx.arc(s.x, s.y, s.size, 0, Math.PI*2);
            fwCtx.fillStyle = "#fff"; fwCtx.fill();
        } else sparks.splice(i, 1);
    });

    shadowCtx.clearRect(0,0,shadowCanvas.width, shadowCanvas.height);
    shadowCtx.fillStyle = 'rgba(0,0,0,0.8)';
    shadowCtx.fillRect(0,0,shadowCanvas.width, shadowCanvas.height);
    shadowCtx.globalCompositeOperation = 'destination-out';
    
    if(giftContainer.style.display !== 'none') {
        const r = giftBox.getBoundingClientRect();
        const grad = shadowCtx.createRadialGradient(r.left+110, r.top+110, 0, r.left+110, r.top+110, 300);
        grad.addColorStop(0, 'white'); grad.addColorStop(1, 'transparent');
        shadowCtx.fillStyle = grad; shadowCtx.beginPath(); shadowCtx.arc(r.left+110, r.top+110, 300, 0, Math.PI*2); shadowCtx.fill();
    }
    shadowCtx.globalCompositeOperation = 'source-over';
}
animate();
  
