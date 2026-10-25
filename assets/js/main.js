// No animation library: IntersectionObserver, one rAF-throttled scroll handler and CSS transitions
// cover everything here, so the page ships no extra JavaScript beyond this file.
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header hairline once the page scrolls.
  var header = document.querySelector('.site-header');

  // Burger menu on phones: toggle, then close on link choice or Escape.
  var toggle = document.querySelector('.menu-toggle');
  if (header && toggle) {
    var setOpen = function (open) {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    toggle.addEventListener('click', function () { setOpen(!header.classList.contains('is-open')); });
    header.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
  }

  // Footer year.
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  // Scroll reveals: add .is-in once an element is a little way into the viewport.
  var reveals = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // Scroll-linked work: parallax on a few photos and the projects connection path.
  var parallax = reduceMotion ? [] : Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var list = document.querySelector('.project-list');
  var projects = list ? list.querySelectorAll('.project') : [];
  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 4);

    parallax.forEach(function (img) {
      var r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var offset = (r.top + r.height / 2 - vh / 2) * parseFloat(img.dataset.parallax);
      img.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
    });

    if (list) {
      var lr = list.getBoundingClientRect();
      var marker = vh * 0.6;
      var progress = Math.min(1, Math.max(0, (marker - lr.top) / lr.height));
      list.style.setProperty('--progress', reduceMotion ? 1 : progress.toFixed(4));
      projects.forEach(function (p) {
        p.classList.toggle('is-reached', reduceMotion || p.getBoundingClientRect().top + 80 < marker);
      });
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // Gateway panels: slow cross-fade between real project photos where a panel has more than one.
  if (!reduceMotion) {
    var sets = Array.prototype.slice.call(document.querySelectorAll('.panel-media'))
      .map(function (m) { return m.querySelectorAll('.slide'); })
      .filter(function (s) { return s.length > 1; });
    var step = 0;
    setInterval(function () {
      if (document.hidden) return;
      var slides = sets[step % sets.length];
      step++;
      if (!slides) return;
      var current = Array.prototype.findIndex.call(slides, function (s) { return s.classList.contains('is-active'); });
      var next = slides[(current + 1) % slides.length];
      if (!next.complete) return;
      slides[current].classList.remove('is-active');
      next.classList.add('is-active');
    }, 4500);
  }
})();
