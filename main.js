/* ============================================================
   ADPLIX – Global JavaScript
   Cursor · Particles · Nav · Transitions · Scroll Reveal · Counters
   ============================================================ */

/* ── Custom Cursor ── */
(function initCursor() {
  const outer = document.getElementById('cursor-outer');
  const inner = document.getElementById('cursor-inner');
  if (!outer || !inner) return;

  let mx = 0, my = 0, ox = 0, oy = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function loop() {
    ox += (mx - ox) * 0.14;
    oy += (my - oy) * 0.14;
    outer.style.left = ox + 'px'; outer.style.top = oy + 'px';
    inner.style.left = mx + 'px'; inner.style.top  = my + 'px';
    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('a, button, .btn, .card-hover, input, textarea, select, label')
    .forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
})();

/* ── Particles Canvas ── */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const N = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 12000));

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.r = Math.random() * 1.5 + 0.3;
      this.speed = Math.random() * 0.5 + 0.15;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.dx = (Math.random() - 0.5) * 0.3;
    }
    update() {
      this.y -= this.speed; this.x += this.dx;
      if (this.y < -5) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = '#00d4ff';
      ctx.shadowBlur = 6; ctx.shadowColor = '#00d4ff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < N; i++) particles.push(new Particle());

  // Lines between close particles
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (d < 110) {
          ctx.save();
          ctx.globalAlpha = (1 - d / 110) * 0.12;
          ctx.strokeStyle = '#00d4ff';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawLines();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ── Navbar Scroll Effect ── */
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  // Hamburger
  const ham = document.querySelector('.hamburger');
  const mob = document.querySelector('.mobile-nav');
  if (ham && mob) {
    ham.addEventListener('click', () => {
      ham.classList.toggle('open');
      mob.classList.toggle('open');
      document.body.style.overflow = mob.classList.contains('open') ? 'hidden' : '';
    });
    mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      ham.classList.remove('open'); mob.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }
})();

/* ── Page Transitions ── */
(function initTransitions() {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;

  // Slide out on load
  window.addEventListener('load', () => {
    overlay.classList.add('slide-out');
  });

  // Intercept internal links
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.remove('slide-out');
      overlay.classList.add('slide-in');
      setTimeout(() => { window.location.href = href; }, 580);
    });
  });
})();

/* ── Scroll Reveal ── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('revealed'),
          parseInt(entry.target.dataset.delay || 0));
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

/* ── Stagger Reveals ── */
(function initStagger() {
  document.querySelectorAll('[data-stagger]').forEach(container => {
    const children = container.children;
    Array.from(children).forEach((child, i) => {
      child.classList.add('reveal');
      child.dataset.delay = i * 120;
    });
  });
})();

/* ── Animated Counters ── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const val = target < 10 ? (ease * target).toFixed(1) : Math.floor(ease * target);
        el.textContent = val + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
})();

/* ── Parallax hero element on mouse move ── */
(function initParallax() {
  const layers = document.querySelectorAll('[data-parallax]');
  if (!layers.length) return;
  window.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy;
    layers.forEach(el => {
      const depth = parseFloat(el.dataset.parallax) || 10;
      el.style.transform = `translate(${dx * depth}px, ${dy * depth}px)`;
    });
  });
})();

/* ── Active Nav Link ── */
(function setActiveLink() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });
})();

/* ── Tilt effect on cards ── */
(function initTilt() {
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.03)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)';
    });
  });
})();

/* ── Smooth scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});
