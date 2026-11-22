// STEFY NAIL - Versión 6 Optimizada
console.log('Stefy Nail v6 Optimizada');

// ===== CONFIG EXCEL - PEGAR ACA TU URL DE APPS SCRIPT =====
const SHEET_URL = "PEGAR_AQUI_TU_URL_DE_APPS_SCRIPT";
// ==========================================================

// NUEVO - MERCADO PAGO - LINK DE ISMAEL - SEÑA $10.000
const MP_SENA = "https://link.mercadopago.com.ar/stefynail1";
// ==========================================================

let principales = [];
let biblioteca = [];
let listaActual = [];
let actual = 0;

// OPTIMIZADO: cache para no volver a preguntar si la imagen existe
const cacheExiste = new Map();

function existeImagen(src) {
  if (cacheExiste.has(src)) return Promise.resolve(cacheExiste.get(src));
  return new Promise((resolve) => {
    const test = new Image();
    // OPTIMIZADO: timeout de 2 seg, si no responde no frena toda la página
    const timer = setTimeout(() => { cacheExiste.set(src, false); resolve(false); }, 2000);
    test.onload = () => { clearTimeout(timer); cacheExiste.set(src, true); resolve(true); };
    test.onerror = () => { clearTimeout(timer); cacheExiste.set(src, false); resolve(false); };
    test.src = src;
  });
}

async function cargarFotos() {
  // ARREGLO: busca .jpeg, .jpg, .png y .webp, no solo .jpeg
  const extensiones = ['jpeg', 'jpg', 'png', 'webp'];
  const promesas = [];
  for (let i = 1; i <= 100; i++) {
    for (const ext of extensiones) {
      const src = `trabajo${i}.${ext}`;
      promesas.push(existeImagen(src).then(existe => existe ? src : null));
    }
  }
  const resultados = await Promise.all(promesas);
  // Quita duplicados por si hay trabajo1.jpg y trabajo1.jpeg
  const vistas = new Set();
  const encontradas = [];
  for (const src of resultados) {
    if (!src) continue;
    const base = src.split('.')[0];
    if (vistas.has(base)) continue;
    vistas.add(base);
    encontradas.push(src);
  }

  principales = encontradas.slice(0, 6);
  biblioteca = encontradas.slice(6);

  // OPTIMIZADO: solo carga las 6 primeras ya, el resto con lazy
  const galeria = document.getElementById('galeria');
  if (!galeria) return;
  galeria.innerHTML = '';
  principales.forEach((src, i) => {
    const im = document.createElement('img');
    im.src = src;
    im.alt = 'Trabajo ' + (i + 1);
    im.dataset.index = i;
    im.width = 400;
    im.height = 300;
    // Las 2 primeras son las más importantes, cargan ya
    im.loading = i < 2 ? 'eager' : 'lazy';
    im.fetchPriority = i < 2 ? 'high' : 'low';
    im.decoding = 'async';
    galeria.appendChild(im);
  });

  // OPTIMIZADO: la biblioteca NO se crea hasta que la abrís
  // Así no carga 100 fotos de gusto al entrar
  const btnVerMas = document.getElementById('btnVerMas');
  if (biblioteca.length === 0 && btnVerMas) {
    btnVerMas.style.display = 'none';
  }
}

function crearBiblioteca() {
  const grid = document.getElementById('biblioGrid');
  if (!grid) return;
  if (grid.dataset.cargada === 'si') return;
  grid.dataset.cargada = 'si';
  grid.innerHTML = '';
  biblioteca.forEach((src, i) => {
    const im = document.createElement('img');
    im.src = src;
    im.alt = 'Trabajo ' + (i + 7);
    im.width = 400;
    im.height = 300;
    im.loading = 'lazy';
    im.decoding = 'async';
    im.addEventListener('click', () => abrir(i, biblioteca));
    grid.appendChild(im);
  });
}

function abrir(i, lista) {
  listaActual = lista;
  actual = i;
  mostrar();
  document.getElementById('lightbox').classList.add('abierto');
  document.body.style.overflow = 'hidden';
  // OPTIMIZADO: precarga la anterior y la siguiente para que no tarde al pasar
  precargar(actual + 1);
  precargar(actual - 1);
}

function precargar(index) {
  if (index < 0 || index >= listaActual.length) return;
  const img = new Image();
  img.src = listaActual[index];
}

function mostrar() {
  const img = document.getElementById('fotoGrande');
  img.classList.remove('zoom');
  img.src = listaActual[actual];
  document.getElementById('contador').textContent = (actual + 1) + ' / ' + listaActual.length;
  precargar(actual + 1);
  precargar(actual - 1);
}

function cambiar(dir) {
  actual = (actual + dir + listaActual.length) % listaActual.length;
  mostrar();
}

function cerrar() {
  document.getElementById('lightbox').classList.remove('abierto');
  document.body.style.overflow = '';
}

const galeriaEl = document.getElementById('galeria');
if (galeriaEl) {
  galeriaEl.addEventListener('click', function (e) {
    const img = e.target.closest('img');
    if (!img) return;
    abrir(parseInt(img.dataset.index), principales);
  });
}

const btnVerMasEl = document.getElementById('btnVerMas');
if (btnVerMasEl) {
  btnVerMasEl.addEventListener('click', function () {
    crearBiblioteca(); // recién acá crea las fotos de la biblioteca
    document.getElementById('biblioteca').classList.add('abierta');
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
  });
}

const btnCerrarBiblioEl = document.getElementById('btnCerrarBiblio');
if (btnCerrarBiblioEl) {
  btnCerrarBiblioEl.addEventListener('click', function () {
    document.getElementById('biblioteca').classList.remove('abierta');
    document.body.style.overflow = '';
  });
}

const btnCerrarEl = document.getElementById('btnCerrar');
if (btnCerrarEl) btnCerrarEl.addEventListener('click', cerrar);

const btnPrevEl = document.getElementById('btnPrev');
if (btnPrevEl) {
  btnPrevEl.addEventListener('click', function (e) {
    e.stopPropagation();
    cambiar(-1);
  });
}

const btnNextEl = document.getElementById('btnNext');
if (btnNextEl) {
  btnNextEl.addEventListener('click', function (e) {
    e.stopPropagation();
    cambiar(1);
  });
}

const lightboxEl = document.getElementById('lightbox');
if (lightboxEl) {
  lightboxEl.addEventListener('click', function (e) {
    if (e.target.id === 'lightbox') cerrar();
  });
}

const fotoGrandeEl = document.getElementById('fotoGrande');
if (fotoGrandeEl) {
  fotoGrandeEl.addEventListener('click', function (e) {
    e.stopPropagation();
    this.classList.toggle('zoom');
  });
}

// ARREGLO: en index.html no existe btnReservar, solo en reserva.html
// Si no existe, no rompe el script
const btnReservarEl = document.getElementById('btnReservar');
if (btnReservarEl) btnReservarEl.addEventListener('click', reservar);

document.addEventListener('keydown', e => {
  if (!document.getElementById('lightbox').classList.contains('abierto')) return;
  if (e.key === 'Escape') cerrar();
  if (e.key === 'ArrowRight') cambiar(1);
  if (e.key === 'ArrowLeft') cambiar(-1);
});

async function reservar() {
  let n = document.getElementById('nombre').value.trim();
  let ap = document.getElementById('apellido') ? document.getElementById('apellido').value.trim() : '';
  let nombreCompleto = ap ? n + ' ' + ap : n;
  let tel = document.getElementById('telefono').value.trim();
  let s = document.getElementById('servicio').value;
  let f = document.getElementById('fecha').value || 'a coordinar';
  let h = document.getElementById('hora').value || 'a coordinar';
  let msgEl = document.getElementById('msgTurno');

  // NUEVO - MERCADO PAGO - LEE QUE PAGO ELIGIO
  let tipoPagoEl = document.getElementById('tipoPago');
  let tipoPago = tipoPagoEl ? tipoPagoEl.value : 'local';
  let textoPago = tipoPago === 'sena' ? 'Seña $10.000 por Mercado Pago' : 'Pago en el local';

  if (!n) { alert('Escribí tu nombre 💖'); return; }
  if (!ap) { alert('Escribí tu apellido 💖'); return; }
  if (!tel) { alert('Escribí tu WhatsApp / teléfono'); return; }
  if (!document.getElementById('fecha').value) { alert('Elegí una fecha'); return; }
  if (!document.getElementById('hora').value) { alert('Elegí una hora'); return; }

  try {
    if (SHEET_URL && !SHEET_URL.includes('PEGAR_AQUI')) {
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreCompleto, telefono: tel, servicio: s, fecha: f, hora: h, pago: textoPago })
      });
    }
  } catch (e) {
    console.log('Error guardando en Excel', e);
  }

  msgEl.style.display = 'block';
  msgEl.textContent = '¡Turno guardado! Te abrimos WhatsApp para confirmarlo 💖';

  let msg = `Hola Stefy! Soy ${nombreCompleto} (${tel}), quiero reservar ${s} para el ${f} a las ${h} 💅 - Pago: ${textoPago}`;
  window.open('https://wa.me/5491151173182?text=' + encodeURIComponent(msg), '_blank');

  // NUEVO - MERCADO PAGO - ABRE EL LINK SOLO SI ELIGIO SEÑA
  if (tipoPago === 'sena') {
    setTimeout(() => {
      window.open(MP_SENA, '_blank');
    }, 500);
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(e => console.log('SW error', e));
  });
}

// OPTIMIZADO: espera a que cargue lo importante primero, las fotos después
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(cargarFotos, 50));
} else {
  setTimeout(cargarFotos, 50);
}