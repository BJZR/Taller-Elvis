
// Variables globales
let currentSlide = 0;
let slideInterval;
const slides = document.querySelectorAll('.hero-slide');
const indicators = document.querySelectorAll('.indicator');
let formData = {};
let lucideLoaded = false;

// Función para inicializar iconos cuando Lucide esté listo
function initializeLucideIcons() {
  if (typeof lucide !== 'undefined' && !lucideLoaded) {
    lucide.createIcons();
    lucideLoaded = true;
    updateThemeIcon();
  }
}

// Intentar inicializar iconos inmediatamente
initializeLucideIcons();

// Si no está listo, esperar a que se cargue
if (!lucideLoaded) {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeLucideIcons, 100);
  });

  // Backup: intentar cada 500ms hasta que se cargue (máximo 5 segundos)
  let attempts = 0;
  const maxAttempts = 10;
  const checkLucide = setInterval(function() {
    if (lucideLoaded || attempts >= maxAttempts) {
      clearInterval(checkLucide);
      return;
    }
    initializeLucideIcons();
    attempts++;
  }, 500);
}

// Inicializar tema
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// Función para cambiar tema
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon();
}

function updateThemeIcon() {
  if (!lucideLoaded) return;

  const themeIcon = document.getElementById('theme-icon');
  const currentTheme = document.documentElement.getAttribute('data-theme');

  if (themeIcon) {
    if (currentTheme === 'dark') {
      themeIcon.setAttribute('data-lucide', 'moon');
    } else {
      themeIcon.setAttribute('data-lucide', 'sun');
    }
    lucide.createIcons();
  }
}

// Funciones del slider
function showSlide(n) {
  slides.forEach((slide, index) => {
    slide.classList.remove('active');
    indicators[index].classList.remove('active');
  });

  slides[n].classList.add('active');
  indicators[n].classList.add('active');
  currentSlide = n;
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

function goToSlide(n) {
  showSlide(n);
  clearInterval(slideInterval);
  startSlideshow();
}

function startSlideshow() {
  slideInterval = setInterval(nextSlide, 4000);
}

// Navegación móvil
function toggleNav() {
  const nav = document.getElementById('nav');
  nav.classList.toggle('active');
}

function closeNav() {
  const nav = document.getElementById('nav');
  nav.classList.remove('active');
}

// Función para mostrar modal
function mostrarModal() {
  document.getElementById('confirmModal').style.display = 'block';
}

function cerrarModal() {
  document.getElementById('confirmModal').style.display = 'none';
}

// Función para enviar por WhatsApp
function enviarWhatsApp() {
  const mensajeWhatsApp = `¡Hola! 👋

  *Solicitud de servicio - Taller Elvis*

  👤 *Nombre:* ${formData.nombre}
  📞 *Teléfono:* ${formData.telefono}

  💬 *Mensaje:*
  ${formData.mensaje}

  ¡Espero su respuesta! 🛠️`;

  const whatsappURL = `https://wa.me/573013133740?text=${encodeURIComponent(mensajeWhatsApp)}`;
  window.open(whatsappURL, '_blank');
  cerrarModal();
  document.getElementById('contactForm').reset();
}

function confirmarEnvio() {
  enviarWhatsApp();
}

// Manejo del formulario
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const telefono = document.getElementById('telefono').value;
  const mensaje = document.getElementById('mensaje').value;

  if (!nombre || !telefono || !mensaje) {
    alert('Por favor, complete todos los campos');
    return;
  }

  // Guardar datos del formulario
  formData = {
    nombre: nombre,
    telefono: telefono,
    mensaje: mensaje
  };

  // Mostrar modal de confirmación
  mostrarModal();
});

// Cerrar navegación al hacer clic fuera
document.addEventListener('click', function(event) {
  const nav = document.getElementById('nav');
  const toggle = document.querySelector('.nav-toggle');

  if (!nav.contains(event.target) && !toggle.contains(event.target)) {
    nav.classList.remove('active');
  }
});

// Cerrar modal al hacer clic fuera
document.getElementById('confirmModal').addEventListener('click', function(event) {
  if (event.target === this) {
    cerrarModal();
  }
});

// Animaciones de scroll con mejor rendimiento
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observar elementos con animación
document.querySelectorAll('.animate-in').forEach(el => {
  observer.observe(el);
});

// Scroll suave para los enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Inicializar slider
startSlideshow();

// Efecto parallax optimizado
let ticking = false;
function updateParallax() {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero');

  if (hero && scrolled < window.innerHeight) {
    const rate = scrolled * 0.3;
    hero.style.transform = `translateY(${rate}px)`;
  }
  ticking = false;
}

window.addEventListener('scroll', function() {
  if (!ticking) {
    requestAnimationFrame(updateParallax);
    ticking = true;
  }
});

