// STEFY NAIL - Versión 5
console.log('Stefy Nail v5');

// ===== CONFIG EXCEL - PEGAR ACA TU URL DE APPS SCRIPT =====
const SHEET_URL = "PEGAR_AQUI_TU_URL_DE_APPS_SCRIPT";
// ==========================================================

let principales = [];
let biblioteca = [];
let listaActual = [];
let actual = 0;

function existeImagen(src) {
  return new Promise((resolve) => {
    const test = new Image();
    test.onload = () => resolve(true);
    test.onerror = () => resolve(false);
    test.src = src;
  });
}

async function cargarFotos() {
  const encontradas = [];

  for (let i = 1; i <= 100; i++) {
    const src = `trabajo${i}.jpeg`;
    const existe = await existeImagen(src);
    if (existe) {
      encontradas.push(src);
    }
  }

  principales = encontradas.slice(0, 6);
  biblioteca = encontradas.slice(6);

  const galeria = document.getElementById('galeria');
  galeria.innerHTML = '';

  principales.forEach((src, i) => {
    const im = document.createElement('img');
    im.src = src;
    im.alt = 'Trabajo ' + (i + 1);
    im.dataset.index = i;
    galeria.appendChild(im);
  });

  const grid = document.getElementById('biblioGrid');
  grid.innerHTML = '';

  biblioteca.forEach((src, i) => {
    const im = document.createElement('img');
    im.src = src;
    im.alt = 'Trabajo ' + (i + 7);
    im.addEventListener('click', () => abrir(i, biblioteca));
    grid.appendChild(im);
  });

  if (biblioteca.length === 0) {
    document.getElementById('btnVerMas').style.display = 'none';
  }
}

function abrir(i, lista) {
  listaActual = lista;
  actual = i;
  mostrar();
  document.getElementById('lightbox').classList.add('abierto');
  document.body.style.overflow = 'hidden';
}

function mostrar() {
  const img = document.getElementById('fotoGrande');
  img.classList.remove('zoom');
  img.src = listaActual[actual];
  document.getElementById('contador').textContent = (actual + 1) + ' / ' + listaActual.length;
}

function cambiar(dir) {
  actual = (actual + dir + listaActual.length) % listaActual.length;
  mostrar();
}

function cerrar() {
  document.getElementById('lightbox').classList.remove('abierto');
  document.body.style.overflow = '';
}

document.getElementById('galeria').addEventListener('click', function (e) {
  const img = e.target.closest('img');
  if (!img) return;
  abrir(parseInt(img.dataset.index), principales);
});

document.getElementById('btnVerMas').addEventListener('click', function () {
  document.getElementById('biblioteca').classList.add('abierta');
  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);
});

document.getElementById('btnCerrarBiblio').addEventListener('click', function () {
  document.getElementById('biblioteca').classList.remove('abierta');
  document.body.style.overflow = '';
});

document.getElementById('btnCerrar').addEventListener('click', cerrar);

document.getElementById('btnPrev').addEventListener('click', function (e) {
  e.stopPropagation();
  cambiar(-1);
});

document.getElementById('btnNext').addEventListener('click', function (e) {
  e.stopPropagation();
  cambiar(1);
});

document.getElementById('lightbox').addEventListener('click', function (e) {
  if (e.target.id === 'lightbox') cerrar();
});

document.getElementById('fotoGrande').addEventListener('click', function (e) {
  e.stopPropagation();
  this.classList.toggle('zoom');
});

document.getElementById('btnReservar').addEventListener('click', reservar);

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

  if (!n) {
    alert('Escribí tu nombre 💖');
    return;
  }
  if (!ap) {
    alert('Escribí tu apellido 💖');
    return;
  }
  if (!tel) {
    alert('Escribí tu WhatsApp / teléfono');
    return;
  }
  if (!document.getElementById('fecha').value) {
    alert('Elegí una fecha');
    return;
  }
  if (!document.getElementById('hora').value) {
    alert('Elegí una hora');
    return;
  }

  try {
    if (SHEET_URL && !SHEET_URL.includes('PEGAR_AQUI')) {
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreCompleto,
          telefono: tel,
          servicio: s,
          fecha: f,
          hora: h
        })
      });
    }
  } catch (e) {
    console.log('Error guardando en Excel', e);
  }

  msgEl.style.display = 'block';
  msgEl.textContent = '¡Turno guardado! Te abrimos WhatsApp para confirmarlo 💖';

  let msg = `Hola Stefy! Soy ${nombreCompleto} (${tel}), quiero reservar ${s} para el ${f} a las ${h} 💅`;
  window.open('https://wa.me/5491151173182?text=' + encodeURIComponent(msg), '_blank');
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(e => console.log('SW error', e));
  });
}

cargarFotos();