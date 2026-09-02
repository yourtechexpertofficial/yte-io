/* ============================================================
   COSVIRE — v4 · parent company
   ============================================================ */
'use strict';

/* ── 1. Masthead ─────────────────────────────────────────── */
(function () {
  const m = document.getElementById('masthead');
  if (!m) return;
  const on = () => m.classList.toggle('pinned', window.scrollY > 8);
  window.addEventListener('scroll', on, { passive: true });
  on();
}());

/* ── 2. Mobile navigation ────────────────────────────────── */
(function () {
  const burger = document.getElementById('burger');
  if (!burger) return;
  const nav = document.createElement('nav');
  nav.id = 'mobileNav';
  [
    ['index.html#portfolio',    'Portfolio'],
    ['index.html#architecture', 'Architecture'],
    ['index.html#record',       'Record'],
    ['about.html',              'About'],
    ['blog.html',               'Notes'],
    ['contact.html',            'Contact'],
    ['login.html',              'Sign in'],
  ].forEach(([href, label]) => {
    const a = document.createElement('a');
    a.href = href; a.textContent = label;
    nav.appendChild(a);
  });
  document.body.appendChild(nav);
  const close = () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
    document.body.style.overflow = '';
  };
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    nav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}());

/* ── 3. Anchor scrolling ─────────────────────────────────── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      const off = document.getElementById('masthead')?.offsetHeight || 0;
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - off - 6, behavior: 'smooth' });
    });
  });
}());

/* ── 4. Reveal on scroll ─────────────────────────────────── */
(function () {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const d = parseInt(e.target.dataset.delay || '0', 10);
      setTimeout(() => e.target.classList.add('is-visible'), d);
      io.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  items.forEach(el => io.observe(el));
}());

/* ── 5. Counters ─────────────────────────────────────────── */
(function () {
  const nums = document.querySelectorAll('[data-count]');
  if (!nums.length || !('IntersectionObserver' in window)) return;
  const ease = t => 1 - (1 - t) ** 3;
  const run = el => {
    const end = parseInt(el.dataset.count, 10);
    const t0 = performance.now(), dur = 900;
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(ease(p) * end);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.6 });
  nums.forEach(n => io.observe(n));
}());

/* ── 6. Portfolio filtering ──────────────────────────────── */
(function () {
  const filters = document.querySelectorAll('.pf-filter');
  const cards   = document.querySelectorAll('.holding');
  if (!filters.length || !cards.length) return;
  filters.forEach(f => {
    f.addEventListener('click', () => {
      filters.forEach(x => x.classList.remove('active'));
      f.classList.add('active');
      const s = f.dataset.stage;
      cards.forEach(c => {
        c.style.display = (s === 'all' || c.dataset.stage === s) ? '' : 'none';
      });
    });
  });
}());

/* ── 7. Architecture map ─────────────────────────────────── */
(function () {
  const stack = document.getElementById('archStack');
  if (!stack) return;
  const nodes = [...stack.querySelectorAll('.node')];
  const tag   = document.getElementById('archTag');
  const name  = document.getElementById('archName');
  const desc  = document.getElementById('archDesc');
  const meta  = document.getElementById('archMeta');

  const INFO = {
    icons:   { name:'YTE Icons',       tag:'Released · Language layer',
      desc:'The only product that depends on nothing. Thirty-seven glyphs drawn to one standard, giving every other product in the ecosystem a shared visual grammar before a line of its interface is written.' },
    os:      { name:'Cosvire OS',      tag:'In development · Foundation',
      desc:'The floor everything else stands on. Identity, settings and state live here once, so four products above it do not each solve the same problems in four different ways.' },
    connect: { name:'Cosvire Connect', tag:'Research · Services',
      desc:'The wiring inside the walls. Connect lets products hand data to one another without either side knowing how the other is built — which is what turns six products into one ecosystem.' },
    search:  { name:'Cosvire Search',  tag:'Research · Services',
      desc:'A single index spanning everything Cosvire runs. It sits on the foundation and reads across every product, so one query returns results from all of them.' },
    mobile:  { name:'Cosvire Mobile',  tag:'In development · Surface',
      desc:'What people actually open. Cross-platform apps that inherit the design language and the foundation, engineered to feel native on every device they land on.' },
    rewards: { name:'Cosvire Rewards', tag:'Research · Surface',
      desc:'The deepest-stacked product in the portfolio — it needs the foundation to know who you are and Connect to move value between products. It is built last for that reason.' },
  };

  const label = k => INFO[k]?.name || k;
  const clear = () => nodes.forEach(n => {
    n.classList.remove('is-active', 'is-dep', 'is-dim');
    n.style.removeProperty('--accent-dep');
  });

  const select = node => {
    const key    = node.dataset.node;
    const accent = node.dataset.accent;
    const deps   = (node.dataset.deps || '').split(',').filter(Boolean);
    const used   = (node.dataset.used || '').split(',').filter(Boolean);
    const related = new Set([...deps, ...used]);

    clear();
    nodes.forEach(n => {
      const k = n.dataset.node;
      if (k === key) {
        n.classList.add('is-active');
      } else if (related.has(k)) {
        n.classList.add('is-dep');
        n.style.setProperty('--accent-dep', accent);
      } else {
        n.classList.add('is-dim');
      }
    });

    const info = INFO[key];
    tag.textContent  = info.tag;
    name.textContent = info.name;
    desc.textContent = info.desc;
    meta.innerHTML =
      'Stands on &nbsp; <b>' + (deps.length ? deps.map(label).join(', ') : 'Nothing') + '</b><br />' +
      'Supports &nbsp; <b>' + (used.length ? used.length + ' product' + (used.length > 1 ? 's' : '') : 'None yet') + '</b><br />' +
      'Layer &nbsp; <b>' + info.tag.split('· ')[1] + '</b>';
  };

  nodes.forEach(n => {
    n.addEventListener('mouseenter', () => select(n));
    n.addEventListener('click', () => select(n));
    n.addEventListener('focus', () => select(n));
    n.setAttribute('tabindex', '0');
  });

  stack.addEventListener('mouseleave', () => {
    clear();
    tag.textContent  = 'Select a product';
    name.textContent = 'Four layers, six products';
    desc.textContent = 'Nothing in the ecosystem is built from nothing. YTE Icons gives everything its visual language, Cosvire OS gives everything a floor, and each product above inherits the work of the ones beneath it.';
    meta.innerHTML = 'Layers &nbsp; <b>Four</b><br />Products &nbsp; <b>Six</b><br />Shared systems &nbsp; <b>Two</b>';
  });
}());

/* ── 8. Legal sections ───────────────────────────────────── */
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

/* ── 9. Notes filtering ──────────────────────────────────── */
(function () {
  const filters = document.querySelectorAll('.filter');
  if (!filters.length) return;
  filters.forEach(f => {
    f.addEventListener('click', () => {
      filters.forEach(x => x.classList.remove('active'));
      f.classList.add('active');
      const cat = f.dataset.cat || 'all';
      document.querySelectorAll('[data-post-cat]').forEach(p => {
        p.style.display = (cat === 'all' || p.dataset.postCat === cat) ? '' : 'none';
      });
    });
  });
}());
