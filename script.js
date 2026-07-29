/* ==========================================================================
   Guru Purnima Master Interactive & Audio Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initPetalAndSparkleCanvas();
    initInteractivity();
    initAudioEngine();
});

/* --------------------------------------------------------------------------
   1. Flower Petal & Golden Sparkle Cursor Canvas System
   -------------------------------------------------------------------------- */
function initPetalAndSparkleCanvas() {
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
    const sparkles = [];
    const colors = [
        'rgba(255, 119, 0, 0.75)',   /* Saffron */
        'rgba(255, 215, 0, 0.85)',   /* Gold */
        'rgba(225, 29, 72, 0.7)',    /* Crimson Rose */
        'rgba(255, 182, 193, 0.65)'  /* Soft Pink */
    ];

    /* Falling Petals */
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

            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.quadraticCurveTo(this.size, 0, 0, this.size);
            ctx.quadraticCurveTo(-this.size, 0, 0, -this.size);
            ctx.fill();

            ctx.restore();
        }
    }

    /* Golden Mouse Cursor Sparkles */
    class Sparkle {
        constructor(x, y) {
            this.x = x + (Math.random() * 12 - 6);
            this.y = y + (Math.random() * 12 - 6);
            this.size = Math.random() * 3.5 + 1.5;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * -1.2 - 0.3;
            this.opacity = 1;
            this.color = Math.random() > 0.4 ? '#FFD700' : '#FF9E44';
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity -= 0.025;
        }

        draw() {
            if (this.opacity <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#FFD700';

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    /* Track mouse for sparkle trail */
    document.addEventListener('mousemove', (e) => {
        for (let i = 0; i < 2; i++) {
            sparkles.push(new Sparkle(e.clientX, e.clientY));
        }
        if (sparkles.length > 80) sparkles.splice(0, sparkles.length - 80);
    });

    /* Spawn ambient petals */
    for (let i = 0; i < 45; i++) {
        const p = new Particle();
        p.y = Math.random() * height;
        particles.push(p);
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        /* Render Petals */
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        /* Render Sparkles */
        for (let i = sparkles.length - 1; i >= 0; i--) {
            const s = sparkles[i];
            s.update();
            s.draw();
            if (s.opacity <= 0) sparkles.splice(i, 1);
        }

        requestAnimationFrame(animate);
    }

    animate();

    window.burstPetals = function(count = 50) {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(true));
        }
        if (particles.length > 150) particles.splice(0, particles.length - 150);
    };
}

/* --------------------------------------------------------------------------
   2. Web Audio Synthesizer (Serene Ambient Flute & Tanpura Drone)
   -------------------------------------------------------------------------- */
function initAudioEngine() {
    const btnAudio = document.getElementById('btnAudioToggle');
    const audioIcon = document.getElementById('audioIcon');
    const audioLabel = document.getElementById('audioLabel');

    let audioCtx = null;
    let isPlaying = false;
    let masterGain = null;
    let intervals = [];

    function createFluteSynthesizer() {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);

        const frequencies = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

        function playFluteNote(freq, duration = 4) {
            if (!isPlaying || !audioCtx) return;

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, audioCtx.currentTime);

            const now = audioCtx.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.2, now + 1.2);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);

            osc.start(now);
            osc.stop(now + duration);
        }

        const droneOsc = audioCtx.createOscillator();
        const droneGain = audioCtx.createGain();
        droneOsc.type = 'triangle';
        droneOsc.frequency.setValueAtTime(130.81, audioCtx.currentTime); // C3
        droneGain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        droneOsc.connect(droneGain);
        droneGain.connect(masterGain);
        droneOsc.start();

        function loopMelody() {
            if (!isPlaying) return;
            const randomFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
            playFluteNote(randomFreq, 3.5 + Math.random() * 2);
        }

        intervals.push(setInterval(loopMelody, 2200));
    }

    if (btnAudio) {
        btnAudio.addEventListener('click', () => {
            if (!isPlaying) {
                isPlaying = true;
                if (!audioCtx) createFluteSynthesizer();
                else if (audioCtx.state === 'suspended') audioCtx.resume();
                
                audioIcon.innerText = '🔊';
                audioLabel.innerText = 'Mute Music';
                showFloatingNotice('🎵 Playing Serene Flute & Tanpura Ambient Music');
            } else {
                isPlaying = false;
                if (audioCtx) audioCtx.suspend();
                intervals.forEach(clearInterval);
                audioIcon.innerText = '🎵';
                audioLabel.innerText = 'Play Ambient Music';
                showFloatingNotice('🔇 Music Paused');
            }
        });
    }
}

/* --------------------------------------------------------------------------
   3. Personal Messages Modal & Interactive Buttons
   -------------------------------------------------------------------------- */
const personalNotesData = {
    jagruti: {
        name: "Prof. Jagruti Zambare",
        messages: [
            { author: "Mayuresh Nanal", text: "Thank you ma'am for your incredible guidance in research and constant encouragement. Your classes are always deeply insightful!" },
            { author: "Anirudh Kewat", text: "Your insights bring immense clarity to complex concepts. Grateful to have you as our mentor!" },
            { author: "Sujit Kargal", text: "Wishing you happiness and good health on Guru Purnima. Thank you for always guiding us patiently." },
            { author: "Lovekesh Dishwar", text: "Your dedication to academic excellence inspires all of us to strive for greater heights every day." },
            { author: "Sumrit Gajelli", text: "Thank you ma'am for being a steadfast pillar of strength and wisdom throughout our learning journey." },
            { author: "Shalini Rawat", text: "Happy Guru Purnima ma'am! Your guidance and encouragement mean the world to all of us." },
            { author: "Hindavi Tupe", text: "Wishing you a very Happy Guru Purnima ma'am! Thank you for your inspiring teaching and mentorship." }
        ]
    },
    pasupati: {
        name: "Prof. Pasupati Adhimoolam",
        messages: [
            { author: "Mayuresh Nanal", text: "Sir, your leadership and management lessons have shaped our perspective profoundly. Thank you for always pushing us forward!" },
            { author: "Anirudh Kewat", text: "Thank you for instilling discipline, vision, and real-world confidence in us. We honor your mentorship!" },
            { author: "Sujit Kargal", text: "Happy Guru Purnima sir! Your constant guidance and advice are a source of great inspiration." },
            { author: "Lovekesh Dishwar", text: "Grateful for your invaluable support and guidance at Swayam Siddhi College. You are a true role model!" },
            { author: "Sumrit Gajelli", text: "Sir, your strategic vision empowers us to think big and achieve more. Thank you for leading by example." },
            { author: "Shalini Rawat", text: "Wishing you a very Happy Guru Purnima sir! Thank you for your inspiring guidance and dedication." },
            { author: "Hindavi Tupe", text: "Happy Guru Purnima sir! Thank you for your leadership, encouragement, and invaluable mentorship." }
        ]
    },
    marium: {
        name: "Prof. Marium Shaikh",
        messages: [
            { author: "Mayuresh Nanal", text: "Ma'am, your passion for teaching makes every single class engaging and memorable. Thank you for your care!" },
            { author: "Anirudh Kewat", text: "Thank you for your warmth, guidance, and continuous encouragement. You bring out the best in us!" },
            { author: "Sujit Kargal", text: "Happy Guru Purnima ma'am! Thank you for being such an approachable, supportive, and kind mentor." },
            { author: "Lovekesh Dishwar", text: "Your dedication to our growth is deeply appreciated by all of us. Wishing you immense joy!" },
            { author: "Sumrit Gajelli", text: "Thank you ma'am for always believing in our potential and guiding us with immense enthusiasm." },
            { author: "Shalini Rawat", text: "Wishing you joy and success on Guru Purnima ma'am! Thank you for everything you do for us." },
            { author: "Hindavi Tupe", text: "Happy Guru Purnima ma'am! Your patience and dedication make learning a wonderful experience." }
        ]
    }
};

window.openNotesModal = function(guruKey) {
    const data = personalNotesData[guruKey];
    if (!data) return;

    const modal = document.getElementById('notesModal');
    const title = document.getElementById('modalTeacherName');
    const list = document.getElementById('modalMessagesList');

    if (title) title.innerText = data.name;
    if (list) {
        list.innerHTML = data.messages.map(m => `
            <div class="modal-msg-card">
                <div class="modal-msg-author">💌 From ${m.author}</div>
                <p class="modal-msg-body">"${m.text}"</p>
            </div>
        `).join('');
    }

    if (modal) modal.classList.add('active');
    if (window.burstPetals) window.burstPetals(30);
};

window.closeNotesModal = function() {
    const modal = document.getElementById('notesModal');
    if (modal) modal.classList.remove('active');
};

document.addEventListener('click', (e) => {
    const modal = document.getElementById('notesModal');
    if (modal && e.target === modal) {
        closeNotesModal();
    }
});

/* --------------------------------------------------------------------------
   4. Interactivity & Respect Counter
   -------------------------------------------------------------------------- */
function initInteractivity() {
    const btnShower = document.getElementById('btnShowerFlowers');
    if (btnShower) {
        btnShower.addEventListener('click', () => {
            if (window.burstPetals) window.burstPetals(60);
            showFloatingNotice('🌸 Flower Tribute Offered to Our Teachers!');
        });
    }

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

    if (window.burstPetals) window.burstPetals(30);
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
        bottom: '80px',
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
