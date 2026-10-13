/* ============================================================
   Animaciones paso a paso que se mueven solas — js/animaciones.js
   ============================================================
   Para lo que se entiende mejor VIÉNDOLO MOVERSE (un mensaje que baja
   por las capas, viaja por el cable y sube por el otro lado), en vez
   de un GIF. Ventajas frente al GIF: se ve en los dos temas (usa las
   mismas clases d-* y variables --diapo-* que las diapositivas), se
   puede parar, ir paso a paso, el texto de cada paso se traduce y pesa
   casi nada.

   En el .html de la sesión:
     <div class="anim" data-anim="<nombre>" aria-label="…"></div>

   Cada animación se registra en un archivo aparte (js/anim-<tema>.js),
   cargado DESPUÉS de este:
     registrarAnimacion('<nombre>', {
       titulo: 'texto para el lector de pantalla',
       pasos: [ { texto: 'html corto' , … }, … ],
       crear(svg)      // dibuja lo fijo dentro del <svg> (viewBox incluido)
       pintar(i, p)    // dibuja el paso i; p va de 0 a 1 (0 = aún como
                       // el paso anterior, 1 = paso i terminado)
     });

   Comportamiento:
   - Arranca sola la primera vez que se ve en pantalla y da vueltas.
     Se para al salir de la pantalla y con la pestaña oculta.
   - Mandos: ‹ paso anterior · ⏸/▶ · N / M · paso siguiente ›.
     Al tocar ‹ o › se queda en pausa (para leer con calma).
   - Con prefers-reduced-motion NO arranca sola y los pasos cambian sin
     movimiento.
   - El texto del paso va en .diapo__texto; aria-live solo en pausa
     (en marcha cambiaría cada pocos segundos y aturdiría al lector).
   - Al imprimir: sin mandos, se queda el paso en el que esté.
   ============================================================ */

const ANIMACIONES = {};

function registrarAnimacion(nombre, def) {
  ANIMACIONES[nombre] = def;
}

(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const MS_MOVIMIENTO = 750;

  function reducido() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* Tiempo de lectura de un paso: alumnado que lee despacio. */
  function msLectura(html) {
    const texto = String(html).replace(/<[^>]+>/g, '');
    return 1800 + texto.length * 35;
  }

  function boton(clase, texto, etiqueta) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'diapos__boton ' + clase;
    b.textContent = texto;
    if (etiqueta) b.setAttribute('aria-label', etiqueta);
    return b;
  }

  function montar(caja) {
    const def = ANIMACIONES[caja.dataset.anim];
    if (!def) {
      caja.textContent = 'No existe la animación «' + caja.dataset.anim + '».';
      return;
    }
    caja.setAttribute('role', 'region');
    caja.setAttribute('aria-roledescription', 'animación');
    if (!caja.getAttribute('aria-label')) caja.setAttribute('aria-label', def.titulo || '');

    const escena = document.createElement('div');
    escena.className = 'diapo anim__escena';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', def.titulo || caja.getAttribute('aria-label') || '');
    svg.setAttribute('translate', 'no');
    svg.classList.add('notranslate');
    escena.appendChild(svg);

    const texto = document.createElement('p');
    texto.className = 'diapo__texto anim__texto';

    const mandos = document.createElement('div');
    mandos.className = 'diapos__mandos anim__mandos';
    const bAnt = boton('anim__ant', '‹', 'Paso anterior');
    const bPlay = boton('anim__play', '⏸ Pausa');
    const contador = document.createElement('p');
    contador.className = 'diapos__contador';
    const bSig = boton('diapos__boton--sig anim__sig', '›', 'Paso siguiente');
    const grupoCentro = document.createElement('div');
    grupoCentro.className = 'anim__centro';
    grupoCentro.append(bPlay, contador);
    mandos.append(bAnt, grupoCentro, bSig);

    caja.innerHTML = '';
    caja.append(escena, texto, mandos);

    const pintar = def.crear(svg);
    const pasos = def.pasos;
    const n = pasos.length;

    let i = 0;
    let fase = 'quieto';     // 'mueve' | 'lee' | 'quieto'
    let t0 = 0;
    let enMarcha = false;
    let visible = false;
    let yaArranco = false;
    let raf = 0;

    function mostrarTexto() {
      texto.innerHTML = pasos[i].texto;
      contador.textContent = (i + 1) + ' / ' + n;
      contador.setAttribute('aria-label', 'Paso ' + (i + 1) + ' de ' + n);
    }

    function dibujar(p) {
      pintar(i, Math.max(0, Math.min(1, p)));
    }

    function ir(nuevo, conMovimiento) {
      i = (nuevo + n) % n;
      mostrarTexto();
      if (conMovimiento && !reducido() && i !== 0) {
        fase = 'mueve';
        dibujar(0);
      } else {
        fase = 'lee';
        dibujar(1);
      }
      t0 = performance.now();
    }

    function bucle(ahora) {
      raf = 0;
      if (!enMarcha) return;
      const pasado = ahora - t0;
      if (fase === 'mueve') {
        const p = pasado / MS_MOVIMIENTO;
        /* suavizado: arranca y frena */
        dibujar(p < 1 ? (1 - Math.cos(Math.PI * p)) / 2 : 1);
        if (p >= 1) { fase = 'lee'; t0 = ahora; }
      } else if (pasado >= msLectura(pasos[i].texto) + (i === n - 1 ? 2500 : 0)) {
        ir(i + 1, true);
      }
      raf = requestAnimationFrame(bucle);
    }

    function ponerMarcha(si) {
      enMarcha = si;
      bPlay.textContent = si ? '⏸ Pausa' : '▶ Reproducir';
      bPlay.setAttribute('aria-pressed', si ? 'false' : 'true');
      texto.setAttribute('aria-live', si ? 'off' : 'polite');
      if (si && !raf) {
        if (fase === 'quieto') ir(i, false);
        t0 = performance.now();
        raf = requestAnimationFrame(bucle);
      }
      if (!si) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        if (fase === 'mueve') { fase = 'lee'; dibujar(1); }
      }
    }

    bPlay.addEventListener('click', () => {
      yaArranco = true;
      ponerMarcha(!enMarcha);
    });
    bAnt.addEventListener('click', () => { yaArranco = true; ponerMarcha(false); ir(i - 1, false); });
    bSig.addEventListener('click', () => { yaArranco = true; ponerMarcha(false); ir(i + 1, false); });
    caja.tabIndex = 0;
    caja.addEventListener('keydown', e => {
      if (e.target !== caja) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); bAnt.click(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); bSig.click(); }
    });

    /* Estado inicial: paso 1 quieto, en pausa. */
    ir(0, false);
    ponerMarcha(false);
    fase = 'lee';

    /* Arranca sola al verse por primera vez (salvo movimiento reducido),
       y se para fuera de pantalla. */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entradas => {
        visible = entradas[0].isIntersecting;
        if (visible && !yaArranco && !reducido()) { yaArranco = true; ponerMarcha(true); }
        else if (!visible && enMarcha) { ponerMarcha(false); caja.dataset.reanudar = '1'; }
        else if (visible && caja.dataset.reanudar) { delete caja.dataset.reanudar; ponerMarcha(true); }
      }, { threshold: 0.4 }).observe(caja);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && enMarcha) { ponerMarcha(false); caja.dataset.reanudar = '1'; }
      else if (!document.hidden && visible && caja.dataset.reanudar) { delete caja.dataset.reanudar; ponerMarcha(true); }
    });
  }

  function iniciarAnimaciones(contenedor) {
    (contenedor || document).querySelectorAll('.anim[data-anim]').forEach(caja => {
      if (caja.dataset.montada) return;
      caja.dataset.montada = '1';
      montar(caja);
    });
  }

  /* Ayudas para los archivos de animaciones. */
  window.ANIM = {
    NS,
    el(nombre, atributos, padre) {
      const e = document.createElementNS(NS, nombre);
      Object.keys(atributos || {}).forEach(k => e.setAttribute(k, atributos[k]));
      if (padre) padre.appendChild(e);
      return e;
    },
    texto(padre, x, y, contenido, clase, ancla) {
      const t = window.ANIM.el('text', { x, y, 'text-anchor': ancla || 'middle', class: clase || 'd-t' }, padre);
      t.textContent = contenido;
      return t;
    },
    mezcla(a, b, p) { return a + (b - a) * p; }
  };

  window.iniciarAnimaciones = iniciarAnimaciones;
  window.registrarAnimacion = registrarAnimacion;
})();
