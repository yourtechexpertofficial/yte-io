/* ============================================================
   COSVIRE — Main JavaScript v3
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
    ['index.html#forge',     'Forge'],
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

/* ── 8. The Forge — idea → product synthesizer ───────────── */
(function () {
  const machine  = document.getElementById('forgeMachine');
  const input    = document.getElementById('forgeInput');
  const btn      = document.getElementById('forgeRun');
  const state    = document.getElementById('forgeState');
  const log      = document.getElementById('forgeLog');
  const card     = document.getElementById('forgeCard');
  const cardName = document.getElementById('forgeCardName');
  const cardSrc  = document.getElementById('forgeCardSrc');
  const cardTime = document.getElementById('forgeCardTime');
  const nodes    = document.querySelectorAll('.forge__node');
  const links    = document.querySelectorAll('.forge__link');
  if (!machine || !input || !nodes.length) return;

  const DEMO_IDEA = 'smart recipe planner';
  const delay = ms => new Promise(r => setTimeout(r, ms));

  const addLog = (text, ok) => {
    const line = document.createElement('span');
    line.textContent = text;
    if (ok) line.className = 'ok';
    log.appendChild(line);
    while (log.children.length > 6) log.removeChild(log.firstChild);
  };

  const STOP = new Set(['a','an','the','for','of','to','and','my','our','your','app',
    'application','smart','new','better','idea','with','that','some','kind','like',
    'ai','web','mobile','online','digital','simple','easy']);
  const productName = idea => {
    const words = idea.toLowerCase().replace(/[^a-z0-9 ]/g, '')
      .split(/\s+/).filter(w => w && !STOP.has(w));
    const key = words[0] || 'spark';
    return 'Cosvire ' + key.charAt(0).toUpperCase() + key.slice(1);
  };

  const STAGES = [
    { status: 'shaping…',   logs: ['> idea received — parsing concept', '> mapping the problem space'] },
    { status: 'building…',  logs: ['> scaffolding architecture', '> compiling interface'] },
    { status: 'deploying…', logs: ['> provisioning deploy target', '> running smoke tests'] },
  ];

  let running = false;
  const run = async ideaRaw => {
    if (running) return;
    running = true;
    const idea = (ideaRaw || '').trim().slice(0, 60) || DEMO_IDEA;

    card.classList.remove('show');
    log.innerHTML = '';
    nodes.forEach(n => {
      n.classList.remove('active', 'done');
      n.querySelector('.forge__node-status').textContent = 'standby';
    });
    links.forEach(l => l.classList.remove('active'));
    state.textContent = 'FORGING';
    state.classList.add('on');

    addLog('> forge start: "' + idea + '"');
    await delay(550);

    for (let i = 0; i < nodes.length; i++) {
      nodes[i].classList.add('active');
      nodes[i].querySelector('.forge__node-status').textContent = STAGES[i].status;
      for (const line of STAGES[i].logs) {
        addLog(line);
        await delay(520);
      }
      nodes[i].classList.remove('active');
      nodes[i].classList.add('done');
      nodes[i].querySelector('.forge__node-status').textContent = '✓ done';
      if (links[i]) links[i].classList.add('active');
      await delay(240);
    }

    const name = productName(idea);
    const secs = (1.8 + (idea.length % 23) / 10).toFixed(1);
    cardName.textContent = name;
    cardSrc.textContent  = 'forged from: "' + idea + '"';
    cardTime.textContent = secs + 's build';
    card.classList.add('show');
    addLog('✓ shipped: ' + name + ' — hello, world', true);
    state.textContent = 'SHIPPED';
    await delay(700);
    state.classList.remove('on');
    running = false;
  };

  btn?.addEventListener('click', () => run(input.value));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') run(input.value); });

  /* Auto-demo once when the machine scrolls into view */
  let auto = false;
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || auto) return;
    auto = true;
    io.disconnect();
    setTimeout(() => { if (!running && !input.value) run(DEMO_IDEA); }, 700);
  }, { threshold: 0.35 });
  io.observe(machine);
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
