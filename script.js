/* ==========================================================================
   jessie.lu — small, dependency-free interactions
   1. Mobile navigation toggle
   2. Current year in the footer
   3. Project category filter
   4. Contact form -> mailto handoff
   5. Smooth anchor scrolling with header offset
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    // close when a link is tapped
    nav.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      }
    });

    // close on outside click
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    });

    // close when resizing back to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760 && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      }
    });
  }

  /* ---------- 2. footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- 3. project filter ---------- */
  var filterBar = document.querySelector('.filters');
  var workGrid = document.getElementById('work-grid');

  if (filterBar && workGrid) {
    var cards = Array.prototype.slice.call(workGrid.querySelectorAll('.work'));

    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn) return;

      var filter = btn.dataset.filter;

      filterBar.querySelectorAll('.filter').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });

      cards.forEach(function (card) {
        var cats = (card.dataset.cat || '').split(/\s+/);
        var show = filter === 'all' || cats.indexOf(filter) !== -1;
        card.classList.toggle('hide', !show);
      });
    });

    // if a deep link points at a card, clear filters so it is visible
    if (window.location.hash) {
      var target = document.querySelector(window.location.hash);
      if (target && target.classList.contains('work')) {
        filterBar.querySelectorAll('.filter').forEach(function (b) {
          b.classList.toggle('active', b.dataset.filter === 'all');
        });
        cards.forEach(function (c) { c.classList.remove('hide'); });
      }
    }
  }

  /* ---------- 4. contact form -> mailto ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var ADDRESS = 'jackielu0322@outlook.com';

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = (form.elements.name.value || '').trim();
      var email = (form.elements.email.value || '').trim();
      var topic = form.elements.topic ? form.elements.topic.value : '';
      var message = (form.elements.message.value || '').trim();

      if (!name || !email || !message) {
        alert('Please fill in your name, email and a short message.');
        return;
      }

      var subject = topic
        ? topic + ' — enquiry from ' + name
        : 'Website enquiry from ' + name;
      var body =
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        (topic ? 'Topic: ' + topic + '\n' : '') +
        '\n' + message + '\n';

      var url = 'mailto:' + ADDRESS +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      window.location.href = url;
    });
  }

  /* ---------- smooth anchor scroll with header offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var top = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ---------- 5. gallery lightbox (project detail pages) ---------- */
  var lb = document.getElementById('lightbox');
  var links = Array.prototype.slice.call(document.querySelectorAll('.g-link, .acc-panel'));
  if (lb && links.length && typeof lb.showModal === 'function') {
    var lbImg = lb.querySelector('.lb-img');
    var lbCap = lb.querySelector('.lb-cap');
    var group = [];
    var idx = 0;

    function show(i) {
      idx = (i + group.length) % group.length;
      var a = group[idx];
      var img = a.querySelector('img');
      lbImg.src = a.getAttribute('href');
      lbImg.alt = img ? img.alt : '';
      lbCap.textContent = a.dataset.caption || '';
      lb.classList.toggle('single', group.length < 2);
    }

    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        group = links.filter(function (l) { return l.dataset.gallery === a.dataset.gallery; });
        show(group.indexOf(a));
        lb.showModal();
      });
    });

    lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    lb.addEventListener('close', function () { lbImg.src = ''; });
  }

  /* ---------- 6. scale the embedded prototype to fit narrow screens ---------- */
  var ps = document.getElementById('proto-scaler');
  if (ps) {
    var stage = ps.querySelector('.proto-stage');
    var fitProto = function () {
      var s = Math.min(1, ps.parentNode.clientWidth / 410);
      stage.style.transform = 'scale(' + s + ')';
      ps.style.width = (410 * s) + 'px';
      ps.style.height = (864 * s) + 'px';
    };
    fitProto();
    window.addEventListener('resize', fitProto);
  }

  /* ---------- 7. jelly navigation chips ----------
     The chosen chip swells (wide first, then tall) and pushes its
     neighbours aside, one after another. Written from scratch with a
     tiny spring simulator; no libraries. Desktop only: on phones the
     menu is a plain vertical list. */
  var jelly = document.getElementById('jelly');
  if (jelly) {
    var chips = Array.prototype.slice.call(jelly.querySelectorAll('.jelly-chip'));
    var SWELL = 0.18, SHRINK = 0.05, BARGE = 5, STAGGER = 0.012;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var desktop = window.matchMedia('(min-width: 761px)');
    var selected = -1;
    chips.forEach(function (c, i) { if (c.classList.contains('is-on')) selected = i; });

    // one spring per property: position, velocity, target, stiffness, damping, start delay
    function spring(v) { return { p: v, v: 0, t: v, k: 500, c: 30, wait: 0 }; }
    var st = chips.map(function () { return { x: spring(0), sx: spring(1), sy: spring(1) }; });
    var widths = [], raf = 0, last = 0;

    function paint() {
      chips.forEach(function (el, i) {
        var s = st[i];
        el.style.transform = desktop.matches
          ? 'translateX(' + s.x.p.toFixed(2) + 'px) scale(' + s.sx.p.toFixed(4) + ',' + s.sy.p.toFixed(4) + ')'
          : '';
      });
    }

    function measure() {
      chips.forEach(function (el, i) { el.style.transform = ''; widths[i] = el.offsetWidth; });
      var maxW = Math.max.apply(null, widths.concat([0]));
      jelly.style.setProperty('--jelly-pad-x', Math.ceil(maxW * SWELL * 0.65 + BARGE) + 'px');
    }

    // bounce: 0 settles with no overshoot, higher values wobble more
    function tune(sp, target, k, bounce, wait) {
      sp.t = target; sp.k = k; sp.c = 2 * Math.sqrt(k) * (1 - bounce); sp.wait = wait;
    }

    function setTargets(sel, instant) {
      var push = sel < 0 ? 0 : (widths[sel] || 0) * SWELL / 2 + BARGE;
      chips.forEach(function (el, i) {
        var s = st[i], dist = sel < 0 ? 0 : Math.abs(i - sel);
        var x = sel < 0 ? 0 : Math.sign(i - sel) * push;
        var scale = sel < 0 ? 1 : (i === sel ? 1 + SWELL : 1 - SHRINK);
        var k = 1100 * (1 - 0.12 * Math.min(dist, 3));
        var wait = dist * STAGGER;
        tune(s.x, x, k, 0.25, wait);
        tune(s.sx, scale, k * 1.25, 0.55, wait);          // width: quick and wobbly
        tune(s.sy, scale, k * 0.85, 0.25, wait + 0.025);  // height: follows a beat later
        if (instant) ['x', 'sx', 'sy'].forEach(function (key) { s[key].p = s[key].t; s[key].v = 0; s[key].wait = 0; });
      });
      if (instant) { paint(); return; }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    }

    function tick(now) {
      var dt = Math.min((now - last) / 1000, 1 / 30); last = now;
      var moving = false;
      st.forEach(function (s) {
        ['x', 'sx', 'sy'].forEach(function (key) {
          var sp = s[key];
          if (sp.wait > 0) { sp.wait -= dt; moving = true; return; }
          // a few small sub-steps keep the stiff spring stable
          for (var n = 0; n < 4; n++) {
            var h = dt / 4, a = -sp.k * (sp.p - sp.t) - sp.c * sp.v;
            sp.v += a * h; sp.p += sp.v * h;
          }
          if (Math.abs(sp.v) > 0.001 || Math.abs(sp.p - sp.t) > 0.0005) moving = true;
          else { sp.p = sp.t; sp.v = 0; }
        });
      });
      paint();
      raf = moving ? requestAnimationFrame(tick) : 0;
    }

    function settle() { measure(); setTargets(selected, true); }
    settle();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
    window.addEventListener('resize', settle);

    chips.forEach(function (el, i) {
      el.addEventListener('pointerenter', function () {
        if (el.dataset.prefetched || i === selected) return;
        var l = document.createElement('link');
        l.rel = 'prefetch'; l.href = el.getAttribute('href');
        document.head.appendChild(l); el.dataset.prefetched = '1';
      });
      el.addEventListener('click', function (e) {
        // leave new-tab clicks, the current page and phone layout alone
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (i === selected || !desktop.matches || reduceMotion.matches) return;
        e.preventDefault();
        if (selected >= 0) chips[selected].classList.remove('is-on');
        el.classList.add('is-on');
        selected = i;
        setTargets(i, false);
        var href = el.getAttribute('href');
        setTimeout(function () { window.location.href = href; }, 140);
      });
    });
  }

  /* ---------- 8. accordion photo gallery ----------
     Hover (or focus, or tap) opens a photo; the others stay as narrow
     black-and-white strips. Clicking an open photo shows it full size. */
  var acc = document.getElementById('accordion');
  if (acc) {
    var panels = Array.prototype.slice.call(acc.querySelectorAll('.acc-panel'));
    var current = Math.max(0, panels.findIndex(function (p) { return p.classList.contains('is-active'); }));
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

    function openPanel(i) {
      current = i;
      panels.forEach(function (p, k) {
        p.classList.toggle('is-active', k === i);
        p.classList.toggle('is-left', k < i);
        p.classList.toggle('is-right', k > i);
        if (k === i) p.setAttribute('aria-current', 'true'); else p.removeAttribute('aria-current');
      });
    }
    openPanel(current);

    panels.forEach(function (p, i) {
      p.addEventListener('mouseenter', function () { if (canHover.matches) openPanel(i); });
      p.addEventListener('focus', function () { openPanel(i); });
      p.addEventListener('keydown', function (e) {
        var n = panels.length, next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % n;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + n) % n;
        if (next !== null) { e.preventDefault(); panels[next].focus(); }
      });
    });

    // first click on a closed photo opens it; only a click on the open one
    // reaches the full-size viewer (capture phase runs before the viewer)
    // remember whether the photo was already open when the finger or mouse
    // went down (tapping also focuses it, which would open it a moment early)
    var wasOpen = null;
    acc.addEventListener('pointerdown', function (e) {
      var p = e.target.closest('.acc-panel');
      wasOpen = p ? p.classList.contains('is-active') : null;
    }, true);
    acc.addEventListener('click', function (e) {
      var p = e.target.closest('.acc-panel');
      if (!p) return;
      var i = panels.indexOf(p);
      var open = wasOpen === null ? i === current : wasOpen;
      wasOpen = null;
      if (!open) { e.preventDefault(); e.stopPropagation(); openPanel(i); }
    }, true);
  }

})();
