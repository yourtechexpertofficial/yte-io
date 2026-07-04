/* ============================================================
   COSVIRE — Main JavaScript v3 "Incubator"
   ============================================================ */
'use strict';

/* ── 1. Navbar scroll ────────────────────────────────────── */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}());

/* ── 2. Hamburger / mobile menu ──────────────────────────── */
(function () {
  const btn = document.getElementById('hamburger');
  if (!btn) return;
  const menu = document.createElement('div');
  menu.id = 'mobileMenu';
  [
    ['index.html#ecosystem', 'Ecosystem'],
    ['index.html#incubator', 'Incubator'],
    ['index.html#products',  'Products'],
    ['about.html',           'About'],
    ['blog.html',            'Journal'],
    ['contact.html',         'Contact'],
    ['login.html',           'Sign In'],
  ].forEach(([href, label]) => {
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

/* ── 3. Smooth scrolling for same-page anchors ───────────── */
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

/* ── 4. Orbit canvas (hero) ──────────────────────────────── */
(function () {
  const canvas = document.getElementById('orbitCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W, H, cx, cy;

  const RINGS = [
    { r: 0.22, tilt: 0.42, speed: 0.00042, dots: 2, color: '215,255,77'  },
    { r: 0.34, tilt: 0.40, speed: -0.00030, dots: 3, color: '139,124,248' },
    { r: 0.46, tilt: 0.38, speed: 0.00020, dots: 4, color: '235,233,226' },
  ];
  const offsets = RINGS.map((ring, i) =>
    Array.from({ length: ring.dots }, (_, k) => (k / ring.dots) * Math.PI * 2 + i)
  );

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2; cy = H / 2;
  };

  const frame = now => {
    ctx.clearRect(0, 0, W, H);
    const base = Math.min(W, H);

    // Core
    const coreR = base * 0.055;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3.4);
    grad.addColorStop(0, 'rgba(215,255,77,0.5)');
    grad.addColorStop(0.35, 'rgba(215,255,77,0.12)');
    grad.addColorStop(1, 'rgba(215,255,77,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(215,255,77,0.9)';
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 0.45, 0, Math.PI * 2);
    ctx.fill();

    RINGS.forEach((ring, i) => {
      const rx = base * ring.r;
      const ry = rx * ring.tilt;

      ctx.strokeStyle = `rgba(${ring.color},0.16)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, -0.28, 0, Math.PI * 2);
      ctx.stroke();

      offsets[i].forEach(off => {
        const a = now * ring.speed + off;
        // point on tilted ellipse
        const px0 = Math.cos(a) * rx;
        const py0 = Math.sin(a) * ry;
        const px = cx + px0 * Math.cos(-0.28) - py0 * Math.sin(-0.28);
        const py = cy + px0 * Math.sin(-0.28) + py0 * Math.cos(-0.28);
        const depth = (Math.sin(a) + 1) / 2;           // fake depth
        const size = 2 + depth * 2.6;
        ctx.fillStyle = `rgba(${ring.color},${0.35 + depth * 0.6})`;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    requestAnimationFrame(frame);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  requestAnimationFrame(frame);
}());

/* ── 5. Scroll reveal ────────────────────────────────────── */
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

/* ── 6. Counters ─────────────────────────────────────────── */
(function () {
  const nums = document.querySelectorAll('[data-target]');
  if (!nums.length) return;
  const easeOut = t => 1 - (1 - t) ** 3;
  const animate = el => {
    const end = parseInt(el.dataset.target, 10);
    const dur = 1500;
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

/* ── 7. Marquee: duplicate track for seamless loop ───────── */
(function () {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;
  track.innerHTML += track.innerHTML;
}());

/* ── 8. Egg hatch sequence ───────────────────────────────── */
(function () {
  const scene  = document.getElementById('hatchScene');
  const wrap   = document.getElementById('hatchEgg');
  const mark   = document.getElementById('hatchMark');
  const glow   = document.getElementById('hatchGlow');
  const flash  = document.getElementById('hatchFlash');
  const beam   = document.getElementById('hatchBeam');
  const burst  = document.getElementById('hatchBurst');
  const shards = document.getElementById('hatchShards');
  const stages = document.querySelectorAll('.hatch__stage');
  const eggInnerGlow = document.querySelector('.egg-inner-glow');
  if (!wrap || !mark) return;

  const setStage = n => {
    stages.forEach(s => {
      const idx = parseInt(s.dataset.stage, 10);
      s.classList.toggle('done', idx < n);
      s.classList.toggle('now',  idx === n);
    });
  };

  /* Shell shatters into flying shards */
  const spawnShards = () => {
    if (!shards) return;
    const cols = ['#f0eee4', '#ddd9cb', '#bcb8a6', '#d7ff4d'];
    for (let i = 0; i < 14; i++) {
      const d = document.createElement('div');
      d.className = 'hatch__shard';
      const a    = (i / 14) * Math.PI * 2 + (i % 3) * 0.17;
      const dist = 85 + ((i * 53) % 75);
      d.style.setProperty('--sx', (Math.cos(a) * dist).toFixed(1) + 'px');
      d.style.setProperty('--sy', (Math.sin(a) * dist * 0.9 - 34).toFixed(1) + 'px');
      d.style.setProperty('--sr', (((i * 97) % 360) - 180) + 'deg');
      const s = 12 + ((i * 29) % 18);
      d.innerHTML = '<svg width="' + s + '" height="' + s + '" viewBox="0 0 20 20">'
        + '<polygon points="1,17 10,1 19,13 12,19" fill="' + cols[i % cols.length] + '"/></svg>';
      shards.appendChild(d);
      setTimeout(() => d.remove(), 1000);
    }
  };

  /* Volt/violet confetti */
  const spawnBurst = () => {
    if (!burst) return;
    const colors = ['#d7ff4d', '#8b7cf8', '#ffb84d', '#ebe9e2'];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'burst-particle';
      const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.4;
      const dist  = 60 + Math.random() * 70;
      p.style.setProperty('--bx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      p.style.setProperty('--by', (Math.sin(angle) * dist * 0.85).toFixed(1) + 'px');
      const size = 4 + Math.random() * 6;
      p.style.width  = size + 'px';
      p.style.height = size + 'px';
      p.style.background = colors[i % colors.length];
      p.style.borderRadius = i % 3 === 0 ? '2px' : '50%';
      burst.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  };

  let triggered = false;
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || triggered) return;
    triggered = true;
    io.disconnect();

    setStage(0);

    /* Stage 1 — heartbeat detected */
    setTimeout(() => {
      wrap.classList.remove('floating');
      wrap.classList.add('beating');
      setStage(1);
    }, 600);

    /* Stage 2 — energy breach: volt cracks + inner glow, heartbeat quickens */
    setTimeout(() => {
      wrap.classList.remove('beating');
      wrap.classList.add('beating--fast', 'cracking');
      scene?.classList.add('live');
      glow?.classList.add('active');
      if (eggInnerGlow) eggInnerGlow.style.opacity = '1';
      setStage(2);
    }, 2100);

    /* Stage 3 — shatter: flash, beam, shards, the mark is born */
    setTimeout(() => {
      wrap.classList.remove('beating--fast');
      wrap.classList.add('gone');
      spawnShards();
      spawnBurst();
      flash?.classList.add('active');
      beam?.classList.add('active');
      setStage(3);
      setTimeout(() => mark.classList.add('rising'), 160);
      setTimeout(() => {
        mark.classList.remove('rising');
        mark.style.transform = 'translateX(-50%)';
        mark.style.opacity = '1';
        mark.classList.add('idle');
        stages.forEach(s => { s.classList.add('done'); s.classList.remove('now'); });
      }, 160 + 1150);
    }, 3700);
  }, { threshold: 0.55 });

  io.observe(wrap);
}());

/* ── 9. Legal tabs ───────────────────────────────────────── */
(function () {
  const tabs = document.querySelectorAll('.legal-tab');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.legal-doc').forEach(d => d.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab)?.classList.add('active');
    });
  });
}());

/* ── 10. Blog filters ────────────────────────────────────── */
(function () {
  const filters = document.querySelectorAll('.blog-filter');
  if (!filters.length) return;
  filters.forEach(f => {
    f.addEventListener('click', () => {
      filters.forEach(x => x.classList.remove('active'));
      f.classList.add('active');
      const cat = f.dataset.cat || 'all';
      document.querySelectorAll('[data-post-cat]').forEach(post => {
        post.style.display =
          cat === 'all' || post.dataset.postCat === cat ? '' : 'none';
      });
    });
  });
}());
