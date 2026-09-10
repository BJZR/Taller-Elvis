(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Lucide icons ---------- */
  function initIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    } else if (window.lucide === undefined && !prefersReduced) {
      var tries = 0;
      var timer = setInterval(function () {
        tries += 1;
        if (window.lucide) {
          window.lucide.createIcons();
          clearInterval(timer);
        } else if (tries > 20) {
          clearInterval(timer);
        }
      }, 250);
    }
  }
  initIcons();

  /* ---------- Theme ---------- */
  var rootEl = document.documentElement;
  var themeIcon = $('#themeIcon');
  var savedTheme = localStorage.getItem('theme');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var currentTheme = savedTheme || (systemDark ? 'dark' : 'light');
  rootEl.setAttribute('data-theme', currentTheme);

  var metaTheme = $('meta[name="theme-color"]');
  function applyThemeMeta(theme) {
    if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#0d1512' : '#14532d');
  }

  function setThemeIcon(theme) {
    if (!themeIcon) return;
    themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    initIcons();
  }

  function setTheme(theme) {
    rootEl.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    setThemeIcon(theme);
    applyThemeMeta(theme);
  }
  setTheme(currentTheme);

  $('#themeToggle').addEventListener('click', function () {
    setTheme(rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* ---------- Header scroll state ---------- */
  var header = $('#header');
  function onScrollHeader() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }
  onScrollHeader();

  /* ---------- Mobile nav ---------- */
  var nav = $('#nav');
  var navBackdrop = $('#navBackdrop');
  var navToggle = $('#navToggle');
  var menuIcon = $('#menuIcon');

  function openNav() {
    nav.classList.add('open');
    navBackdrop.classList.add('show');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Cerrar menú');
    if (menuIcon) menuIcon.setAttribute('data-lucide', 'x');
    initIcons();
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    nav.classList.remove('open');
    navBackdrop.classList.remove('show');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
    if (menuIcon) menuIcon.setAttribute('data-lucide', 'menu');
    initIcons();
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', function () {
    nav.classList.contains('open') ? closeNav() : openNav();
  });

  navBackdrop.addEventListener('click', closeNav);
  $$('.nav-link', nav).forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeNav();
      if (modal.classList.contains('open')) closeModal();
    }
  });

  /* ---------- Hero slider ---------- */
  var slides = $$('.hero-slide');
  var indicators = $$('.indicator');
  var hero = $('#hero');
  var currentSlide = 0;
  var slideTimer = null;
  var SLIDE_DELAY = 5000;

  function showSlide(n) {
    currentSlide = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('active', i === currentSlide); });
    indicators.forEach(function (ind, i) { ind.classList.toggle('active', i === currentSlide); });
  }

  function nextSlide() { showSlide(currentSlide + 1); }

  function startSlider() {
    if (prefersReduced || slides.length < 2) return;
    stopSlider();
    slideTimer = setInterval(nextSlide, SLIDE_DELAY);
  }

  function stopSlider() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = null;
  }

  indicators.forEach(function (ind) {
    ind.addEventListener('click', function () {
      showSlide(parseInt(ind.dataset.slide, 10));
      startSlider();
    });
  });

  if (hero) {
    hero.addEventListener('mouseenter', stopSlider);
    hero.addEventListener('mouseleave', startSlider);
    hero.addEventListener('touchstart', onTouchStart, { passive: true });
    hero.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  var touchStartX = 0;
  function onTouchStart(e) { touchStartX = e.changedTouches[0].clientX; }
  function onTouchEnd(e) {
    var deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 50) {
      deltaX < 0 ? nextSlide() : showSlide(currentSlide - 1);
      startSlider();
    }
  }

  startSlider();

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el, i) {
      el.style.setProperty('--reveal-delay', Math.min(i % 4, 3) * 0.08 + 's');
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Animated counters ---------- */
  var statValues = $$('.stat-value');
  function animateCounter(el) {
    if (prefersReduced) {
      el.textContent = el.dataset.count;
      return;
    }
    var target = parseInt(el.dataset.count, 10) || 0;
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var statsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var value = entry.target;
          animateCounter(value);
          statsObserver.unobserve(value);
        }
      });
    }, { threshold: 0.5 });
    statValues.forEach(function (el) { statsObserver.observe(el); });
  } else {
    statValues.forEach(function (el) { el.textContent = el.dataset.count; });
  }

  /* ---------- Active nav link ---------- */
  var sections = $$('main section[id], #inicio');
  var navLinks = $$('.nav-link');
  var activeLink = $('.nav-link');
  var currentSectionId = 'inicio';

  function setActiveLink(id) {
    if (id === currentSectionId) return;
    currentSectionId = id;
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }
  setActiveLink('inicio');

  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActiveLink(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- Smooth anchor scroll (CSS handles it; JS snaps active) ---------- */

  /* ---------- Form validation ---------- */
  var form = $('#contactForm');
  var nombre = $('#nombre');
  var telefono = $('#telefono');
  var mensaje = $('#mensaje');
  var submitBtn = $('#submitBtn');

  function setError(input, message) {
    var group = input.closest('.form-group');
    var errorEl = group.querySelector('.error-msg');
    group.classList.add('has-error');
    group.classList.remove('has-valid');
    if (errorEl) errorEl.textContent = message;
  }

  function setValid(input) {
    var group = input.closest('.form-group');
    group.classList.remove('has-error');
    group.classList.add('has-valid');
  }

  function validateName() {
    var v = nombre.value.trim();
    if (!v) return setError(nombre, 'Ingresa tu nombre completo.'), false;
    if (v.length < 3) return setError(nombre, 'El nombre debe tener al menos 3 letras.'), false;
    setValid(nombre);
    return true;
  }

  function validatePhone() {
    var v = telefono.value.trim();
    if (!v) return setError(telefono, 'Ingresa tu número de teléfono.'), false;
    var digits = v.replace(/[^\d]/g, '');
    if (digits.length < 7) return setError(telefono, 'El número debe tener al menos 7 dígitos.'), false;
    setValid(telefono);
    return true;
  }

  function validateMessage() {
    var v = mensaje.value.trim();
    if (!v) return setError(mensaje, 'Cuéntanos qué electrodoméstico y qué falla tiene.'), false;
    if (v.length < 10) return setError(mensaje, 'Describe un poco más el problema (mínimo 10 caracteres).'), false;
    setValid(mensaje);
    return true;
  }

  nombre.addEventListener('input', validateName);
  telefono.addEventListener('input', validatePhone);
  mensaje.addEventListener('input', validateMessage);

  /* ---------- Modal + WhatsApp ---------- */
  var modal = $('#confirmModal');
  var confirmBtn = $('#confirmBtn');
  var cancelBtn = $('#cancelBtn');
  var modalClose = $('#modalClose');
  var formData = null;

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  confirmBtn.addEventListener('click', sendWhatsApp);
  cancelBtn.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  function sendWhatsApp() {
    if (!formData) return;
    var text =
      'Hola, Taller Elvis 👋\n\n' +
      '*Solicitud de servicio*\n\n' +
      '👤 *Nombre:* ' + formData.nombre + '\n' +
      '📞 *Teléfono:* ' + formData.telefono + '\n' +
      '💬 *Mensaje:* ' + formData.mensaje +
      '\n\nEspero su respuesta. 🛠️';
    window.open('https://wa.me/573013133740?text=' + encodeURIComponent(text), '_blank', 'noopener');
    closeModal();
    form.reset();
    $$('.form-group', form).forEach(function (g) {
      g.classList.remove('has-error', 'has-valid');
    });
    formData = null;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var okName = validateName();
    var okPhone = validatePhone();
    var okMsg = validateMessage();
    if (!okName || !okPhone || !okMsg) return;
    formData = { nombre: nombre.value.trim(), telefono: telefono.value.trim(), mensaje: mensaje.value.trim() };
    openModal();
  });

  /* ---------- Back to top ---------- */
  var backToTop = $('#backToTop');
  function onBackToTopScroll() {
    backToTop.classList.toggle('show', window.scrollY > 600);
  }
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });

  /* ---------- Scroll listeners (rAF) ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScrollHeader();
      onBackToTopScroll();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  setActiveLink('inicio');
})();