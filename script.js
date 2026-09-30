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
      toggle.textContent = open ? 'Close' : 'Menu';
    });

    // close when a link is tapped
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu';
      }
    });

    // close on outside click
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = 'Menu';
    });

    // close when resizing back to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760 && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu';
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
  var links = Array.prototype.slice.call(document.querySelectorAll('.g-link'));
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

})();
