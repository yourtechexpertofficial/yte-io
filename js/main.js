/* ============================================================
   COSVIRE — Main JavaScript v2
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
  const btn = document.getElementById('hamburger');
  if (!btn) return;
  const menu = document.createElement('div');
  menu.id = 'mobileMenu';
  const links = [
    ['index.html#ecosystem', 'Ecosystem'],
    ['index.html#products',  'Products'],
    ['index.html#vision',    'Vision'],
    ['about.html',           'About'],
    ['blog.html',            'Blog'],
    ['contact.html',         'Contact'],
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
  let W, H;
  const mouse = { x: null, y: null };
  const SPEED  = 0.36;
  const COUNT  = 100;
  const LINK_D = 130;

  class P {
    constructor() { this.init(); }
    init() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * SPEED;
      this.vy = (Math.random() - 0.5) * SPEED;
      this.r  = Math.random() * 1.5 + 0.4;
      this.a  = Math.random() * 0.5 + 0.15;
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
      this.vx *= 0.992; this.vy *= 0.992;
      this.x += this.vx; this.y += this.vy;
      if (this.x < -10)    this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10)    this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99,102,241,${this.a})`;
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
          ctx.strokeStyle = `rgba(99,102,241,${(1 - d / LINK_D) * 0.22})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  };
  resize();
  particles = Array.from({ length: COUNT }, () => new P());
  frame();
  window.addEventListener('resize', () => { resize(); particles.forEach(p => p.init()); }, { passive: true });
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
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

/* ── 7. Card spotlight glow ──────────────────────────────── */
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
      const href = l.getAttribute('href');
      const active = href === '#' + current || href === 'index.html#' + current;
      l.style.color = active ? 'var(--indigo)' : '';
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}());

/* ── 9. Egg Hatching Animation ───────────────────────────── */
(function () {
  const wrap  = document.getElementById('hatchEgg');
  const chick = document.getElementById('hatchChick');
  const glow  = document.getElementById('hatchGlow');
  const burst = document.getElementById('hatchBurst');
  const hint  = document.getElementById('hatchHint');
  const steps = document.querySelectorAll('.hatch__step');
  const eggInnerGlow = document.querySelector('.egg-glow-inner');

  if (!wrap || !chick) return;

  const setStep = n => steps.forEach((s, i) => s.classList.toggle('active', i <= n));

  const spawnBurst = () => {
    if (!burst) return;
    const colors = ['#06b6d4', '#6366f1', '#a855f7', '#22c55e', '#f59e0b', '#ec4899'];
    for (let i = 0; i < 14; i++) {
      const p   = document.createElement('div');
      p.className = 'burst-particle';
      const angle  = (i / 14) * 360;
      const dist   = 55 + Math.random() * 50;
      const bx = (Math.cos(angle * Math.PI / 180) * dist).toFixed(1) + 'px';
      const by = (Math.sin(angle * Math.PI / 180) * dist).toFixed(1) + 'px';
      p.style.setProperty('--bx', bx);
      p.style.setProperty('--by', by);
      p.style.background = colors[i % colors.length];
      const size = (4 + Math.random() * 7).toFixed(1) + 'px';
      p.style.width  = size;
      p.style.height = size;
      burst.appendChild(p);
      setTimeout(() => p.remove(), 750);
    }
  };

  let triggered = false;

  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || triggered) return;
    triggered = true;
    io.disconnect();

    setStep(0);

    /* Stage 1 — wobble (triggers at intersection) */
    setTimeout(() => {
      wrap.classList.remove('floating');
      wrap.classList.add('wobbling');
      setStep(1);
    }, 300);

    /* Stage 2 — crack lines appear + inner glow */
    setTimeout(() => {
      wrap.classList.remove('wobbling');
      wrap.classList.add('cracking');
      if (glow) glow.classList.add('active');
      if (eggInnerGlow) eggInnerGlow.style.opacity = '1';
      setStep(2);
    }, 1600);

    /* Stage 3 — hatch: shells split, chick rises */
    setTimeout(() => {
      wrap.classList.add('hatched');
      spawnBurst();
      if (hint) hint.classList.add('hidden');
      setStep(3);

      /* Slight delay before chick rise so shell flies first */
      setTimeout(() => {
        chick.classList.add('rising');
      }, 280);

      /* After rise animation, switch to bounce loop */
      setTimeout(() => {
        chick.classList.remove('rising');
        chick.style.transform = 'translateX(-50%) translateY(0) scale(1)';
        chick.style.opacity   = '1';
        chick.classList.add('bouncing');
      }, 280 + 1100);

    }, 3000);

  }, { threshold: 0.5 });

  io.observe(wrap);
}());

/* ── 10. Legal tabs ──────────────────────────────────────── */
(function () {
  const tabs = document.querySelectorAll('.legal-tab');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.legal-doc').forEach(d => d.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}());

/* ── 11. Blog filters ────────────────────────────────────── */
(function () {
  const filters = document.querySelectorAll('.blog-filter');
  if (!filters.length) return;
  filters.forEach(f => {
    f.addEventListener('click', () => {
      filters.forEach(x => x.classList.remove('active'));
      f.classList.add('active');
    });
  });
}());
