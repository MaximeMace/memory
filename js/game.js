const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let groundY;
const slingshot = { x: 150, y: 0 };
const bird = { x: 0, y: 0, r: 20, vx: 0, vy: 0, static: true };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    groundY = canvas.height - 20;
    slingshot.y = groundY - 60;
    if (bird.static) {
        bird.x = slingshot.x;
        bird.y = slingshot.y;
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let levels = [];
let currentLevel = 0;
let isDragging = false;
let boxes = [];

function loadLevel(index) {
    currentLevel = index;
    const level = levels[index];
    boxes = level.boxes.map((b) => ({ ...b }));
    bird.static = true;
    bird.x = slingshot.x;
    bird.y = slingshot.y;
}

fetch('./levels/levels.json')
    .then((res) => res.json())
    .then((data) => {
        levels = data;
        loadLevel(0);
        loop();
    });

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function startDrag(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (distance(x, y, bird.x, bird.y) <= bird.r && bird.static) {
        isDragging = true;
    }
}

function doDrag(e) {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const maxDist = 100;
    const angle = Math.atan2(y - slingshot.y, x - slingshot.x);
    let dist = distance(x, y, slingshot.x, slingshot.y);
    dist = Math.min(dist, maxDist);
    bird.x = slingshot.x + Math.cos(angle) * dist;
    bird.y = slingshot.y + Math.sin(angle) * dist;
}

function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    const dx = slingshot.x - bird.x;
    const dy = slingshot.y - bird.y;
    bird.static = false;
    bird.vx = dx * 0.2;
    bird.vy = dy * 0.2;
}

function update() {
    if (!bird.static) {
        bird.vy += 0.5; // gravity
        bird.x += bird.vx;
        bird.y += bird.vy;

        // ground collision
        if (bird.y + bird.r > groundY) {
            bird.y = groundY - bird.r;
            bird.vy *= -0.6;
            bird.vx *= 0.8;
            if (Math.abs(bird.vy) < 0.1) {
                bird.vy = 0;
            }
            if (Math.abs(bird.vx) < 0.1) {
                bird.vx = 0;
            }
            if (bird.vx === 0 && bird.vy === 0) {
                bird.static = true;
                bird.x = slingshot.x;
                bird.y = slingshot.y;
            }
        }

        // box collision
        boxes = boxes.filter((box) => {
            const hit =
                bird.x + bird.r > box.x &&
                bird.x - bird.r < box.x + box.w &&
                bird.y + bird.r > box.y &&
                bird.y - bird.r < box.y + box.h;
            return !hit;
        });
        if (boxes.length === 0 && currentLevel < levels.length - 1) {
            loadLevel(currentLevel + 1);
        }
    }
}

function draw() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#1E90FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ground
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // boxes
    ctx.fillStyle = '#8B4513';
    boxes.forEach((box) => {
        ctx.fillRect(box.x, box.y, box.w, box.h);
    });

    // slingshot rubber
    if (isDragging) {
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(slingshot.x, slingshot.y);
        ctx.lineTo(bird.x, bird.y);
        ctx.stroke();
    }

    // bird
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
    ctx.fill();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', doDrag);
window.addEventListener('mouseup', endDrag);
