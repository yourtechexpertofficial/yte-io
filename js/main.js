/* ============================================================
   COSVIRE — v4
   ============================================================ */
'use strict';

/* ── 1. Masthead ─────────────────────────────────────────── */
(function () {
  const m = document.getElementById('nav');
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
    ['index.html#craft',    'Principles'],
    ['index.html#approach', 'Method'],
    ['about.html',          'Company'],
    ['blog.html',           'Blog'],
    ['contact.html',        'Contact'],
    ['login.html',          'Sign in'],
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
      const off = document.getElementById('nav')?.offsetHeight || 0;
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
