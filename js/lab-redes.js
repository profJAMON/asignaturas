/* ============================================================
   Laboratorios de redes (Instalaciones) — js/lab-redes.js
   Cargado DESPUÉS de js/laboratorios.js (usa registrarLab y LAB).

   capas-osi   UT1 S5 (17/11/2026, idea de Protocol Explorer): las
               siete capas apiladas. Al tocar una capa, qué hace, sus
               protocolos, el aparato que trabaja en ella y cómo se
               llaman los datos. Al tocar un protocolo o un aparato, se
               enciende su capa. «Ponte a prueba»: sale un protocolo o
               un aparato y hay que tocar su capa.
               Los datos son los de la tabla «Qué hace cada capa» de
               la sesión: si cambia la tabla, cambiar también CAPAS.
   HTML: <div class="lab" data-lab="capas-osi" aria-label="…"></div>

   pantallas-cable  UT3 S5 (18/11/2026), «Monta tu cable»: eliges la
               pantalla de todo el cable (U, F, S) y la de cada par
               (U, F); se dibuja el corte y sale su nombre ISO, el
               habitual y dónde se usa. «Ponte a prueba»: sale un
               nombre de la tabla de la sesión y hay que montarlo.
               Los datos son los de las tablas «Apantallado o sin
               apantallar» y «La nomenclatura moderna» de la sesión.
   HTML: <div class="lab" data-lab="pantallas-cable" aria-label="…"></div>

   enlace-cobre  UT3 S6 (18/11/2026), «Monta el enlace»: las cinco piezas
               de un enlace (latiguillo, roseta, cable de pared, panel,
               latiguillo). Eliges la categoría de cada una y los metros
               de los tres cables; sale la categoría del enlace (la de la
               pieza más baja, resaltada) y si cumple 90 m de fijo y 10 m
               de latiguillos. No trae cargados los casos de la sesión
               (Ana y el plano del taller): son preguntas evaluables.
   HTML: <div class="lab" data-lab="enlace-cobre" aria-label="…"></div>

   que-cable   UT3 S9 (20/11/2026), «¿Qué cable pongo?»: eliges dos
               aparatos, el cable (directo o cruzado) y si tienen
               Auto-MDIX. Se dibujan los dos puertos (quién habla y quién
               escucha por 1-2 y por 3-6) y sale si se entienden. Los
               datos son los de la tabla MDI / MDI-X de la sesión: si
               cambia, cambiar también APARATOS_QC.
   HTML: <div class="lab" data-lab="que-cable" aria-label="…"></div>
   ============================================================ */

(function () {
  'use strict';
  if (typeof window.registrarLab !== 'function' || !window.LAB) return;
  const { el, boton, cabecera } = window.LAB;

  const CAPAS = {
    7: { nombre: 'Aplicación', hace: 'Es la que toca el usuario: el programa que pide o entrega la información.',
         prot: 'HTTP / HTTPS (web), SMTP (enviar correo), POP3 e IMAP (recibir correo), FTP / FTPS (archivos)', datos: 'Datos', aparato: '—' },
    6: { nombre: 'Presentación', hace: 'El formato de los datos: codificación, compresión.',
         prot: 'No tiene protocolos destacables.', datos: 'Datos', aparato: '—' },
    5: { nombre: 'Sesión', hace: 'Abre, mantiene y cierra la conversación entre las dos partes.',
         prot: 'SSL y su sucesor TLS, que cifran lo que se transmite', datos: 'Datos', aparato: '—' },
    4: { nombre: 'Transporte', hace: 'Cómo se trocea y si se garantiza o no la entrega.',
         prot: 'TCP (fiable, con confirmación) y UDP (rápido, sin confirmación)', datos: 'Segmento', aparato: '—' },
    3: { nombre: 'Red', hace: 'Llevar la información de origen a destino por la mejor ruta, aunque haya que cruzar varias redes. Da a cada equipo una dirección IP.',
         prot: 'IP', datos: 'Paquete', aparato: 'Router' },
    2: { nombre: 'Enlace de datos', hace: 'Entregar dentro de la misma red, usando direcciones MAC.',
         prot: 'Ethernet, Fast Ethernet, Gigabit Ethernet; ARP', datos: 'Trama', aparato: 'Switch' },
    1: { nombre: 'Física', hace: 'El medio en sí: cable, fibra u ondas, conectores, voltajes.',
         prot: 'El UTP, el RJ-45, la señal eléctrica', datos: 'Bits (ceros y unos)', aparato: 'El cable' }
  };
  /* Protocolos y aparatos: [nombre, capa, explicación al fallar]. */
  const COSAS = [
    ['HTTP', 7, 'Es el protocolo de la web: lo usa el navegador, el programa del usuario.'],
    ['HTTPS', 7, 'Es HTTP con cifrado: sigue siendo de la capa de aplicación.'],
    ['SMTP', 7, 'Sirve para enviar correo: lo usa el programa de correo.'],
    ['POP3', 7, 'Sirve para recibir correo: lo usa el programa de correo.'],
    ['IMAP', 7, 'Sirve para recibir correo: lo usa el programa de correo.'],
    ['FTP', 7, 'Sirve para pasar archivos: lo usa un programa.'],
    ['TLS', 5, 'Abre la conversación cifrada entre las dos partes.'],
    ['TCP', 4, 'Trocea y garantiza la entrega: es transporte.'],
    ['UDP', 4, 'Trocea sin garantizar la entrega: también es transporte.'],
    ['IP', 3, 'Lleva el paquete de una red a otra con la dirección IP.'],
    ['Router', 3, 'Mira la IP de destino para elegir el camino.'],
    ['Ethernet', 2, 'Entrega dentro de la misma red con direcciones MAC.'],
    ['ARP', 2, 'Busca la MAC de una IP: es la bisagra entre la capa 3 y la 2, y trabaja en la 2.'],
    ['Switch', 2, 'Mira la MAC de destino para entregar dentro de la red.'],
    ['Cable UTP', 1, 'Es el medio por el que viajan los bits.'],
    ['RJ-45', 1, 'Es un conector: el medio físico.'],
    ['Señal eléctrica', 1, 'Son los ceros y unos en el cable.']
  ];

  window.registrarLab('capas-osi', function (caja) {
    cabecera(caja, 'Toca y mira');
    const cuerpo = el('div', 'osi');
    const pila = el('div', 'osi__pila');
    pila.setAttribute('role', 'group');
    pila.setAttribute('aria-label', 'Las siete capas');
    const panel = el('div', 'osi__panel');
    const vivo = el('div', 'osi__vivo');
    vivo.setAttribute('aria-live', 'polite');
    panel.appendChild(vivo);
    cuerpo.append(pila, panel);

    const botones = {};
    [7, 6, 5, 4, 3, 2, 1].forEach(n => {
      const b = boton('', 'lab__boton osi__capa');
      b.innerHTML = '<span class="osi__num" translate="no">' + n + '</span> ' + CAPAS[n].nombre;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => (modo === 'prueba' ? responde(n) : elige(n)));
      botones[n] = b;
      pila.appendChild(b);
    });

    const chipsTit = el('p', 'lab__nota', 'Toca un protocolo o un aparato para ver su capa:');
    const chips = el('div', 'lab__fila osi__chips');
    const chipBot = {};
    COSAS.forEach(([n, c]) => {
      const b = boton(n, 'lab__boton osi__chip');
      b.setAttribute('translate', 'no');
      b.addEventListener('click', () => { modo = 'explorar'; ponModo(); elige(c, n); });
      chipBot[n] = b;
      chips.appendChild(b);
    });

    const pie = el('div', 'lab__fila osi__pie');
    const bPrueba = boton('Ponte a prueba', 'lab__boton');
    const bExplorar = boton('Explorar', 'lab__boton');
    pie.append(bExplorar, bPrueba);

    caja.append(cuerpo, chipsTit, chips, pie);

    let modo = 'explorar';
    let pregunta = null;
    let aciertos = 0, intentos = 0;

    function marca(n, cosa) {
      Object.keys(botones).forEach(k => {
        const on = Number(k) === n;
        botones[k].classList.toggle('lab__boton--activo', on);
        botones[k].setAttribute('aria-pressed', String(on));
      });
      Object.keys(chipBot).forEach(k => chipBot[k].classList.toggle('lab__boton--activo', k === cosa));
    }
    function elige(n, cosa) {
      const c = CAPAS[n];
      marca(n, cosa);
      vivo.innerHTML = '';
      if (cosa) vivo.appendChild(el('p', 'osi__aviso', cosa + ' trabaja en la capa ' + n + ': ' + c.nombre + '.'));
      vivo.appendChild(el('p', 'osi__titulo', 'Capa ' + n + ' · ' + c.nombre));
      const dl = el('dl', 'osi__datos');
      [['Qué hace', c.hace], ['Protocolos y ejemplos', c.prot], ['Los datos se llaman', c.datos], ['Aparato que trabaja aquí', c.aparato]].forEach(([t, v]) => {
        dl.appendChild(el('dt', '', t));
        dl.appendChild(el('dd', '', v));
      });
      vivo.appendChild(dl);
    }
    function nuevaPregunta() {
      let q;
      do { q = COSAS[Math.floor(Math.random() * COSAS.length)]; } while (pregunta && q[0] === pregunta[0] && COSAS.length > 1);
      pregunta = q;
      marca(0, null);
      vivo.innerHTML = '';
      vivo.appendChild(el('p', 'osi__titulo', '¿En qué capa trabaja…'));
      const g = el('p', 'osi__pregunta', q[0] + '?');
      g.setAttribute('translate', 'no');
      vivo.appendChild(g);
      vivo.appendChild(el('p', 'lab__nota', 'Toca su capa en la pila. Llevas ' + aciertos + ' de ' + intentos + '.'));
    }
    function responde(n) {
      if (!pregunta) return;
      intentos++;
      const bien = n === pregunta[1];
      if (bien) aciertos++;
      marca(pregunta[1], null);
      vivo.innerHTML = '';
      vivo.appendChild(el('p', bien ? 'osi__bien' : 'osi__mal',
        bien ? '✓ Bien: ' + pregunta[0] + ' está en la capa ' + pregunta[1] + ', ' + CAPAS[pregunta[1]].nombre + '.'
             : '✗ No es la ' + n + '. ' + pregunta[0] + ' está en la capa ' + pregunta[1] + ', ' + CAPAS[pregunta[1]].nombre + '.'));
      vivo.appendChild(el('p', '', pregunta[2]));
      vivo.appendChild(el('p', 'lab__nota', 'Llevas ' + aciertos + ' de ' + intentos + '.'));
      const otra = boton('Otra', 'lab__boton');
      otra.addEventListener('click', nuevaPregunta);
      vivo.appendChild(otra);
      pregunta = null;
    }
    function ponModo() {
      bPrueba.classList.toggle('lab__boton--activo', modo === 'prueba');
      bExplorar.classList.toggle('lab__boton--activo', modo === 'explorar');
      bPrueba.setAttribute('aria-pressed', String(modo === 'prueba'));
      bExplorar.setAttribute('aria-pressed', String(modo === 'explorar'));
      chipsTit.hidden = modo === 'prueba';
      chips.hidden = modo === 'prueba';
    }
    bPrueba.addEventListener('click', () => { modo = 'prueba'; aciertos = 0; intentos = 0; ponModo(); nuevaPregunta(); });
    bExplorar.addEventListener('click', () => { modo = 'explorar'; ponModo(); elige(7); });
    ponModo();
    elige(7);
  });

  /* ============================================================
     Monta tu cable (pantallas-cable)
     ============================================================ */
  const GLOBAL = {
    U: { boton: 'U · nada', lleva: 'Nada alrededor del conjunto' },
    F: { boton: 'F · lámina', lleva: 'Una lámina de aluminio alrededor de los cuatro pares' },
    S: { boton: 'S · malla', lleva: 'Una malla metálica alrededor de los cuatro pares' }
  };
  const PAR = {
    U: { boton: 'U · nada', lleva: 'nada en cada par' },
    F: { boton: 'F · lámina', lleva: 'una lámina de aluminio en cada par' }
  };
  /* [nombre habitual, dónde se usa]. Las cuatro primeras son las de la tabla de la sesión. */
  const CABLES = {
    'U/UTP': ['UTP', 'Oficinas, casas, el taller. El más usado: barato y flexible.'],
    'F/UTP': ['FTP', 'Entornos con algo de ruido.'],
    'U/FTP': ['STP (según el fabricante)', 'Mucho ruido; categorías altas.'],
    'S/FTP': ['STP (categoría 7 y superiores)', 'Mucho ruido; categorías altas. El más caro y rígido.'],
    'S/UTP': ['No sale en la tabla: es poco habitual', 'Entornos con algo de ruido.'],
    'F/FTP': ['No sale en la tabla: es poco habitual', 'Mucho ruido; categorías altas.']
  };
  const PRUEBA = ['U/UTP', 'F/UTP', 'U/FTP', 'S/FTP'];
  const COLORES = ['azul', 'naranja', 'verde', 'marron'];
  const NS = 'http://www.w3.org/2000/svg';

  function corte(g, p) {
    const n = (x) => Math.round(x * 10) / 10;
    const cx = 100, cy = 100, R = 82, d = R * 0.36, w = R * 0.13;
    let s = '<circle cx="100" cy="100" r="' + R + '" class="pc-cubierta"/>';
    if (g === 'F') s += '<circle cx="100" cy="100" r="' + (R - 7) + '" class="d-lamina" stroke-width="4"/>';
    if (g === 'S') s += '<circle cx="100" cy="100" r="' + (R - 7) + '" class="d-malla" stroke-width="5"/>';
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy], i) => {
      const px = cx + sx * d, py = cy + sy * d, ang = sx * sy > 0 ? 45 : -45;
      if (p === 'F') s += '<ellipse cx="' + n(px) + '" cy="' + n(py) + '" rx="' + n(w * 2.25) + '" ry="' + n(w * 1.35) + '" transform="rotate(' + ang + ' ' + n(px) + ' ' + n(py) + ')" class="d-lamina" stroke-width="3"/>';
      const a = ang * Math.PI / 180, ox = Math.cos(a) * w * 1.02, oy = Math.sin(a) * w * 1.02;
      s += '<circle cx="' + n(px - ox) + '" cy="' + n(py - oy) + '" r="' + n(w) + '" class="d-h-' + COLORES[i] + '"/>';
      s += '<circle cx="' + n(px + ox) + '" cy="' + n(py + oy) + '" r="' + n(w) + '" class="d-h-blanco"/>';
      s += '<circle cx="' + n(px + ox) + '" cy="' + n(py + oy) + '" r="' + n(w * 0.42) + '" class="d-h-' + COLORES[i] + '"/>';
    });
    return s;
  }

  window.registrarLab('pantallas-cable', function (caja) {
    cabecera(caja, 'Toca y mira');
    const cuerpo = el('div', 'pc');
    const dibujo = el('div', 'pc__dibujo');
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('role', 'img');
    svg.setAttribute('translate', 'no');
    dibujo.appendChild(svg);

    const mandos = el('div', 'pc__mandos');
    const filaG = el('div', 'lab__fila');
    const filaP = el('div', 'lab__fila');
    filaG.setAttribute('role', 'group');
    filaP.setAttribute('role', 'group');
    filaG.setAttribute('aria-label', 'Pantalla de todo el cable');
    filaP.setAttribute('aria-label', 'Pantalla de cada par');
    const botG = {}, botP = {};
    Object.keys(GLOBAL).forEach(k => {
      const b = boton(GLOBAL[k].boton, 'lab__boton');
      b.setAttribute('translate', 'no');
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => { g = k; pinta(); });
      botG[k] = b; filaG.appendChild(b);
    });
    Object.keys(PAR).forEach(k => {
      const b = boton(PAR[k].boton, 'lab__boton');
      b.setAttribute('translate', 'no');
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => { p = k; pinta(); });
      botP[k] = b; filaP.appendChild(b);
    });
    const nombre = el('p', 'pc__nombre');
    nombre.setAttribute('translate', 'no');
    const leyenda = el('p', 'pc__leyenda', 'La letra de antes de la barra es la pantalla de todo el cable; la de después, la de cada par.');
    const vivo = el('div', 'pc__vivo');
    vivo.setAttribute('aria-live', 'polite');
    mandos.append(el('p', 'pc__fila-tit', '1. Pantalla de todo el cable'), filaG,
                  el('p', 'pc__fila-tit', '2. Pantalla de cada par'), filaP, nombre, leyenda, vivo);
    cuerpo.append(dibujo, mandos);

    const pie = el('div', 'lab__fila pc__pie');
    const bExplorar = boton('Explorar', 'lab__boton');
    const bPrueba = boton('Ponte a prueba', 'lab__boton');
    pie.append(bExplorar, bPrueba);
    caja.append(cuerpo, pie);

    let g = 'U', p = 'U', modo = 'explorar', pregunta = null, aciertos = 0, intentos = 0;

    function nombreDe() { return g + '/' + p + 'TP'; }
    function pinta() {
      svg.innerHTML = corte(g, p);
      svg.setAttribute('aria-label', 'Corte del cable: ' + GLOBAL[g].lleva.toLowerCase() + ' y ' + PAR[p].lleva + '.');
      Object.keys(botG).forEach(k => { botG[k].classList.toggle('lab__boton--activo', k === g); botG[k].setAttribute('aria-pressed', String(k === g)); });
      Object.keys(botP).forEach(k => { botP[k].classList.toggle('lab__boton--activo', k === p); botP[k].setAttribute('aria-pressed', String(k === p)); });
      nombre.innerHTML = '<span class="pc__letra">' + g + '</span>/<span class="pc__letra">' + p + '</span>TP';
      if (modo === 'explorar') explica();
    }
    function explica() {
      const c = CABLES[nombreDe()];
      vivo.innerHTML = '';
      const dl = el('dl', 'pc__datos');
      [['Qué lleva', GLOBAL[g].lleva + ' y ' + PAR[p].lleva + '.'], ['Nombre habitual', c[0]], ['Dónde se usa', c[1]]].forEach(([t, v]) => {
        dl.appendChild(el('dt', '', t));
        dl.appendChild(el('dd', '', v));
      });
      vivo.appendChild(dl);
    }
    function nuevaPregunta() {
      let q;
      do { q = PRUEBA[Math.floor(Math.random() * PRUEBA.length)]; } while (q === pregunta && PRUEBA.length > 1);
      pregunta = q;
      vivo.innerHTML = '';
      vivo.appendChild(el('p', 'pc__fila-tit', 'Monta este cable con los botones de arriba y pulsa «Comprobar»:'));
      const qq = el('p', 'pc__pregunta', q);
      qq.setAttribute('translate', 'no');
      vivo.appendChild(qq);
      const comprobar = boton('Comprobar', 'lab__boton');
      comprobar.addEventListener('click', responde);
      vivo.appendChild(comprobar);
      vivo.appendChild(el('p', 'lab__nota', 'Llevas ' + aciertos + ' de ' + intentos + '.'));
    }
    function responde() {
      intentos++;
      const [qg, qp] = [pregunta[0], pregunta[2]];
      const bien = g === qg && p === qp;
      if (bien) aciertos++;
      vivo.innerHTML = '';
      nombre.hidden = false;
      vivo.appendChild(el('p', bien ? 'pc__bien' : 'pc__mal', bien ? '✓ Bien: eso es un ' + pregunta + '.' : '✗ Has montado un ' + nombreDe() + ', no un ' + pregunta + '.'));
      if (!bien) {
        if (g !== qg) vivo.appendChild(el('p', '', 'Todo el cable (la letra de antes de la barra, ' + qg + '): ' + GLOBAL[qg].lleva.toLowerCase() + '.'));
        if (p !== qp) vivo.appendChild(el('p', '', 'Cada par (la letra de después, ' + qp + '): ' + PAR[qp].lleva + '.'));
      }
      vivo.appendChild(el('p', 'lab__nota', 'Llevas ' + aciertos + ' de ' + intentos + '.'));
      const otra = boton('Otro', 'lab__boton');
      otra.addEventListener('click', () => { g = 'U'; p = 'U'; nombre.hidden = true; pinta(); nuevaPregunta(); });
      vivo.appendChild(otra);
    }
    function ponModo() {
      bPrueba.classList.toggle('lab__boton--activo', modo === 'prueba');
      bExplorar.classList.toggle('lab__boton--activo', modo === 'explorar');
      bPrueba.setAttribute('aria-pressed', String(modo === 'prueba'));
      bExplorar.setAttribute('aria-pressed', String(modo === 'explorar'));
      leyenda.hidden = modo === 'prueba';
      nombre.hidden = modo === 'prueba';
      /* En la prueba, los botones sin la letra: hay que saber qué significa cada una. */
      Object.keys(botG).forEach(k => { botG[k].textContent = modo === 'prueba' ? GLOBAL[k].boton.split(' · ')[1] : GLOBAL[k].boton; });
      Object.keys(botP).forEach(k => { botP[k].textContent = modo === 'prueba' ? PAR[k].boton.split(' · ')[1] : PAR[k].boton; });
    }
    bExplorar.addEventListener('click', () => { modo = 'explorar'; ponModo(); pinta(); });
    bPrueba.addEventListener('click', () => { modo = 'prueba'; aciertos = 0; intentos = 0; g = 'U'; p = 'U'; ponModo(); pinta(); nuevaPregunta(); });
    ponModo();
    pinta();
  });

  /* ============================================================
     Monta el enlace (enlace-cobre)
     ============================================================ */
  const CATS_ENLACE = ['5e', '6', '6A'];
  const PIEZAS_ENLACE = [
    { nombre: 'Latiguillo del puesto', cat: '6', metros: 2, tipo: 'lat' },
    { nombre: 'Roseta', cat: '6' },
    { nombre: 'Cable de pared', cat: '6', metros: 70, tipo: 'fijo' },
    { nombre: 'Panel de parcheo', cat: '6' },
    { nombre: 'Latiguillo del armario', cat: '6', metros: 3, tipo: 'lat' }
  ];

  window.registrarLab('enlace-cobre', function (caja) {
    cabecera(caja, 'Toca y mira');
    caja.appendChild(el('p', 'lab__nota', 'Del PC (a la izquierda) al switch (a la derecha). Cambia la categoría de cada pieza y los metros de los cables.'));
    const cadena = el('div', 'ec');
    const piezas = PIEZAS_ENLACE.map(p => Object.assign({}, p));
    const tarjetas = [];
    piezas.forEach((p, i) => {
      const t = el('div', 'ec__pieza');
      t.appendChild(el('span', 'ec__nombre', p.nombre));
      const sel = document.createElement('select');
      sel.className = 'lab__entrada ec__cat';
      sel.setAttribute('aria-label', 'Categoría: ' + p.nombre);
      CATS_ENLACE.forEach(c => { const o = el('option', '', 'Cat ' + c); o.value = c; if (c === p.cat) o.selected = true; sel.appendChild(o); });
      sel.addEventListener('change', () => { p.cat = sel.value; pinta(); });
      t.appendChild(sel);
      if (p.metros !== undefined) {
        const fila = el('label', 'ec__metros');
        const n = document.createElement('input');
        n.type = 'number'; n.min = '0'; n.max = p.tipo === 'fijo' ? '150' : '20'; n.step = '1';
        n.value = String(p.metros);
        n.className = 'lab__entrada';
        n.setAttribute('aria-label', 'Metros: ' + p.nombre);
        n.addEventListener('input', () => { const v = parseInt(n.value, 10); p.metros = isNaN(v) || v < 0 ? 0 : v; pinta(); });
        fila.append(n, el('span', '', 'm'));
        t.appendChild(fila);
      }
      tarjetas.push(t);
      cadena.appendChild(t);
    });
    const vivo = el('div', 'ec__resultado');
    vivo.setAttribute('aria-live', 'polite');
    caja.append(cadena, vivo);

    function linea(ok, texto) {
      return el('p', ok ? 'ec__ok' : 'ec__mal', (ok ? '✓ ' : '✗ ') + texto);
    }
    function pinta() {
      const minimo = Math.min(...piezas.map(p => CATS_ENLACE.indexOf(p.cat)));
      const cat = CATS_ENLACE[minimo];
      const debiles = piezas.filter(p => CATS_ENLACE.indexOf(p.cat) === minimo);
      const todasIguales = debiles.length === piezas.length;
      piezas.forEach((p, i) => tarjetas[i].classList.toggle('ec__pieza--debil', !todasIguales && CATS_ENLACE.indexOf(p.cat) === minimo));
      const fijo = piezas[2].metros, l1 = piezas[0].metros, l2 = piezas[4].metros, lat = l1 + l2, total = fijo + lat;
      vivo.innerHTML = '';
      const t = el('p', 'ec__titulo');
      t.appendChild(document.createTextNode('Categoría del enlace: '));
      const c = el('span', 'ec__cat-final', 'Cat ' + cat);
      c.setAttribute('translate', 'no');
      t.appendChild(c);
      vivo.appendChild(t);
      vivo.appendChild(el('p', '', todasIguales
        ? 'Todas las piezas son de la misma categoría.'
        : 'La marca la pieza más baja (resaltada): ' + debiles.map(p => p.nombre.toLowerCase()).join(' y ') + '.'));
      const okFijo = fijo <= 90, okLat = lat <= 10;
      vivo.appendChild(linea(okFijo, 'Cable fijo: ' + fijo + ' m (como mucho 90 m)'));
      vivo.appendChild(linea(okLat, 'Latiguillos: ' + l1 + ' + ' + l2 + ' = ' + lat + ' m (como mucho 10 m)'));
      vivo.appendChild(el('p', 'lab__nota', 'Total: ' + total + ' m.'));
      vivo.appendChild(el('p', okFijo && okLat ? 'ec__ok ec__veredicto' : 'ec__mal ec__veredicto',
        okFijo && okLat ? 'El enlace cumple.' : 'El enlace no cumple, aunque el total sea de ' + total + ' m: mira las dos condiciones.'));
      if (!(okFijo && okLat) && total > 100) vivo.lastChild.textContent = 'El enlace no cumple: pasa de 100 m. No se estira el cable: otro switch más cerca, o fibra.';
    }
    pinta();
  });

  /* ============================================================
     ¿Qué cable pongo? (que-cable)
     ============================================================ */
  const APARATOS_QC = [
    ['PC', 'MDI'], ['Portátil', 'MDI'], ['Servidor', 'MDI'], ['Impresora de red', 'MDI'],
    ['Router', 'MDI'], ['Switch', 'MDI-X'], ['Hub', 'MDI-X']
  ];

  window.registrarLab('que-cable', function (caja) {
    cabecera(caja, 'Toca y mira');
    caja.appendChild(el('p', 'lab__nota', 'Elige los dos aparatos y el cable. Mira si lo que dice uno llega a donde escucha el otro.'));
    const mandos = el('div', 'qc__mandos');
    function selector(etiqueta, inicial) {
      const lab = el('label', 'qc__campo');
      lab.appendChild(el('span', 'qc__etiqueta', etiqueta));
      const sel = document.createElement('select');
      sel.className = 'lab__entrada';
      APARATOS_QC.forEach(([n], i) => { const o = el('option', '', n); o.value = String(i); if (i === inicial) o.selected = true; sel.appendChild(o); });
      sel.addEventListener('change', pinta);
      lab.appendChild(sel);
      mandos.appendChild(lab);
      return sel;
    }
    const selA = selector('Aparato A', 0);
    const selB = selector('Aparato B', 5);

    const filaCable = el('div', 'lab__fila');
    filaCable.setAttribute('role', 'group');
    filaCable.setAttribute('aria-label', 'Cable');
    filaCable.appendChild(el('span', 'qc__etiqueta', 'Cable:'));
    const bDir = boton('Directo', 'lab__boton');
    const bCru = boton('Cruzado', 'lab__boton');
    filaCable.append(bDir, bCru);
    bDir.addEventListener('click', () => { cruzado = false; pinta(); });
    bCru.addEventListener('click', () => { cruzado = true; pinta(); });

    const auto = el('label', 'qc__auto');
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.addEventListener('change', pinta);
    auto.append(chk, el('span', '', ' Los dos tienen Auto-MDIX'));

    const dibujo = el('div', 'qc__dibujo');
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 360 150');
    svg.setAttribute('role', 'img');
    svg.setAttribute('translate', 'no');
    dibujo.appendChild(svg);
    const vivo = el('div', 'qc__resultado');
    vivo.setAttribute('aria-live', 'polite');
    caja.append(mandos, filaCable, auto, dibujo, vivo);

    let cruzado = false;
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

    /* Pines efectivos de un puerto: [lo que hace por 1-2, lo que hace por 3-6]. */
    function pines(tipo, girado) {
      const mdi = tipo === 'MDI' ? !girado : girado;
      return mdi ? ['habla', 'escucha'] : ['escucha', 'habla'];
    }
    function cajaPuerto(x, nombre, tipo, p) {
      let s = '<rect x="' + x + '" y="8" width="104" height="112" rx="8" class="qc-caja"/>';
      s += '<text x="' + (x + 52) + '" y="30" text-anchor="middle" class="qc-t qc-negrita">' + esc(nombre) + '</text>';
      s += '<text x="' + (x + 52) + '" y="47" text-anchor="middle" class="qc-tipo">' + esc(tipo) + '</text>';
      [['1-2', p[0], 56], ['3-6', p[1], 86]].forEach(([n, que, y]) => {
        s += '<rect x="' + (x + 8) + '" y="' + y + '" width="88" height="24" rx="12" class="qc-pila qc-pila--' + (que === 'habla' ? 'habla' : 'oye') + '"/>';
        s += '<text x="' + (x + 52) + '" y="' + (y + 17) + '" text-anchor="middle" class="qc-t">' + n + ' ' + que + '</text>';
      });
      return s;
    }
    function pinta() {
      const a = APARATOS_QC[Number(selA.value)], b = APARATOS_QC[Number(selB.value)];
      const conAuto = chk.checked;
      bDir.classList.toggle('lab__boton--activo', !cruzado);
      bCru.classList.toggle('lab__boton--activo', cruzado);
      bDir.setAttribute('aria-pressed', String(!cruzado));
      bCru.setAttribute('aria-pressed', String(cruzado));
      const toca = a[1] === b[1] ? 'cruzado' : 'directo';
      const sinAutoVa = (cruzado ? 'cruzado' : 'directo') === toca;
      /* Con Auto-MDIX, si el cable no es el que toca, B se da la vuelta. */
      const giraB = conAuto && !sinAutoVa;
      const pa = pines(a[1], false), pb = pines(b[1], giraB);
      const va = sinAutoVa || conAuto;
      let s = cajaPuerto(8, a[0], a[1], pa) + cajaPuerto(248, b[0], b[1] + (giraB ? ' (girado)' : ''), pb);
      const clase = va ? 'qc-cable qc-cable--ok' : 'qc-cable qc-cable--mal';
      const yA = [68, 98];
      const yB = cruzado ? [98, 68] : [68, 98];
      s += '<line x1="112" y1="' + yA[0] + '" x2="248" y2="' + yB[0] + '" class="' + clase + '"/>';
      s += '<line x1="112" y1="' + yA[1] + '" x2="248" y2="' + yB[1] + '" class="' + clase + '"/>';
      s += '<text x="180" y="142" text-anchor="middle" class="qc-t qc-tenue">cable ' + (cruzado ? 'cruzado' : 'directo') + '</text>';
      s += '<text x="180" y="40" text-anchor="middle" class="' + (va ? 'qc-marca qc-marca--ok' : 'qc-marca qc-marca--mal') + '">' + (va ? '✓' : '✗') + '</text>';
      svg.innerHTML = s;
      svg.setAttribute('aria-label', a[0] + ' (' + a[1] + ') y ' + b[0] + ' (' + b[1] + ') con cable ' + (cruzado ? 'cruzado' : 'directo') + (va ? ': se entienden.' : ': no se entienden.'));

      vivo.innerHTML = '';
      vivo.appendChild(el('p', '', toca === 'directo'
        ? a[0] + ' es ' + a[1] + ' y ' + b[0] + ' es ' + b[1] + ': tipos distintos → cable directo.'
        : a[0] + ' y ' + b[0] + ': los dos son ' + a[1] + ', tipos iguales → cable cruzado.'));
      if (sinAutoVa) {
        vivo.appendChild(el('p', 'qc__ok', '✓ Se entienden: lo que dice uno por su par llega a donde escucha el otro.'));
      } else if (conAuto) {
        vivo.appendChild(el('p', 'qc__ok', '✓ Se entienden gracias al Auto-MDIX: el puerto de B (' + b[0] + ') nota que le hablan por donde él habla y se da la vuelta solo.'));
      } else {
        vivo.appendChild(el('p', 'qc__mal', '✗ No se entienden: los dos hablan por el mismo par y nadie escucha. Con estos aparatos, sin Auto-MDIX, toca cable ' + toca + '.'));
      }
    }
    pinta();
  });
})();
