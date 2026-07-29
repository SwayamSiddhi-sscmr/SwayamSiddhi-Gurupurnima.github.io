/* ==========================================================================
   Guru Purnima Interactive Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initPetalCanvas();
    initInteractivity();
});

/* --------------------------------------------------------------------------
   1. Flower Petal & Gold Dust Particle System
   -------------------------------------------------------------------------- */
function initPetalCanvas() {
    const canvas = document.getElementById('petalCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const colors = [
        'rgba(255, 119, 0, 0.75)',   /* Saffron */
        'rgba(255, 215, 0, 0.85)',   /* Gold */
        'rgba(225, 29, 72, 0.7)',    /* Crimson Rose */
        'rgba(255, 182, 193, 0.65)'  /* Soft Pink */
    ];

    class Particle {
        constructor(isBurst = false) {
            this.reset(isBurst);
        }

        reset(isBurst = false) {
            this.x = Math.random() * width;
            this.y = isBurst ? Math.random() * (height * 0.3) : -20;
            this.size = Math.random() * 8 + 4;
            this.speedY = Math.random() * 1.8 + 0.8;
            this.speedX = Math.random() * 1.2 - 0.6;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 2 - 1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.7 + 0.3;
        }

        update() {
            this.y += this.speedY;
            this.x += Math.sin(this.y * 0.01) + this.speedX;
            this.rotation += this.rotationSpeed;

            if (this.y > height + 20) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;

            /* Draw Petal Shape */
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.quadraticCurveTo(this.size, 0, 0, this.size);
            ctx.quadraticCurveTo(-this.size, 0, 0, -this.size);
            ctx.fill();

            ctx.restore();
        }
    }

    /* Initialize 45 ambient petals */
    for (let i = 0; i < 45; i++) {
        const p = new Particle();
        p.y = Math.random() * height;
        particles.push(p);
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();

    /* Global burst function */
    window.burstPetals = function(count = 50) {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(true));
        }
        /* Cap particle array size */
        if (particles.length > 150) {
            particles.splice(0, particles.length - 150);
        }
    };
}

/* --------------------------------------------------------------------------
   2. Interactive Features
   -------------------------------------------------------------------------- */
function initInteractivity() {
    /* Flower Shower Button */
    const btnShower = document.getElementById('btnShowerFlowers');
    if (btnShower) {
        btnShower.addEventListener('click', () => {
            if (window.burstPetals) window.burstPetals(60);
            showFloatingNotice('🌸 Flower Tribute Offered to Our Teachers!');
        });
    }

    /* Diya Lighting Toggle */
    const btnDiya = document.getElementById('btnToggleDiya');
    const diyaContainer = document.getElementById('diyaContainer');

    function triggerDiyaEffect() {
        const flameGlow = document.querySelector('.flame-glow');
        if (flameGlow) {
            flameGlow.style.transform = 'translateX(-50%) scale(1.8)';
            flameGlow.style.opacity = '1';
            setTimeout(() => {
                flameGlow.style.transform = 'translateX(-50%) scale(1)';
            }, 1200);
        }
        if (window.burstPetals) window.burstPetals(40);
        showFloatingNotice('🪔 Sacred Flame Amplified with Deep Reverence!');
    }

    if (btnDiya) btnDiya.addEventListener('click', triggerDiyaEffect);
    if (diyaContainer) diyaContainer.addEventListener('click', triggerDiyaEffect);
}

/* --------------------------------------------------------------------------
   3. Respect Counter & Floating Toast
   -------------------------------------------------------------------------- */
window.offerGratitude = function(guruName) {
    let id = '';
    if (guruName.includes('Jagruti')) id = 'count-jagruti';
    else if (guruName.includes('Pasupati')) id = 'count-pasupati';
    else if (guruName.includes('Marium')) id = 'count-marium';

    const countEl = document.getElementById(id);
    if (countEl) {
        let current = parseInt(countEl.innerText) || 108;
        countEl.innerText = current + 1;
    }

    if (window.burstPetals) window.burstPetals(25);
    showFloatingNotice(`❤️ Offered Reverence & Respect to ${guruName}!`);
};

function showFloatingNotice(msg) {
    const existing = document.querySelector('.floating-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'floating-toast';
    toast.innerText = msg;
    
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #FF9E44, #D4AF37)',
        color: '#070a12',
        padding: '0.8rem 1.6rem',
        borderRadius: '30px',
        fontWeight: '600',
        fontSize: '0.92rem',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        zIndex: '1000',
        animation: 'fadeIn 0.4s ease'
    });

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}
