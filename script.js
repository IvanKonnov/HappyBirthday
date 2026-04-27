(function () {
    // ---------- ЭЛЕМЕНТЫ ----------
    const bgCanvas = document.getElementById('backgroundCanvas');
    const bgCtx = bgCanvas.getContext('2d');

    const star = document.getElementById('magicStar');
    const nameInput = document.getElementById('nameInput');
    const greetingCard = document.getElementById('greetingCard');
    const greetingText = document.getElementById('greetingText');
    const subMessage = document.getElementById('subMessage');
    const restartHint = document.getElementById('restartHint');
    const rings = [
        document.getElementById('ring1'),
        document.getElementById('ring2'),
        document.getElementById('ring3')
    ];

    let isLit = false;
    let bgParticles = [];
    let width, height;

    // ---------- ФОНОВЫЕ ЧАСТИЦЫ ----------
    class BackgroundParticle {
        constructor() {
            this.reset();
            this.y = Math.random() * height;
        }
        reset() {
            this.x = Math.random() * width;
            this.y = -10;
            this.radius = Math.random() * 2.2 + 0.8;
            this.speedY = 0.3 + Math.random() * 1.4;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.8 + 0.2;
            const hue = Math.random() < 0.7 ? (40 + Math.random() * 20) : (220 + Math.random() * 40);
            this.color = `hsla(${hue}, 80%, 75%, ${this.opacity})`;
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            if (this.y > height + 15 || this.x < -15 || this.x > width + 15) {
                this.reset();
                this.y = -10;
            }
        }
        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(255,220,150,0.7)';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    function initBackground() {
        bgParticles = [];
        const particleCount = Math.min(120, Math.floor(window.innerWidth * 0.25));
        for (let i = 0; i < particleCount; i++) {
            bgParticles.push(new BackgroundParticle());
        }
    }

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        bgCanvas.width = width;
        bgCanvas.height = height;
        initBackground();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function animateBackground() {
        bgCtx.clearRect(0, 0, width, height);
        bgParticles.forEach(p => {
            p.update();
            p.draw(bgCtx);
        });
        requestAnimationFrame(animateBackground);
    }
    animateBackground();

    // ---------- ФЕЙЕРВЕРК ----------
    const fwCanvas = document.createElement('canvas');
    fwCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:20;';
    document.body.appendChild(fwCanvas);
    const fwCtx = fwCanvas.getContext('2d');

    let fwParticles = [];
    let fwAnimationId = null;

    function resizeFwCanvas() {
        fwCanvas.width = window.innerWidth;
        fwCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeFwCanvas);
    resizeFwCanvas();

    class FireworkParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            const hue = Math.random() * 30 + 25;
            this.color = `hsl(${hue}, 85%, 65%)`;
            this.radius = Math.random() * 3.5 + 1.8;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2.5;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.alpha = 1;
            this.decay = 0.008 + Math.random() * 0.025;
            this.gravity = 0.045;
        }
        update() {
            this.vx *= 0.985;
            this.vy *= 0.985;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
        }
        draw(ctx) {
            if (this.alpha <= 0.02) return;
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 12;
            ctx.shadowColor = this.color;
            ctx.fill();
        }
    }

    function spawnFirework(x, y, count = 70) {
        for (let i = 0; i < count; i++) {
            fwParticles.push(new FireworkParticle(x, y));
        }
    }

    function animateFireworks() {
        if (fwParticles.length === 0 && !isLit) {
            fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
            fwAnimationId = null;
            return;
        }
        fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
        for (let i = fwParticles.length - 1; i >= 0; i--) {
            const p = fwParticles[i];
            p.update();
            p.draw(fwCtx);
            if (p.alpha <= 0.02 || p.y > fwCanvas.height + 30 || p.x < -30 || p.x > fwCanvas.width + 30) {
                fwParticles.splice(i, 1);
            }
        }
        fwAnimationId = requestAnimationFrame(animateFireworks);
    }

    function startFireworksIfNeeded() {
        if (!fwAnimationId) {
            fwAnimationId = requestAnimationFrame(animateFireworks);
        }
    }

    // ---------- ЛОГИКА ПОЗДРАВЛЕНИЯ ----------
    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, function (m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
        });
    }

    function updateGreeting(name) {
        const cleanName = name.trim();
        const displayName = cleanName || 'Друг';

        greetingText.innerHTML = `С Днём Рождения, <span class="highlight-name">${escapeHTML(displayName)}</span>!`;

        const messages = [
            'Пусть каждый день сияет, как эта звезда ✨',
            'Ты — настоящее чудо этой Вселенной 🌌',
            'Загадывай желание! Звёзды слушают 🌠',
            'Сегодня твой день, и космос танцует для тебя 🪐',
            'Сияй ярче всех галактик! 💫'
        ];
        subMessage.textContent = messages[Math.floor(Math.random() * messages.length)];
    }

    function lightStar() {
        if (isLit) {
            const rect = star.getBoundingClientRect();
            spawnFirework(rect.left + rect.width / 2, rect.top + rect.height / 2, 55);
            startFireworksIfNeeded();
            return;
        }

        isLit = true;
        star.classList.add('lit');
        rings.forEach(r => r.classList.add('show'));
        greetingCard.classList.add('show');
        updateGreeting(nameInput.value.trim());
        restartHint.textContent = '🌠 Нажми на звезду ещё — больше волшебства! (двойной клик — сброс)';

        const rect = star.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        spawnFirework(cx, cy, 130);
        setTimeout(() => { if (isLit) spawnFirework(cx - 70, cy - 40, 55); }, 180);
        setTimeout(() => { if (isLit) spawnFirework(cx + 80, cy - 30, 55); }, 350);
        startFireworksIfNeeded();

        const interval = setInterval(() => {
            if (!isLit) { clearInterval(interval); return; }
            const r = star.getBoundingClientRect();
            spawnFirework(r.left + r.width / 2, r.top + r.height / 2, 30);
        }, 2800);
        star.dataset.interval = interval;
    }

    function resetAll() {
        isLit = false;
        star.classList.remove('lit');
        rings.forEach(r => r.classList.remove('show'));
        greetingCard.classList.remove('show');
        restartHint.textContent = '';
        if (star.dataset.interval) {
            clearInterval(Number(star.dataset.interval));
            delete star.dataset.interval;
        }
        fwParticles = [];
    }

    // ---------- СОБЫТИЯ ----------
    star.addEventListener('click', lightStar);
    star.addEventListener('dblclick', (e) => { e.preventDefault(); resetAll(); });

    let touchTimer;
    star.addEventListener('touchstart', (e) => {
        touchTimer = setTimeout(() => { resetAll(); e.preventDefault(); }, 750);
    });
    star.addEventListener('touchend', () => clearTimeout(touchTimer));
    star.addEventListener('touchmove', () => clearTimeout(touchTimer));

    nameInput.addEventListener('input', () => {
        if (isLit) updateGreeting(nameInput.value.trim());
    });
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); lightStar(); }
    });

    // Инициализация
    updateGreeting('');
})();