/* ============================================================
   Escenas guiadas y preguntas de votación (06/11/2026)
   ============================================================
   Para dar la clase en la pantalla grande (Instalaciones UT2, PRL):
   en vez de leer texto, la clase mira una escena y, apartado a
   apartado, dice qué ve antes de que yo lo destape.

   ESCENA GUIADA
     <div class="escena" aria-label="Qué es la escena">
       <img src="data/…/escena.webp" width="900" height="506" alt="…">
       <div class="escena__paso" data-titulo="Pantalla"
            data-pregunta="¿Qué veis raro en la pantalla?">
         <p data-zona="165,245,60,50" data-tipo="mal">Texto del fallo.</p>
         <p data-zona="625,157,95,26" data-tipo="bien">Texto de lo que está bien.</p>
       </div>
       …más pasos…
     </div>
   data-zona = centro x, centro y, radio x, radio y de una elipse, en
   píxeles de la imagen (los de width y height). data-tipo = mal | bien.
   La imagen puede ser una ilustración de Canva o un SVG en línea con el
   mismo viewBox (en vez de <img>, un <svg viewBox="0 0 900 506">).

   Lo que sale: la imagen con un velo encima que deja ver solo las
   zonas del paso elegido, cada una con su número; un botón por paso,
   «Todo» y «Pantalla completa». Al elegir un paso, primero sale la
   pregunta a la clase y el botón «Destapar»; al destaparlo, las zonas
   y su explicación numerada.

   PREGUNTA DE VOTACIÓN
     <div class="votacion">
       <p class="votacion__pregunta">Al levantar una carga, la fuerza la hacen…</p>
       <ol class="votacion__opciones">          (data-letras="VF" para V/F)
         <li>los brazos</li><li data-correcta>las piernas</li>
       </ol>
       <div class="votacion__porque"><p>Por qué.</p></div>
     </div>
   Sin <ol>, es una pregunta abierta para la clase con su respuesta.
   La respuesta queda escondida hasta pulsar «Revelar». Sin JS se ve todo.

   RONDA (09/11/2026): dos o más .votacion seguidas, sin nada en
   medio, llevan delante el botón «📺 Proyectar la ronda» (ver
   montarRonda).
   ============================================================ */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  let contador = 0;

  function el(tag, clase, texto) {
    const e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  }
  function sv(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  /* ---------- Escena guiada ---------- */
  function montarEscena(caja) {
    if (caja.dataset.lista) return;
    caja.dataset.lista = '1';
    const id = 'escena-' + (++contador);
    const fondo = caja.querySelector(':scope > img, :scope > svg');
    if (!fondo) return;
    const W = Number(fondo.getAttribute('width')) ||
      Number((fondo.getAttribute('viewBox') || '').split(/\s+/)[2]) || 900;
    const H = Number(fondo.getAttribute('height')) ||
      Number((fondo.getAttribute('viewBox') || '').split(/\s+/)[3]) || 506;

    /* Lee los pasos y sus zonas antes de rehacer la caja. */
    const pasos = Array.from(caja.querySelectorAll(':scope > .escena__paso')).map(p => ({
      titulo: p.dataset.titulo || '',
      pregunta: p.dataset.pregunta || '',
      zonas: Array.from(p.querySelectorAll('[data-zona]')).map(z => {
        const [cx, cy, rx, ry] = z.dataset.zona.split(',').map(Number);
        return { cx, cy, rx, ry, tipo: z.dataset.tipo === 'bien' ? 'bien' : 'mal', html: z.innerHTML };
      })
    }));
    let n = 0;
    pasos.forEach(p => p.zonas.forEach(z => { z.n = ++n; }));
    caja.querySelectorAll(':scope > .escena__paso').forEach(p => p.remove());

    /* Lienzo: la imagen y el velo con agujeros. */
    const lienzo = el('div', 'escena__lienzo');
    fondo.replaceWith(lienzo);
    lienzo.appendChild(fondo);
    fondo.classList.add('escena__fondo');
    const capa = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'escena__capa', 'aria-hidden': 'true', translate: 'no', preserveAspectRatio: 'none' });
    const mascara = sv('mask', { id: id + '-m' });
    mascara.appendChild(sv('rect', { x: 0, y: 0, width: W, height: H, fill: '#fff' }));
    const agujeros = sv('g', {});
    mascara.appendChild(agujeros);
    const defs = sv('defs', {});
    defs.appendChild(mascara);
    capa.appendChild(defs);
    const velo = sv('rect', { x: 0, y: 0, width: W, height: H, class: 'escena__velo', mask: `url(#${id}-m)` });
    capa.appendChild(velo);
    const marcas = sv('g', {});
    capa.appendChild(marcas);
    lienzo.appendChild(capa);

    /* Mandos y panel. */
    const mandos = el('div', 'escena__mandos');
    mandos.setAttribute('role', 'group');
    mandos.setAttribute('aria-label', 'Apartados de la escena');
    const botones = pasos.map((p, i) => {
      const b = el('button', 'escena__boton');
      b.type = 'button';
      b.innerHTML = `<span class="escena__num" translate="no">${i + 1}</span> `;
      b.appendChild(document.createTextNode(p.titulo));
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => elegir(i));
      mandos.appendChild(b);
      return b;
    });
    const bTodo = el('button', 'escena__boton escena__boton--todo', 'Todo');
    bTodo.type = 'button';
    bTodo.setAttribute('aria-pressed', 'false');
    bTodo.addEventListener('click', () => elegir('todo'));
    mandos.appendChild(bTodo);
    if (caja.requestFullscreen) {
      const bPant = el('button', 'escena__boton escena__boton--pantalla', '⛶ Pantalla completa');
      bPant.type = 'button';
      bPant.addEventListener('click', () => {
        if (document.fullscreenElement === caja) document.exitFullscreen();
        else caja.requestFullscreen().catch(() => {});
      });
      document.addEventListener('fullscreenchange', () => {
        bPant.textContent = document.fullscreenElement === caja ? '✕ Salir de pantalla completa' : '⛶ Pantalla completa';
      });
      mandos.appendChild(bPant);
    }

    const panel = el('div', 'escena__panel');
    panel.setAttribute('aria-live', 'polite');
    caja.appendChild(lienzo);
    caja.appendChild(mandos);
    caja.appendChild(panel);
    caja.setAttribute('role', 'region');
    if (!caja.getAttribute('aria-label')) caja.setAttribute('aria-label', 'Escena');

    function dibujar(zonas) {
      agujeros.innerHTML = '';
      marcas.innerHTML = '';
      caja.classList.toggle('escena--velada', zonas.length > 0);
      zonas.forEach(z => {
        agujeros.appendChild(sv('ellipse', { cx: z.cx, cy: z.cy, rx: z.rx, ry: z.ry, fill: '#000' }));
        marcas.appendChild(sv('ellipse', { cx: z.cx, cy: z.cy, rx: z.rx, ry: z.ry, class: 'escena__aro escena__aro--' + z.tipo }));
        /* Número en el borde de arriba a la derecha, dentro de la imagen. */
        const r = Math.max(16, W / 36);
        let x = z.cx + z.rx * 0.72, y = z.cy - z.ry * 0.72;
        x = Math.min(W - r - 2, Math.max(r + 2, x));
        y = Math.min(H - r - 2, Math.max(r + 2, y));
        marcas.appendChild(sv('circle', { cx: x, cy: y, r, class: 'escena__chapa escena__chapa--' + z.tipo }));
        const t = sv('text', { x, y: y + r * 0.36, 'text-anchor': 'middle', class: 'escena__chapa-num', 'font-size': r * 1.05 });
        t.textContent = z.n;
        marcas.appendChild(t);
      });
    }

    function lista(zonas) {
      const ol = el('ol', 'escena__lista');
      zonas.forEach(z => {
        const li = el('li', 'escena__item escena__item--' + z.tipo);
        li.innerHTML = `<span class="escena__marca" aria-hidden="true">${z.tipo === 'bien' ? '✓' : '✗'}</span>` +
          `<span class="escena__nitem" translate="no">${z.n}</span>` +
          `<span class="solo-lector">${z.tipo === 'bien' ? 'Bien:' : 'Mal:'} </span>` +
          `<span class="escena__texto">${z.html}</span>`;
        ol.appendChild(li);
      });
      return ol;
    }

    function marcar(activo) {
      botones.forEach((b, i) => b.setAttribute('aria-pressed', String(activo === i)));
      bTodo.setAttribute('aria-pressed', String(activo === 'todo'));
    }

    function reposo() {
      marcar(null);
      dibujar([]);
      panel.innerHTML = '';
      panel.appendChild(el('p', 'escena__ayuda', 'Elige un apartado. Antes de destaparlo, que la clase diga qué ve.'));
    }

    function elegir(i) {
      if (i === 'todo') {
        marcar('todo');
        const todas = pasos.flatMap(p => p.zonas);
        dibujar(todas);
        panel.innerHTML = '';
        pasos.forEach((p, k) => {
          panel.appendChild(el('p', 'escena__subtitulo', `${k + 1}. ${p.titulo}`));
          panel.appendChild(lista(p.zonas));
        });
        return;
      }
      const p = pasos[i];
      marcar(i);
      dibujar([]);
      panel.innerHTML = '';
      const tit = el('p', 'escena__subtitulo', `${i + 1}. ${p.titulo}`);
      panel.appendChild(tit);
      if (p.pregunta) {
        const q = el('p', 'escena__pregunta');
        q.innerHTML = '<span aria-hidden="true">🤔 </span>';
        q.appendChild(document.createTextNode(p.pregunta));
        panel.appendChild(q);
      }
      const bDes = el('button', 'escena__destapar', 'Destapar');
      bDes.type = 'button';
      bDes.addEventListener('click', () => {
        dibujar(p.zonas);
        bDes.remove();
        panel.appendChild(lista(p.zonas));
        const sig = i + 1 < pasos.length ? i + 1 : null;
        if (sig != null) {
          const bSig = el('button', 'escena__siguiente', `Siguiente: ${pasos[sig].titulo} ›`);
          bSig.type = 'button';
          bSig.addEventListener('click', () => { elegir(sig); botones[sig].focus(); });
          panel.appendChild(bSig);
        }
      });
      panel.appendChild(bDes);
    }

    reposo();
  }

  /* ---------- Pregunta de votación ---------- */
  function montarVotacion(caja) {
    if (caja.dataset.lista) return;
    caja.dataset.lista = '1';
    const ol = caja.querySelector('.votacion__opciones');
    const porque = caja.querySelector('.votacion__porque');
    const cab = el('p', 'votacion__cab');
    cab.innerHTML = ol
      ? '<span aria-hidden="true">🗳️ </span>Votad a la vez <small>levanta la mano</small>'
      : '<span aria-hidden="true">💬 </span>Pregunta para la clase <small>la contestamos entre todos</small>';
    caja.prepend(cab);
    if (ol) {
      const letras = ol.dataset.letras === 'VF' ? ['V', 'F'] : ['A', 'B', 'C', 'D', 'E', 'F'];
      Array.from(ol.children).forEach((li, k) => {
        const l = el('span', 'votacion__letra', letras[k] || '?');
        l.setAttribute('translate', 'no');
        l.setAttribute('aria-hidden', 'true');
        li.prepend(l);
        li.setAttribute('aria-label', `${letras[k]}: ${li.textContent.slice(1).trim()}`);
      });
    }
    if (porque) porque.hidden = true;
    const b = el('button', 'votacion__revelar', ol ? 'Revelar la respuesta' : 'Ver la respuesta');
    b.type = 'button';
    b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', () => {
      const abierta = caja.classList.toggle('votacion--revelada');
      b.setAttribute('aria-expanded', String(abierta));
      b.textContent = abierta ? 'Ocultar la respuesta' : (ol ? 'Revelar la respuesta' : 'Ver la respuesta');
      if (porque) porque.hidden = !abierta;
      if (ol) Array.from(ol.children).forEach(li => {
        let s = li.querySelector('.votacion__ok');
        if (abierta && li.hasAttribute('data-correcta') && !s) {
          s = el('span', 'votacion__ok', '✓ Correcta');
          li.appendChild(s);
        } else if (!abierta && s) s.remove();
      });
    });
    (porque || ol || cab).after(b);
    if (porque) b.after(porque);
  }

  /* ---------- Ronda en la pantalla grande (09/11/2026) ----------
     Dos o más .votacion seguidas forman una ronda (la «Ronda rápida»
     de los repasos). Delante sale «📺 Proyectar la ronda»: pantalla
     completa, una pregunta cada vez y en letra grande, con ‹ Anterior,
     Siguiente › y Salir. También van las flechas y AvPág / RePág (las
     teclas del mando de presentaciones). Si el navegador no deja la
     pantalla completa, la ronda tapa la página igual. */
  function montarRonda(primera) {
    if (primera.parentElement && primera.parentElement.classList.contains('ronda')) return;
    const items = [];
    for (let n = primera; n && n.classList && n.classList.contains('votacion'); n = n.nextElementSibling) items.push(n);
    if (items.length < 2) return;

    const ronda = el('div', 'ronda');
    primera.before(ronda);
    const barra = el('div', 'ronda__barra');
    const bProy = el('button', 'ronda__proyectar', '📺 Proyectar la ronda');
    bProy.type = 'button';
    barra.appendChild(bProy);
    ronda.appendChild(barra);
    items.forEach(v => ronda.appendChild(v));

    const nav = el('div', 'ronda__nav');
    nav.hidden = true;
    const bAnt = el('button', null, '‹ Anterior');
    const cont = el('span', 'ronda__contador');
    const bSig = el('button', null, 'Siguiente ›');
    const bSalir = el('button', 'ronda__salir', '✕ Salir');
    [bAnt, bSig, bSalir].forEach(b => { b.type = 'button'; });
    cont.setAttribute('aria-live', 'polite');
    nav.append(bAnt, cont, bSig, bSalir);
    ronda.appendChild(nav);

    let actual = 0;
    let abierta = false;
    let enCompleta = false;

    function mostrar(i) {
      actual = Math.max(0, Math.min(items.length - 1, i));
      items.forEach((v, k) => v.classList.toggle('ronda__actual', k === actual));
      cont.textContent = `Pregunta ${actual + 1} de ${items.length}`;
      bAnt.disabled = actual === 0;
      bSig.disabled = actual === items.length - 1;
    }
    function teclas(e) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { mostrar(actual + 1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { mostrar(actual - 1); e.preventDefault(); }
      else if (e.key === 'Escape' && !enCompleta) cerrar();
    }
    function abrir() {
      abierta = true;
      ronda.classList.add('ronda--pantalla');
      document.documentElement.classList.add('ronda-abierta');
      barra.hidden = true;
      nav.hidden = false;
      mostrar(actual);
      document.addEventListener('keydown', teclas);
      if (ronda.requestFullscreen) ronda.requestFullscreen().catch(() => {});
      bSig.focus();
    }
    function cerrar() {
      if (!abierta) return;
      abierta = false;
      ronda.classList.remove('ronda--pantalla');
      document.documentElement.classList.remove('ronda-abierta');
      items.forEach(v => v.classList.remove('ronda__actual'));
      nav.hidden = true;
      barra.hidden = false;
      document.removeEventListener('keydown', teclas);
      if (document.fullscreenElement === ronda) document.exitFullscreen().catch(() => {});
      items[actual].scrollIntoView({ block: 'center' });
      bProy.focus({ preventScroll: true });
    }
    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement === ronda) enCompleta = true;
      else if (enCompleta) { enCompleta = false; cerrar(); }
    });
    bProy.addEventListener('click', abrir);
    bSalir.addEventListener('click', cerrar);
    bAnt.addEventListener('click', () => mostrar(actual - 1));
    bSig.addEventListener('click', () => mostrar(actual + 1));
  }

  window.iniciarEscenas = function (raiz) {
    (raiz || document).querySelectorAll('.escena').forEach(montarEscena);
    (raiz || document).querySelectorAll('.votacion').forEach(montarVotacion);
    (raiz || document).querySelectorAll('.votacion').forEach(v => {
      const prev = v.previousElementSibling;
      if (!prev || !prev.classList.contains('votacion')) montarRonda(v);
    });
  };
})();
