/* ============================================================
   COSVIRE — v4
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
    ['index.html#icons',   'YTE Icons'],
    ['index.html#process', 'Process'],
    ['index.html#next',    "What's next"],
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

/* ── 6. Icon lab — search the real set, click to copy ────── */
(function () {
  const grid  = document.getElementById('iconGrid');
  if (!grid) return;
  const search = document.getElementById('iconSearch');
  const count  = document.getElementById('iconCount');
  const empty  = document.getElementById('iconEmpty');
  const cells  = [...grid.querySelectorAll('.cellico')];
  const total  = cells.length;

  const setCount = n => {
    if (count) count.innerHTML = '<b>' + n + '</b> of ' + total + ' shown';
  };

  search?.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    cells.forEach(c => {
      const hit = !q || c.dataset.name.includes(q);
      c.style.display = hit ? '' : 'none';
      if (hit) shown++;
    });
    setCount(shown);
    if (empty) empty.style.display = shown ? 'none' : '';
    grid.style.display = shown ? '' : 'none';
  });

  const flash = (cell, text) => {
    const label = cell.querySelector('.cellico__name');
    const original = label.textContent;
    cell.classList.add('copied');
    label.textContent = text;
    setTimeout(() => {
      cell.classList.remove('copied');
      label.textContent = original;
    }, 900);
  };

  cells.forEach(cell => {
    cell.addEventListener('click', async () => {
      const cls = 'ico-' + cell.dataset.name;
      try {
        await navigator.clipboard.writeText(cls);
        flash(cell, 'copied');
      } catch (e) {
        /* clipboard blocked (http / permissions) — select instead */
        const r = document.createRange();
        r.selectNodeContents(cell.querySelector('.cellico__name'));
        const sel = window.getSelection();
        sel.removeAllRanges(); sel.addRange(r);
        flash(cell, cls);
      }
    });
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
