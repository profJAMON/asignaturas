/* ============================================================
   Topologías físicas en dibujo (Instalaciones UT3).

   - window.DIBUJOS: dibujos fijos para los test (campo "dibujo" de
     una pregunta del .json). Son los de las fichas de Carles de otros
     años, redibujados.
   - GENERADORES['topologia-dibujo']: cada tanda dibuja redes nuevas
     (número de equipos, forma y estilo al azar) y pregunta qué
     topología es.

   Los dibujos van sobre la hoja de cuaderno de las actividades:
   trazo en tinta (currentColor) y los aparatos centrales en el
   color de tinta azul (--accent). Clases .tp-* en css/estilos.css,
   «Dibujos en los ejercicios». Sin texto dentro: el aria-label
   describe lo que se ve SIN decir qué topología es.
   ============================================================ */
(function () {
  const W = 260;
  const H = 170;
  const CX = 130;
  const CY = 85;

  const al = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const elige = lista => lista[Math.floor(Math.random() * lista.length)];
  const r1 = n => Math.round(n * 10) / 10;
  function baraja(lista) {
    const l = lista.slice();
    for (let i = l.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [l[i], l[j]] = [l[j], l[i]];
    }
    return l;
  }

  /* ---------- Piezas ---------- */

  function linea(a, b) {
    return `<line class="tp-l" x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}"/>`;
  }
  /* Dos cables paralelos (doble anillo). */
  function lineaDoble(a, b) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const d = Math.hypot(dx, dy) || 1;
    const ox = (-dy / d) * 3;
    const oy = (dx / d) * 3;
    return linea([a[0] + ox, a[1] + oy], [b[0] + ox, b[1] + oy]) +
      linea([a[0] - ox, a[1] - oy], [b[0] - ox, b[1] - oy]);
  }
  /* Punta de flecha a mitad de un cable, mirando de a hacia b. */
  function flecha(a, b) {
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const p = (r, g) => [mx + r * Math.cos(ang + g), my + r * Math.sin(ang + g)];
    const [p1, p2, p3] = [p(5, 0), p(5, 2.5), p(5, -2.5)];
    return `<path class="tp-p" d="M${r1(p1[0])} ${r1(p1[1])}L${r1(p2[0])} ${r1(p2[1])}L${r1(p3[0])} ${r1(p3[1])}Z"/>`;
  }
  function pc([x, y]) {
    return `<rect class="tp-e" x="${r1(x - 10)}" y="${r1(y - 9)}" width="20" height="13" rx="1.5"/>` +
      `<path class="tp-l" d="M${r1(x)} ${r1(y + 4)}V${r1(y + 8)}M${r1(x - 6)} ${r1(y + 8)}H${r1(x + 6)}"/>`;
  }
  function servidor([x, y]) {
    return `<rect class="tp-e" x="${r1(x - 7)}" y="${r1(y - 12)}" width="14" height="24" rx="1.5"/>` +
      `<path class="tp-l" d="M${r1(x - 4)} ${r1(y - 6)}H${r1(x + 4)}M${r1(x - 4)} ${r1(y - 2)}H${r1(x + 4)}"/>`;
  }
  function aparatoCaja([x, y], ancho) {
    const w = ancho || 34;
    let s = `<rect class="tp-c" x="${r1(x - w / 2)}" y="${r1(y - 6)}" width="${w}" height="12" rx="2"/>`;
    const n = w > 30 ? 4 : 3;
    for (let i = 0; i < n; i++) {
      const px = x - w / 2 + (w / (n + 1)) * (i + 1);
      s += `<circle class="tp-p" cx="${r1(px)}" cy="${r1(y)}" r="1.4"/>`;
    }
    return s;
  }
  const nodo = ([x, y]) => `<circle class="tp-e" cx="${r1(x)}" cy="${r1(y)}" r="7"/>`;
  const nodoCentral = ([x, y]) => `<circle class="tp-c" cx="${r1(x)}" cy="${r1(y)}" r="9.5"/>`;
  const terminador = ([x, y]) => `<rect class="tp-t" x="${r1(x - 2.5)}" y="${r1(y - 6)}" width="5" height="12" rx="1"/>`;

  /* Estilo «equipos» (ordenadores y switches) o «esquema» (círculos). */
  function estilo(nombre) {
    if (nombre === 'esquema') return { equipo: nodo, aparato: p => nodoCentral(p), esquema: true };
    return { equipo: pc, aparato: (p, w) => aparatoCaja(p, w), esquema: false };
  }

  function svg(contenido, alt) {
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${alt}">${contenido}</svg>`;
  }

  /* Puntos en una elipse alrededor del centro. */
  function enElipse(n, rx, ry, giro, cx, cy) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = ((giro || -90) + (360 / n) * i) * Math.PI / 180;
      pts.push([(cx || CX) + rx * Math.cos(a), (cy || CY) + ry * Math.sin(a)]);
    }
    return pts;
  }

  /* ---------- Topologías ---------- */

  function puntoAPunto(o = {}) {
    const e = estilo(o.estilo || elige(['equipos', 'esquema']));
    const j = o.inclina !== undefined ? o.inclina : al(-30, 30);
    const a = [60, CY + j];
    const b = [200, CY - j];
    return {
      tipo: 'punto a punto',
      svg: svg(linea(a, b) + e.equipo(a) + e.equipo(b), 'Dos equipos unidos por un solo cable, sin nada más.')
    };
  }

  function bus(o = {}) {
    const n = o.n || al(4, 6);
    const reparto = o.reparto || elige(['arriba', 'alterno']);
    const e = estilo(o.estilo || elige(['equipos', 'equipos', 'esquema']));
    const y = reparto === 'arriba' ? 115 : CY;
    let lineas = linea([18, y], [242, y]);
    let piezas = terminador([18, y]) + terminador([242, y]);
    const paso = 200 / (n - 1);
    for (let i = 0; i < n; i++) {
      const x = 30 + paso * i;
      const arriba = reparto === 'arriba' || i % 2 === 0;
      const p = [x, arriba ? y - 52 : y + 52];
      lineas += linea([x, y], p);
      piezas += (o.servidor === i) ? servidor(p) : e.equipo(p);
    }
    return {
      tipo: 'bus',
      svg: svg(lineas + piezas, `${n} equipos colgados de un mismo cable que va de lado a lado, con una pieza al final de cada punta.`)
    };
  }

  function anillo(o = {}) {
    const n = o.n || al(4, 7);
    const doble = !!o.doble;
    const conFlechas = o.flechas !== undefined ? o.flechas : (!doble && Math.random() < 0.5);
    const e = estilo(o.estilo || elige(['equipos', 'esquema']));
    const pts = enElipse(n, 96, 62, o.giro !== undefined ? o.giro : elige([-90, -90 + 180 / n]));
    let lineas = '';
    let marcas = '';
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % n];
      lineas += doble ? lineaDoble(p, q) : linea(p, q);
      if (conFlechas) marcas += flecha(p, q);
    });
    const piezas = pts.map(e.equipo).join('');
    const alt = doble
      ? `${n} equipos; cada uno unido con el de al lado por dos cables, formando un círculo cerrado.`
      : `${n} equipos; cada uno unido con el de al lado, formando un círculo cerrado.${conFlechas ? ' Unas flechas marcan el sentido en que van los datos.' : ''}`;
    return { tipo: 'anillo', doble, svg: svg(lineas + marcas + piezas, alt) };
  }

  function estrella(o = {}) {
    const n = o.n || al(4, 7);
    const forma = o.forma || elige(['centro', 'centro', 'arriba']);
    const e = estilo(o.estilo || elige(['equipos', 'equipos', 'esquema']));
    let pts;
    let centro;
    if (forma === 'arriba') {
      centro = [CX, 26];
      const fila1 = Math.ceil(n / 2);
      const fila2 = n - fila1;
      pts = [];
      for (let i = 0; i < fila1; i++) pts.push([CX + (i - (fila1 - 1) / 2) * (200 / Math.max(fila1, 2)), 100]);
      for (let i = 0; i < fila2; i++) pts.push([CX + (i - (fila2 - 1) / 2) * (200 / Math.max(fila2, 2)) + 18, 145]);
    } else {
      centro = [CX, CY];
      pts = enElipse(n, 100, 62, elige([-90, -60, -45]));
    }
    const lineas = pts.map(p => linea(centro, p)).join('');
    const piezas = pts.map((p, i) => (o.servidor === i ? servidor(p) : e.equipo(p))).join('') + e.aparato(centro, 40);
    return {
      tipo: 'estrella',
      svg: svg(lineas + piezas, `Un aparato y ${n} equipos; cada equipo tiene su propio cable hasta ese aparato.`)
    };
  }

  function arbol(o = {}) {
    const forma = o.forma || elige(['ramas', 'ramas', 'radial']);
    if (forma === 'radial') {
      const k = o.k || al(3, 4);
      const e = estilo('esquema');
      const giro = elige([-90, -45]);
      let lineas = '';
      let piezas = nodoCentral([CX, CY]);
      for (let i = 0; i < k; i++) {
        const a = (giro + (360 / k) * i) * Math.PI / 180;
        const r = [CX + 42 * Math.cos(a), CY + 36 * Math.sin(a)];
        lineas += linea([CX, CY], r);
        piezas += nodoCentral(r);
        [-0.42, 0.42].forEach(g => {
          const h = [CX + 100 * Math.cos(a + g), CY + 72 * Math.sin(a + g)];
          lineas += linea(r, h);
          piezas += e.equipo(h);
        });
      }
      return {
        tipo: 'árbol',
        svg: svg(lineas + piezas, `Un aparato en el centro unido a ${k} aparatos; de cada uno de ellos salen dos equipos.`)
      };
    }
    const k = o.k || al(2, 3);
    const m = o.m || (k === 2 ? al(2, 4) : al(2, 3));
    const e = estilo(o.estilo || elige(['equipos', 'equipos', 'esquema']));
    const raiz = [CX, 22];
    let lineas = '';
    let piezas = e.aparato(raiz, 40);
    const anchoRama = 220 / k;
    for (let i = 0; i < k; i++) {
      const x = 20 + anchoRama * (i + 0.5);
      const r = [x, 80];
      lineas += linea(raiz, r);
      piezas += e.aparato(r, 32);
      const paso = Math.min(28, (anchoRama - 14) / Math.max(m - 1, 1));
      for (let j = 0; j < m; j++) {
        const h = [x + (j - (m - 1) / 2) * paso, 142];
        lineas += linea(r, h);
        piezas += e.equipo(h);
      }
    }
    return {
      tipo: 'árbol',
      svg: svg(lineas + piezas, `Un aparato principal arriba unido a ${k} aparatos; de cada uno de ellos salen ${m} equipos con su propio cable.`)
    };
  }

  function malla(o = {}) {
    const completa = o.completa !== undefined ? o.completa : Math.random() < 0.5;
    const e = estilo(o.estilo || elige(['equipos', 'esquema']));
    const n = o.n || (completa ? al(4, 5) : al(5, 6));
    const pts = enElipse(n, 96, 64, o.giro !== undefined ? o.giro : elige([-90, -90 + 180 / n]));
    const pares = [];
    if (completa) {
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pares.push([i, j]);
    } else if (o.pares) {
      o.pares.forEach(p => pares.push(p));
    } else {
      /* Malla parcial: el contorno entero y 2-3 diagonales. Todos
         tienen al menos dos cables y no hay ningún aparato central. */
      for (let i = 0; i < n; i++) pares.push([i, (i + 1) % n]);
      const diag = [];
      for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) if (!(i === 0 && j === n - 1)) diag.push([i, j]);
      baraja(diag).slice(0, al(2, 3)).forEach(p => pares.push(p));
    }
    const lineas = pares.map(([a, b]) => linea(pts[a], pts[b])).join('');
    const piezas = pts.map(e.equipo).join('');
    const alt = completa
      ? `${n} equipos; cada uno está unido directamente con todos los demás.`
      : `${n} equipos unidos entre sí por varios cables, sin ningún aparato en el centro; entre dos equipos hay más de un camino.`;
    return { tipo: 'malla', completa, svg: svg(lineas + piezas, alt) };
  }

  function hibrida(o = {}) {
    const forma = o.forma || elige(['estrella-anillo', 'anillo-de-estrellas', 'arbol-anillo']);
    const e = estilo(o.estilo || elige(['equipos', 'esquema']));
    let lineas = '';
    let piezas = '';
    let alt;
    if (forma === 'anillo-de-estrellas') {
      const sw = enElipse(3, 52, 34, -90);
      sw.forEach((p, i) => { lineas += linea(p, sw[(i + 1) % 3]); });
      sw.forEach(p => {
        const a = Math.atan2(p[1] - CY, p[0] - CX);
        [-0.5, 0.5].forEach(g => {
          const h = [CX + 112 * Math.cos(a + g), CY + 74 * Math.sin(a + g)];
          lineas += linea(p, h);
          piezas += e.equipo(h);
        });
        piezas += e.aparato(p, 30);
      });
      alt = 'Tres aparatos unidos entre sí en un círculo cerrado; de cada aparato salen dos equipos, cada uno con su propio cable.';
    } else if (forma === 'arbol-anillo') {
      /* Arriba a la izquierda, un árbol pequeño; abajo a la derecha,
         un anillo de cinco colgado de una de sus ramas. Como la
         figura 7 de las fichas de Carles. */
      const raiz = [62, 22];
      const r1p = [30, 70];
      const r2p = [96, 70];
      lineas += linea(raiz, r1p) + linea(raiz, r2p);
      const hojas = [[16, 120], [46, 120]];
      hojas.forEach(h => { lineas += linea(r1p, h); });
      const ring = enElipse(5, 50, 40, -150, 182, 102);
      lineas += linea(r2p, ring[0]);
      ring.forEach((p, i) => { lineas += linea(p, ring[(i + 1) % 5]); });
      piezas += e.aparato(raiz, 30) + e.aparato(r1p, 28) + e.aparato(r2p, 28);
      piezas += hojas.map(e.equipo).join('') + ring.map(e.equipo).join('');
      alt = 'Arriba a la izquierda, un aparato del que cuelgan dos aparatos; de uno salen dos equipos. El otro está unido a cinco equipos que forman un círculo cerrado, cada uno unido con el de al lado.';
    } else {
      const sw = [70, CY];
      const hojas = [[22, 34], [22, 136], [96, 148]];
      hojas.forEach(h => { lineas += linea(sw, h); });
      const ring = enElipse(4, 46, 46, 180, 190, CY);
      lineas += linea(sw, ring[0]);
      ring.forEach((p, i) => { lineas += linea(p, ring[(i + 1) % 4]); });
      piezas += hojas.map(e.equipo).join('') + ring.map(e.equipo).join('') + e.aparato(sw, 34);
      alt = 'A la izquierda, un aparato con tres equipos, cada uno con su propio cable. Ese aparato está unido a uno de cuatro equipos que forman un círculo cerrado, cada uno unido con el de al lado.';
    }
    return { tipo: 'híbrida', svg: svg(lineas + piezas, alt) };
  }

  /* ---------- Dibujos fijos (test de la S3) ----------
     Redibujados de las fichas de Carles de otros años. Se quitan los
     que eran ambiguos (segmentos de bus con puente, estrella o árbol
     según se mire). */
  window.DIBUJOS = Object.assign(window.DIBUJOS || {}, {
    'topo-arbol-radial': () => arbol({ forma: 'radial', k: 4 }).svg,
    'topo-estrella-arriba': () => estrella({ forma: 'arriba', n: 5, estilo: 'equipos' }).svg,
    'topo-anillo-pc': () => anillo({ n: 4, estilo: 'equipos', flechas: false, giro: -45 }).svg,
    'topo-arbol-switches': () => arbol({ forma: 'ramas', k: 2, m: 3, estilo: 'equipos' }).svg,
    'topo-malla-parcial': () => malla({ completa: false, n: 6, estilo: 'esquema', giro: -90, pares: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 2], [1, 4], [2, 5]] }).svg,
    'topo-hibrida-arbol-anillo': () => hibrida({ forma: 'arbol-anillo', estilo: 'esquema' }).svg,
    'topo-malla-completa-pc': () => malla({ completa: true, n: 4, estilo: 'equipos', giro: -45 }).svg,
    'topo-doble-anillo': () => anillo({ n: 6, doble: true, estilo: 'esquema', giro: -90 }).svg,
    'topo-bus-pc': () => bus({ n: 5, reparto: 'arriba', estilo: 'equipos' }).svg,
    'topo-bus-servidor': () => bus({ n: 4, reparto: 'alterno', estilo: 'equipos', servidor: 3 }).svg,
    'topo-punto-a-punto': () => puntoAPunto({ estilo: 'equipos', inclina: 0 }).svg,
    'topo-estrella-centro': () => estrella({ forma: 'centro', n: 6, estilo: 'esquema' }).svg
  });

  /* ---------- Generador ---------- */

  const PISTAS = {
    'punto a punto': 'Solo dos equipos y un cable: punto a punto.',
    bus: 'Un mismo cable de lado a lado, con un terminador en cada punta: bus.',
    anillo: 'Cada equipo unido con sus dos vecinos y el círculo cerrado: anillo (con dos cables, doble anillo).',
    estrella: 'Un solo aparato en el centro y cada equipo con su propio cable hasta él: estrella.',
    'árbol': 'Varios aparatos que cuelgan de un aparato principal, y de cada uno sus equipos: árbol (estrella extendida).',
    malla: 'Equipos unidos entre sí por varios caminos y sin aparato central: malla.',
    'híbrida': 'Se ven dos topologías distintas juntas: híbrida (o mixta).'
  };
  const SINONIMOS = {
    'punto a punto': ['punto a punto', 'punto-a-punto', 'p2p'],
    bus: ['bus'],
    anillo: ['anillo'],
    estrella: ['estrella'],
    'árbol': ['árbol', 'estrella extendida', 'jerárquica'],
    malla: ['malla'],
    'híbrida': ['híbrida', 'mixta']
  };
  function aceptadas(base, extra) {
    const out = [];
    SINONIMOS[base].concat(extra || []).forEach(s => {
      out.push(s, `en ${s}`, `topología en ${s}`, `topología ${s}`, `la ${s}`, `el ${s}`, `una ${s}`, `un ${s}`);
    });
    return out;
  }

  const TIPOS = [puntoAPunto, bus, anillo, estrella, arbol, malla, hibrida];
  let bolsa = [];
  let cuenta = 0;

  /* De ocho en ocho (lo que pide el repaso): las siete topologías una
     vez y una más repetida, barajadas. Así en cada tanda salen todas,
     pero no se pueden sacar por descarte. */
  function genTopologiaDibujo() {
    if (bolsa.length === 0) bolsa = baraja(TIPOS.concat([elige(TIPOS.slice(1))]));
    const d = bolsa.pop()();
    let extra = [];
    if (d.tipo === 'anillo' && d.doble) extra = ['doble anillo', 'anillo doble'];
    if (d.tipo === 'malla') extra = [d.completa ? 'malla completa' : 'malla parcial'];
    cuenta++;
    return {
      clave: `topologia-dibujo-${cuenta}`,
      dibujo: d.svg,
      enunciado: '¿Qué topología es?',
      traducible: true,
      respuesta: d.tipo === 'anillo' && d.doble ? 'anillo (doble anillo)' : d.tipo,
      respuestas: aceptadas(d.tipo, extra),
      formato: 'texto',
      pista: PISTAS[d.tipo]
    };
  }

  if (typeof GENERADORES !== 'undefined') GENERADORES['topologia-dibujo'] = genTopologiaDibujo;
})();
