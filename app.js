// STEFY NAIL - Galería automática + Turnos
const WHATSAPP_STEFY = '5491151173182';

let principales = [];
let biblioteca = [];
let listaActual = [];
let actual = 0;

function existeImagen(src) {
  return new Promise((resolve) => {
    const test = new Image();
    test.onload = () => resolve(src);
    test.onerror = () => resolve(null);
    test.src = src;
  });
}

async function cargarFotos() {
  // Probamos las 100 fotos a la vez, no una por una
  const pruebas = [];
  for (let i = 1; i <= 100; i++) pruebas.push(existeImagen(`trabajo${i}.jpeg`));
  const resultados = await Promise.all(pruebas);
  const encontradas = resultados.filter(Boolean);

  principales = encontradas.slice(0, 6);
  biblioteca = encontradas.slice(6);

  const galeria = document.getElementById('galeria');
  galeria.innerHTML = '';
  principales.forEach((src, i) => {
    const im = document.createElement('img');
    im.src = src; im.alt = 'Trabajo ' + (i + 1); im.loading = 'lazy';
    im.dataset.index = i;
    galeria.appendChild(im);
  });

  const grid = document.getElementById('biblioGrid');
  grid.innerHTML = '';
  biblioteca.forEach((src, i) => {
    const im = document.createElement('img');
    im.src = src; im.alt = 'Trabajo ' + (i + 7); im.loading = 'lazy';
    im.addEventListener('click', () => abrir(i, biblioteca));
    grid.appendChild(im);
  });

  if (biblioteca.length === 0) document.getElementById('btnVerMas').style.display = 'none';
  if (encontradas.length === 0) galeria.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#888">Pronto subimos nuevos trabajos 💖</p>';
}

function abrir(i, lista) {
  listaActual = lista; actual = i; mostrar();
  document.getElementById('lightbox').classList.add('abierto');
  document.body.style.overflow = 'hidden';
}
function mostrar() {
  const img = document.getElementById('fotoGrande');
  img.classList.remove('zoom');
  img.src = listaActual[actual];
  document.getElementById('contador').textContent = (actual + 1) + ' / ' + listaActual.length;
}
function cambiar(dir) { actual = (actual + dir + listaActual.length) % listaActual.length; mostrar(); }
function cerrar() { document.getElementById('lightbox').classList.remove('abierto'); document.body.style.overflow = ''; }

function reservar() {
  const n = document.getElementById('nombre').value.trim() || 'Hola';
  const s = document.getElementById('servicio').value;
  const f = document.getElementById('fecha').value || 'a coordinar';
  const msg = `Hola Stefy! Soy ${n}, quiero reservar ${s} para el ${f} 💅`;
  window.open('https://wa.me/' + WHATSAPP_STEFY + '?text=' + encodeURIComponent(msg), '_blank');
}

// Eventos
document.getElementById('galeria').addEventListener('click', (e) => {
  const img = e.target.closest('img'); if (!img) return;
  abrir(parseInt(img.dataset.index), principales);
});
document.getElementById('btnVerMas').addEventListener('click', () => {
  document.getElementById('biblioteca').classList.add('abierta');
  document.body.style.overflow = 'hidden'; window.scrollTo(0, 0);
});
document.getElementById('btnCerrarBiblio').addEventListener('click', () => {
  document.getElementById('biblioteca').classList.remove('abierta');
  document.body.style.overflow = '';
});
document.getElementById('btnCerrar').addEventListener('click', cerrar);
document.getElementById('btnPrev').addEventListener('click', (e) => { e.stopPropagation(); cambiar(-1); });
document.getElementById('btnNext').addEventListener('click', (e) => { e.stopPropagation(); cambiar(1); });
document.getElementById('lightbox').addEventListener('click', (e) => { if (e.target.id === 'lightbox') cerrar(); });
document.getElementById('fotoGrande').addEventListener('click', function(e) { e.stopPropagation(); this.classList.toggle('zoom'); });
document.getElementById('btnReservar').addEventListener('click', reservar);
document.addEventListener('keydown', (e) => {
  if (!document.getElementById('lightbox').classList.contains('abierto')) return;
  if (e.key === 'Escape') cerrar();
  if (e.key === 'ArrowRight') cambiar(1);
  if (e.key === 'ArrowLeft') cambiar(-1);
});

// SW propio de Stefy, para que no se mezcle con Cicla Bike
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(e => console.log('SW error', e));
  });
}

cargarFotos();