/* ============================================================
   COSVIRE — Main JavaScript
   Particle canvas · scroll reveals · counters · interactions
   ============================================================ */
'use strict';

/* ── 1. Navbar scroll ────────────────────────────────────── */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}());

/* ── 2. Hamburger / Mobile menu ──────────────────────────── */
(function () {
  const btn  = document.getElementById('hamburger');
  if (!btn) return;

  // Inject mobile menu overlay
  const menu = document.createElement('div');
  menu.id = 'mobileMenu';
  const links = [
    ['#ecosystem','Ecosystem'],
    ['#products','Products'],
    ['#vision','Vision'],
    ['#contact','Contact'],
  ];
  links.forEach(([href, label]) => {
    const a = document.createElement('a');
    a.href = href; a.textContent = label;
    menu.appendChild(a);
  });
  document.body.appendChild(menu);

  const close = () => {
    btn.classList.remove('open');
    menu.classList.remove('open');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}());

/* ── 3. Smooth scrolling ─────────────────────────────────── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('nav')?.offsetHeight || 0;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navH,
        behavior: 'smooth',
      });
    });
  });
}());

/* ── 4. Particle Canvas ──────────────────────────────────── */
(function () {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, rafId;
  const mouse = { x: null, y: null };
  const SPEED  = 0.38;
  const COUNT  = 110;
  const LINK_D = 130;

  class P {
    constructor() { this.init(); }
    init() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * SPEED;
      this.vy = (Math.random() - 0.5) * SPEED;
      this.r  = Math.random() * 1.5 + 0.4;
      this.a  = Math.random() * 0.55 + 0.15;
    }
    update() {
      if (mouse.x !== null) {
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const d  = Math.hypot(dx, dy);
        if (d < 100) {
          const f = (100 - d) / 100;
          this.vx += (dx / d) * f * 0.07;
          this.vy += (dy / d) * f * 0.07;
        }
      }
      const spd = Math.hypot(this.vx, this.vy);
      if (spd > SPEED * 2.8) {
        this.vx = (this.vx / spd) * SPEED * 2.8;
        this.vy = (this.vy / spd) * SPEED * 2.8;
      }
      this.vx *= 0.992;
      this.vy *= 0.992;
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,245,212,${this.a})`;
      ctx.fill();
    }
  }

  let particles = [];

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };

  const frame = () => {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < LINK_D) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,245,212,${(1 - d / LINK_D) * 0.28})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
    rafId = requestAnimationFrame(frame);
  };

  resize();
  particles = Array.from({ length: COUNT }, () => new P());
  frame();

  window.addEventListener('resize', () => {
    resize();
    particles.forEach(p => p.init());
  }, { passive: true });

  canvas.addEventListener('mousemove', e => {
    const r  = canvas.getBoundingClientRect();
    mouse.x  = e.clientX - r.left;
    mouse.y  = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
}());

/* ── 5. Scroll Reveal ────────────────────────────────────── */
(function () {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = e.target.dataset.delay ? parseInt(e.target.dataset.delay, 10) : 0;
      setTimeout(() => e.target.classList.add('is-visible'), delay);
      io.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => io.observe(el));
}());

/* ── 6. Counter Animation ────────────────────────────────── */
(function () {
  const nums = document.querySelectorAll('[data-target]');
  if (!nums.length) return;

  const easeOut = t => 1 - (1 - t) ** 3;

  const animate = el => {
    const end = parseInt(el.dataset.target, 10);
    const dur = 1400;
    const t0  = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(easeOut(p) * end);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      animate(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.5 });

  nums.forEach(el => io.observe(el));
}());

/* ── 7. Card spotlight (mouse glow) ─────────────────────── */
(function () {
  document.querySelectorAll('.card, .product-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top)  + 'px');
    });
  });
}());

/* ── 8. Active nav link highlighting ─────────────────────── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav__link');
  if (!sections.length || !links.length) return;

  const onScroll = () => {
    const y = window.scrollY + 120;
    let current = '';
    sections.forEach(s => { if (s.offsetTop <= y) current = s.id; });
    links.forEach(l => {
      const active = l.getAttribute('href') === '#' + current;
      l.style.color = active ? 'var(--cyan)' : '';
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}());
