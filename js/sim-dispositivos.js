/* ============================================================
   Unidad 6 de Instalaciones (dispositivos de interconexión),
   13/11/2026. Va en tema.html después de js/simulador.js.

   LABORATORIO «red» (dibujo de una red para contar dominios)
     <div class="lab" data-lab="red" data-red="R(S(P,P),H(P,P,P))"
          aria-label="Red 1"></div>
     R = router, S = switch, H = hub, P = ordenador. Entre paréntesis,
     lo que cuelga de cada aparato. Con data-solucion, un botón «Ver
     la solución» numera los dominios de colisión (un número por
     dominio) y los colorea por dominio de difusión. Sin él, solo el
     dibujo (para las preguntas obligatorias, que no llevan solución).

   SIMULACIONES (cada una enlazada a una pregunta obligatoria)
     tabla-mac       S4 «Eres el switch»: tramas que llegan; el alumno
                     dice si apunta el origen y por dónde sale.
     elige-switch    S5 «Elige el switch del aula nueva».
     cuenta-dominios S7 «Cuenta los dominios»: redes al azar.
     puerta-enlace   S8 «Conecta el PC de Contabilidad»: IP, máscara
                     y puerta de enlace; ping al compañero, al Taller
                     y a Internet.
     protege-empresa S9 «Protege la red de la empresa»: cortafuegos,
                     proxy y VPN.

   Notación de la unidad (Carles, 13/11/2026): MAC cortas (0A, 0B…)
   y puertos Fa1, Fa2… Sin colores nuevos: variables de siempre.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window === 'undefined' || !window.LAB) return;
  const { el, boton, cabecera } = window.LAB;

  /* Número de la pregunta enlazada de cada simulación. */
  const PREG = { tabla: 10, switch_: 10, dominios: 10, puerta: 11, protege: 10 };

  const azar = l => l[Math.floor(Math.random() * l.length)];
  const entre = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  function select(opciones, valor, etiqueta) {
    const s = document.createElement('select');
    s.className = 'lab__entrada sim__select';
    if (etiqueta) s.setAttribute('aria-label', etiqueta);
    opciones.forEach(([v, t]) => {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = t;
      if (v === '') { o.disabled = true; o.hidden = true; }
      if (v === valor) o.selected = true;
      s.appendChild(o);
    });
    return s;
  }
  function entrada(valor, etiqueta, ancho) {
    const i = document.createElement('input');
    i.type = 'text';
    i.className = 'lab__entrada';
    i.value = valor;
    i.spellcheck = false;
    i.autocomplete = 'off';
    i.setAttribute('aria-label', etiqueta);
    i.setAttribute('translate', 'no');
    i.style.flex = 'none';
    if (ancho) i.style.width = ancho;
    return i;
  }
  function campo(padre, texto, control) {
    const l = el('label', 'sim__campo');
    l.appendChild(el('span', 'sim__etiqueta', texto));
    l.appendChild(control);
    padre.appendChild(l);
    return l;
  }
  function interruptor(padre, texto, valor, alCambiar) {
    const l = el('label', 'sim__interruptor');
    const c = document.createElement('input');
    c.type = 'checkbox';
    c.checked = valor;
    c.setAttribute('role', 'switch');
    c.addEventListener('change', () => alCambiar(c.checked));
    l.appendChild(c);
    l.appendChild(el('span', null, texto));
    padre.appendChild(l);
    return c;
  }
  function avisa(caja, ctx, texto, tipo) {
    caja.innerHTML = '';
    if (texto) caja.appendChild(ctx.aviso(texto, tipo));
  }

  /* ============================================================
     Redes: leer la notación, colocar, contar y dibujar
     ============================================================ */
  function leerRed(txt) {
    let i = 0;
    const s = txt.replace(/\s+/g, '');
    function nodo() {
      const t = s[i++];
      const n = { t, hijos: [] };
      if (s[i] === '(') {
        i++;
        while (s[i] !== ')') {
          n.hijos.push(nodo());
          if (s[i] === ',') i++;
        }
        i++;
      }
      return n;
    }
    return nodo();
  }

  /* Dominios: cada cable es una arista. Dos cables están en el mismo
     dominio de colisión si se tocan en un hub (o en un PC); en el mismo
     de difusión si se tocan en algo que no sea un router. */
  function contar(raiz) {
    const aristas = [];
    const nodos = [];
    (function rec(n) {
      nodos.push(n);
      n.hijos.forEach(h => { aristas.push({ a: n, b: h }); rec(h); });
    })(raiz);
    function grupos(une) {
      const padre = aristas.map((_, k) => k);
      const raizDe = k => (padre[k] === k ? k : (padre[k] = raizDe(padre[k])));
      nodos.forEach(n => {
        if (!une(n)) return;
        const mias = aristas.map((e, k) => (e.a === n || e.b === n ? k : -1)).filter(k => k >= 0);
        for (let k = 1; k < mias.length; k++) padre[raizDe(mias[k])] = raizDe(mias[0]);
      });
      const num = {};
      let cuenta = 0;
      return {
        de: aristas.map((_, k) => {
          const r = raizDe(k);
          if (num[r] === undefined) num[r] = ++cuenta;
          return num[r];
        }),
        total: () => cuenta
      };
    }
    const col = grupos(n => n.t === 'H' || n.t === 'P');
    const colDe = col.de;
    const dif = grupos(n => n.t !== 'R');
    const difDe = dif.de;
    return {
      aristas,
      colision: aristas.length ? col.total() : 0,
      difusion: aristas.length ? Math.max(1, dif.total()) : 1,
      colDe, difDe
    };
  }

  function colocar(raiz) {
    let hojas = 0, prof = 0;
    (function rec(n, d) {
      n.d = d;
      prof = Math.max(prof, d);
      if (!n.hijos.length) { n.hoja = hojas++; return; }
      n.hijos.forEach(h => rec(h, d + 1));
    })(raiz, 0);
    const W = 640, paso = Math.min(110, W / Math.max(1, hojas));
    const x0 = (W - paso * hojas) / 2 + paso / 2;
    (function rec(n) {
      if (!n.hijos.length) n.x = x0 + n.hoja * paso;
      else { n.hijos.forEach(rec); n.x = (n.hijos[0].x + n.hijos[n.hijos.length - 1].x) / 2; }
      n.y = 42 + n.d * 92;
    })(raiz);
    return { W, H: 42 + prof * 92 + 52 };
  }

  const NOMBRE = { R: 'Router', S: 'Switch', H: 'Hub', P: 'PC' };
  function icono(n) {
    const x = n.x, y = n.y;
    const trazo = 'stroke="currentColor" stroke-width="2" fill="var(--surface)"';
    if (n.t === 'P') {
      return `<rect x="${x - 14}" y="${y - 12}" width="28" height="19" rx="3" ${trazo}/>` +
        `<path d="M${x - 7} ${y + 13}h14M${x} ${y + 7}v6" stroke="currentColor" stroke-width="2" fill="none"/>`;
    }
    if (n.t === 'R') {
      return `<circle cx="${x}" cy="${y}" r="17" ${trazo}/>` +
        `<path d="M${x - 9} ${y}h18M${x} ${y - 9}v18M${x + 5} ${y - 4}l4 4-4 4M${x - 5} ${y - 4}l-4 4 4 4" stroke="currentColor" stroke-width="1.8" fill="none"/>` +
        `<text x="${x + 22}" y="${y - 10}" font-size="13" font-weight="700" fill="currentColor">${NOMBRE.R}</text>`;
    }
    const marca = n.t === 'S'
      ? `<path d="M${x - 14} ${y - 3}h26l-4-4M${x + 14} ${y + 3}h-26l4 4" stroke="currentColor" stroke-width="1.8" fill="none"/>`
      : [-12, -4, 4, 12].map(d => `<circle cx="${x + d}" cy="${y}" r="2.2" fill="currentColor"/>`).join('');
    return `<rect x="${x - 28}" y="${y - 11}" width="56" height="22" rx="5" ${trazo}/>` + marca +
      `<text x="${x + 32}" y="${y - 6}" font-size="13" font-weight="700" fill="currentColor">${NOMBRE[n.t]}</text>`;
  }
  const ALTO = { P: 12, R: 17, S: 11, H: 11 };

  /* colores: lista de variables para los dominios de difusión */
  function dibujarRed(raiz, solucion, colores) {
    const tam = colocar(raiz);
    const c = contar(raiz);
    let lineas = '', badges = '', iconos = '';
    c.aristas.forEach((e, k) => {
      const y1 = e.a.y + ALTO[e.a.t] + (e.a.t === 'P' ? 0 : 1), y2 = e.b.y - ALTO[e.b.t];
      const col = solucion ? colores[(c.difDe[k] - 1) % colores.length] : 'currentColor';
      lineas += `<line x1="${e.a.x}" y1="${y1}" x2="${e.b.x}" y2="${y2}" stroke="${col}" stroke-width="${solucion ? 3 : 2}" opacity="${solucion ? 1 : 0.7}"/>`;
      if (solucion) {
        const mx = e.a.x + (e.b.x - e.a.x) * 0.55, my = y1 + (y2 - y1) * 0.55;
        badges += `<circle cx="${mx}" cy="${my}" r="10" fill="var(--surface)" stroke="${col}" stroke-width="2.5"/>` +
          `<text x="${mx}" y="${my + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor">${c.colDe[k]}</text>`;
      }
    });
    (function rec(n) { iconos += icono(n); n.hijos.forEach(rec); })(raiz);
    return {
      svg: `<svg viewBox="0 0 ${tam.W} ${tam.H}" width="100%" style="max-width:40rem;height:auto;display:block;margin:0 auto;color:var(--text)" role="img" aria-label="${describir(raiz)}" translate="no">${lineas}${iconos}${badges}</svg>`,
      cuenta: c
    };
  }

  function describir(n) {
    if (n.t === 'P') return 'un PC';
    const pcs = n.hijos.filter(h => h.t === 'P').length;
    const otros = n.hijos.filter(h => h.t !== 'P').map(describir);
    const partes = [];
    if (pcs) partes.push(`${pcs} PC`);
    otros.forEach(o => partes.push(o));
    const nom = { R: 'un router', S: 'un switch', H: 'un hub' }[n.t];
    return `${nom} con ${partes.join(', ')}`;
  }

  /* ---------- laboratorio «red» ---------- */
  window.registrarLab('red', caja => {
    cabecera(caja, 'Red');
    const raiz = leerRed(caja.dataset.red || 'S(P,P)');
    const vista = el('div', 'lab__red');
    vista.style.padding = '0.6rem 0';
    caja.appendChild(vista);
    const colores = ['var(--rs-1)', 'var(--rs-4)', 'var(--rs-2)', 'var(--rs-3)'];
    let sol = false;
    const pinta = () => {
      const r = dibujarRed(raiz, sol, colores);
      vista.innerHTML = r.svg;
      return r;
    };
    const r = pinta();
    if (caja.hasAttribute('data-solucion')) {
      const fila = el('div', 'lab__fila');
      const b = boton('Ver la solución');
      const texto = el('p', 'lab__nota');
      texto.setAttribute('aria-live', 'polite');
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        sol = !sol;
        pinta();
        b.textContent = sol ? 'Esconder la solución' : 'Ver la solución';
        b.setAttribute('aria-pressed', String(sol));
        texto.textContent = sol
          ? `Dominios de colisión: ${r.cuenta.colision} (cada número es uno). Dominios de difusión: ${r.cuenta.difusion} (cada color es uno).`
          : '';
      });
      fila.appendChild(b);
      caja.appendChild(fila);
      caja.appendChild(texto);
    }
  });

  if (typeof window.registrarSimulacion !== 'function') return;

  /* ============================================================
     S4 · Eres el switch (tabla MAC)
     ============================================================ */
  const EQUIPOS = [
    { mac: '0A', puerto: 'Fa1', x: 70, y: 210 },
    { mac: '0B', puerto: 'Fa2', x: 210, y: 210 },
    { mac: '0C', puerto: 'Fa3', x: 350, y: 210 },
    { mac: '0D', puerto: 'Fa4', x: 470, y: 268 },
    { mac: '0E', puerto: 'Fa4', x: 590, y: 268 }
  ];
  const PUERTOS = ['Fa1', 'Fa2', 'Fa3', 'Fa4'];
  const SWX = 330, SWY = 80;
  const BOCA = { Fa1: 270, Fa2: 310, Fa3: 350, Fa4: 390 };
  const HUB = { x: 530, y: 190 };

  function dibujoSwitch(entra, salen) {
    const col = p => (p === entra ? 'var(--accent-warm)' : salen.includes(p) ? 'var(--ok)' : 'currentColor');
    const ancho = p => (p === entra || salen.includes(p) ? 3.5 : 2);
    let s = `<svg viewBox="36 56 594 268" width="100%" style="max-width:38rem;height:auto;display:block;color:var(--text)" role="img" aria-label="Un switch con cuatro puertos: en Fa1 el PC 0A, en Fa2 el 0B, en Fa3 el 0C y en Fa4 un hub con el 0D y el 0E" translate="no">`;
    const destino = p => (p === 'Fa4' ? [HUB.x, HUB.y - 12] : (() => { const e = EQUIPOS.find(q => q.puerto === p); return [e.x, e.y - 14]; })());
    PUERTOS.forEach(p => {
      const [dx, dy] = destino(p);
      s += `<path d="M${BOCA[p]} ${SWY + 14} L${BOCA[p]} ${SWY + 40} L${dx} ${dy - 24} L${dx} ${dy}" fill="none" stroke="${col(p)}" stroke-width="${ancho(p)}"/>`;
      s += `<text x="${BOCA[p]}" y="${SWY + 36}" text-anchor="${p === 'Fa1' || p === 'Fa2' ? 'end' : 'start'}" dx="${p === 'Fa1' || p === 'Fa2' ? -5 : 5}" font-size="17" font-weight="700" fill="${col(p)}">${p}</text>`;
    });
    s += `<rect x="${SWX - 90}" y="${SWY - 16}" width="180" height="30" rx="6" stroke="currentColor" stroke-width="2" fill="var(--surface)"/>`;
    s += `<text x="${SWX}" y="${SWY + 4}" text-anchor="middle" font-size="18" font-weight="700" fill="currentColor">Switch</text>`;
    /* hub y sus dos PC */
    const hubCol = entra === 'Fa4' || salen.includes('Fa4') ? col('Fa4') : 'currentColor';
    ['0D', '0E'].forEach(m => {
      const e = EQUIPOS.find(q => q.mac === m);
      s += `<line x1="${HUB.x}" y1="${HUB.y + 12}" x2="${e.x}" y2="${e.y - 14}" stroke="${hubCol}" stroke-width="2"/>`;
    });
    s += `<rect x="${HUB.x - 34}" y="${HUB.y - 12}" width="68" height="24" rx="5" stroke="currentColor" stroke-width="2" fill="var(--surface)"/>`;
    s += `<text x="${HUB.x}" y="${HUB.y + 6}" text-anchor="middle" font-size="16" fill="currentColor">Hub</text>`;
    EQUIPOS.forEach(e => {
      s += `<rect x="${e.x - 22}" y="${e.y - 14}" width="44" height="28" rx="3" stroke="currentColor" stroke-width="2" fill="var(--surface)"/>`;
      s += `<path d="M${e.x - 9} ${e.y + 21}h18M${e.x} ${e.y + 14}v7" stroke="currentColor" stroke-width="2"/>`;
      s += `<text x="${e.x}" y="${e.y + 42}" text-anchor="middle" font-size="18" font-weight="700" fill="currentColor">${e.mac}</text>`;
    });
    return s + '</svg>';
  }

  registrarSimulacion('tabla-mac', {
    ventana: 'Switch del taller · tabla MAC',
    mision: [
      'Acierta una trama que el switch entrega por un solo puerto (unicast).',
      'Acierta una inundación: el destino no está en la tabla.',
      'Acierta un broadcast (destino FF).',
      'Acierta una trama que el switch descarta.',
      'Acierta 3 tramas seguidas sin fallar nada.'
    ],
    final: `Apunta en tu cuaderno (pregunta ${PREG.tabla}): la tabla MAC tal como ha quedado y, de la última trama, el origen, el destino, el puerto por el que entró y por dónde salió.`,
    crear(ctx) {
      const { pantalla } = ctx;
      const tabla = {};
      let seguidas = 0, trama = null, contestada = false;
      const hechas = new Set();
      /* La tabla empieza con dos o tres equipos que ya han hablado. */
      EQUIPOS.slice().sort(() => Math.random() - 0.5).slice(0, entre(2, 3)).forEach(e => { tabla[e.mac] = e.puerto; });

      pantalla.appendChild(el('p', 'sim__ayuda', 'Eres el switch. Te llega una trama: di qué haces con su origen y por dónde la envías. Abajo tienes tu tabla MAC.'));
      const vista = el('div', 'sim__vista');
      pantalla.appendChild(vista);
      const dos = el('div', 'sim__dos');
      pantalla.appendChild(dos);
      const izq = el('div', 'sim__ajustes');
      const der = el('div', 'sim__ajustes');
      dos.appendChild(izq);
      dos.appendChild(der);
      const trTit = el('p', 'sim__h', 'Te llega esta trama');
      const trTxt = el('p', null);
      trTxt.setAttribute('translate', 'no');
      izq.appendChild(trTit);
      izq.appendChild(trTxt);
      const s1 = select([], '', 'Qué haces con el origen');
      const s2 = select([], '', 'Por dónde envías la trama');
      campo(izq, '1. ¿Qué haces con el origen?', s1);
      campo(izq, '2. ¿Por dónde envías la trama?', s2);
      const fila = el('div', 'lab__fila');
      const bComprobar = boton('Comprobar');
      const bOtra = boton('Siguiente trama →');
      const bReinicio = boton('↻ Reiniciar el switch (tabla vacía)');
      fila.appendChild(bComprobar);
      fila.appendChild(bOtra);
      izq.appendChild(fila);
      const resultado = el('div');
      resultado.setAttribute('aria-live', 'polite');
      izq.appendChild(resultado);

      der.appendChild(el('p', 'sim__h', 'Tu tabla MAC'));
      const tTabla = el('table', 'lab__tabla');
      tTabla.setAttribute('translate', 'no');
      der.appendChild(tTabla);
      der.appendChild(bReinicio);

      function pintarTabla(nueva) {
        const filas = Object.keys(tabla).sort((a, b) => tabla[a].localeCompare(tabla[b]) || a.localeCompare(b));
        tTabla.innerHTML = '<tr><th>MAC</th><th>Puerto</th></tr>' +
          (filas.length ? filas.map(m => `<tr${m === nueva ? ' style="color:var(--ok);font-weight:700"' : ''}><td>${m}</td><td>${tabla[m]}</td></tr>`).join('')
            : '<tr><td colspan="2">(vacía)</td></tr>');
      }

      function nueva() {
        const pendientes = ['unicast', 'inundacion', 'broadcast', 'descarta'].filter((t, i) => !ctx.hecho(i));
        const tipos = pendientes.length ? pendientes.concat(['unicast', 'inundacion']) : ['unicast', 'unicast', 'inundacion', 'broadcast', 'descarta'];
        for (let intento = 0; intento < 60; intento++) {
          const tipo = azar(tipos);
          const o = azar(EQUIPOS);
          let d = null;
          if (tipo === 'broadcast') d = 'FF';
          else if (tipo === 'unicast') d = azar(EQUIPOS.filter(e => e !== o && tabla[e.mac] && e.puerto !== o.puerto).concat([null]));
          else if (tipo === 'inundacion') d = azar(EQUIPOS.filter(e => e !== o && !tabla[e.mac]).concat([null]));
          else d = azar(EQUIPOS.filter(e => e !== o && tabla[e.mac] && e.puerto === o.puerto).concat([null]));
          if (!d) continue;
          trama = { o, d: d === 'FF' ? 'FF' : d.mac };
          break;
        }
        if (!trama) trama = { o: EQUIPOS[0], d: 'FF' };
        contestada = false;
        trTxt.innerHTML = `Origen <strong>${trama.o.mac}</strong> → destino <strong>${trama.d}</strong>. Entra por <strong>${trama.o.puerto}</strong>.`;
        s1.innerHTML = '';
        [['', 'Elige…'], ['apunta', `La apunto: ${trama.o.mac} → ${trama.o.puerto}`], ['nada', 'Nada: ya estaba en la tabla']].forEach(([v, t]) => {
          const op = document.createElement('option'); op.value = v; op.textContent = t;
          if (!v) { op.disabled = true; op.hidden = true; op.selected = true; }
          s1.appendChild(op);
        });
        s2.innerHTML = '';
        [['', 'Elige…']].concat(PUERTOS.map(p => [p, `Solo por ${p}`]))
          .concat([['todos', `Por todos menos por ${trama.o.puerto}`], ['descarta', 'La descarto: no sale']]).forEach(([v, t]) => {
            const op = document.createElement('option'); op.value = v; op.textContent = t;
            if (!v) { op.disabled = true; op.hidden = true; op.selected = true; }
            s2.appendChild(op);
          });
        resultado.innerHTML = '';
        bComprobar.disabled = false;
        bOtra.disabled = true;
        vista.innerHTML = dibujoSwitch(trama.o.puerto, []);
        pintarTabla();
      }

      function solucion() {
        const yaEstaba = tabla[trama.o.mac] === trama.o.puerto;
        let salida, tipo, porque;
        if (trama.d === 'FF') {
          salida = 'todos'; tipo = 2; porque = 'FF es broadcast: va para todos, así que sale por todos los puertos menos por el que entró.';
        } else if (!tabla[trama.d]) {
          salida = 'todos'; tipo = 1; porque = `${trama.d} no está en la tabla: el switch no sabe dónde está y hace una inundación (todos menos el de entrada).`;
        } else if (tabla[trama.d] === trama.o.puerto) {
          salida = 'descarta'; tipo = 3; porque = `${trama.d} está en ${tabla[trama.d]}, el mismo puerto por el que entró: el hub ya se la ha dado. El switch la descarta.`;
        } else {
          salida = tabla[trama.d]; tipo = 0; porque = `${trama.d} está en la tabla, en ${tabla[trama.d]}: sale solo por ahí.`;
        }
        return { origen: yaEstaba ? 'nada' : 'apunta', salida, tipo, porque, yaEstaba };
      }

      bComprobar.addEventListener('click', () => {
        if (contestada) return;
        if (!s1.value || !s2.value) { avisa(resultado, ctx, 'Contesta las dos cosas antes de comprobar.', 'cuidado'); return; }
        const sol = solucion();
        const bien1 = s1.value === sol.origen, bien2 = s2.value === sol.salida;
        contestada = true;
        bComprobar.disabled = true;
        bOtra.disabled = false;
        const txtOrigen = sol.yaEstaba ? `${trama.o.mac} ya estaba en la tabla.` : `Primero apunta el origen: ${trama.o.mac} → ${trama.o.puerto}.`;
        const linea = `${trama.o.mac} → ${trama.d} por ${trama.o.puerto}: `;
        if (bien1 && bien2) {
          seguidas++;
          avisa(resultado, ctx, `¡Bien! ${txtOrigen} ${sol.porque}`, 'ok');
          ctx.cumple(sol.tipo, linea + (sol.salida === 'todos' ? `todos menos ${trama.o.puerto}` : sol.salida === 'descarta' ? 'descartada' : sol.salida) + '.');
          if (seguidas >= 3) ctx.cumple(4, '3 tramas seguidas sin fallar.');
        } else {
          seguidas = 0;
          avisa(resultado, ctx, `${bien1 ? '' : 'El origen no. '}${bien2 ? '' : 'La salida no. '}${txtOrigen} ${sol.porque}`);
          ctx.falla(linea + 'fallada.');
        }
        tabla[trama.o.mac] = trama.o.puerto;
        const salen = sol.salida === 'todos' ? PUERTOS.filter(p => p !== trama.o.puerto) : sol.salida === 'descarta' ? [] : [sol.salida];
        vista.innerHTML = dibujoSwitch(trama.o.puerto, salen);
        pintarTabla(sol.yaEstaba ? null : trama.o.mac);
      });
      bOtra.addEventListener('click', () => { trama = null; nueva(); s1.focus(); });
      bReinicio.addEventListener('click', () => {
        Object.keys(tabla).forEach(k => delete tabla[k]);
        ctx.apunta('Switch reiniciado: la tabla se borra y vuelve a aprender.');
        pintarTabla();
      });
      nueva();
    }
  });

  /* ============================================================
     S5 · Elige el switch del aula nueva
     ============================================================ */
  registrarSimulacion('elige-switch', {
    ventana: 'Tienda de material de redes',
    mision: [
      'Que quepa todo: 26 PC, 2 puntos de acceso y 2 cámaras.',
      'Que los puntos de acceso y las cámaras funcionen sin enchufe.',
      'Que se pueda unir con el armario principal, a 150 m.',
      'Que vaya atornillado en el armario de 19 pulgadas.',
      'Que desde tu ordenador puedas ver qué boca falla.',
      'Que no frene a los PC, que tienen tarjeta de 1 Gbps.'
    ],
    final: `Apunta en tu cuaderno (pregunta ${PREG.switch_}): el switch que has elegido, con sus seis características, y para qué sirve cada una en esta aula.`,
    crear(ctx) {
      const { pantalla } = ctx;
      const s = { formato: 'sobremesa', bocas: '16', poe: 'no', enlace: 'rj45', gestion: 'no', vel: '100' };
      pantalla.appendChild(el('p', 'sim__ayuda', 'Aula nueva del instituto: 26 ordenadores, 2 puntos de acceso y 2 cámaras en el techo (sin enchufe cerca). El switch va en el armario del aula y se une con el armario principal, que está a 150 m. Elige cada cosa.'));
      const dos = el('div', 'sim__dos');
      pantalla.appendChild(dos);
      const ajustes = el('div', 'sim__ajustes');
      const vista = el('div', 'sim__vista');
      dos.appendChild(ajustes);
      dos.appendChild(vista);
      const opciones = [
        ['formato', 'Formato', [['sobremesa', 'De sobremesa'], ['rack', 'De rack (1 U, para el armario)']]],
        ['bocas', 'Bocas RJ-45', [['8', '8 bocas'], ['16', '16 bocas'], ['24', '24 bocas'], ['48', '48 bocas']]],
        ['poe', 'PoE', [['no', 'Sin PoE'], ['si', 'Con PoE']]],
        ['enlace', 'Bocas de enlace', [['rj45', 'Solo RJ-45'], ['sfp', '2 bocas SFP (fibra)']]],
        ['gestion', 'Gestión', [['no', 'No gestionable (enchufar y listo)'], ['si', 'Gestionable (se configura y se vigila)']]],
        ['vel', 'Velocidad de cada boca', [['100', '10/100 Mbps'], ['1000', '10/100/1000 Mbps (Gigabit)']]]
      ];
      opciones.forEach(([k, t, ops]) => {
        const sel = select(ops, s[k], t);
        sel.addEventListener('change', () => { s[k] = sel.value; revisa(`${t}: ${sel.selectedOptions[0].textContent}.`); });
        campo(ajustes, t, sel);
      });
      const precio = { formato: { sobremesa: 0, rack: 40 }, bocas: { 8: 30, 16: 60, 24: 90, 48: 170 }, poe: { no: 0, si: 140 }, enlace: { rj45: 0, sfp: 50 }, gestion: { no: 0, si: 90 }, vel: { 100: 0, 1000: 40 } };
      function revisa(texto) {
        const lista = [
          [s.bocas === '48', s.bocas === '48' ? '30 aparatos: con 48 bocas caben y sobra para crecer.' : `Hacen falta 30 bocas (26 + 2 + 2). Con ${s.bocas} no caben.`],
          [s.poe === 'si', s.poe === 'si' ? 'Con PoE, la corriente llega por el cable.' : 'Sin PoE, los puntos de acceso y las cámaras del techo no encienden.'],
          [s.enlace === 'sfp', s.enlace === 'sfp' ? 'Por SFP va un módulo de fibra: llega a 150 m sin problema.' : 'El cable de cobre llega como mucho a 100 m: a 150 m hace falta fibra.'],
          [s.formato === 'rack', s.formato === 'rack' ? 'De rack: va atornillado en el armario y ocupa 1 U.' : 'Uno de sobremesa no se atornilla en el armario.'],
          [s.gestion === 'si', s.gestion === 'si' ? 'Gestionable: entras desde el navegador y ves cada boca.' : 'Uno no gestionable no deja ver nada desde el ordenador.'],
          [s.vel === '1000', s.vel === '1000' ? 'Gigabit: cada PC va a 1 Gbps.' : 'A 100 Mbps, las tarjetas de 1 Gbps irían frenadas.']
        ];
        vista.innerHTML = '';
        vista.appendChild(el('p', 'sim__h', 'Tu switch'));
        const ul = el('ul', 'sim__casillas');
        lista.forEach(([ok, t]) => {
          const li = el('li', null, (ok ? '✓ ' : '✗ ') + t);
          li.style.color = ok ? 'var(--text)' : 'var(--error)';
          ul.appendChild(li);
        });
        vista.appendChild(ul);
        const total = Object.keys(s).reduce((a, k) => a + (precio[k][s[k]] || 0), 0);
        vista.appendChild(el('p', 'sim__etiqueta', `Precio aproximado: ${total} €`));
        lista.forEach(([ok], i) => (ok ? ctx.cumple(i) : ctx.deshace(i)));
        if (texto) ctx.apunta(texto);
      }
      revisa();
    }
  });

  /* ============================================================
     S7 · Cuenta los dominios
     ============================================================ */
  function pcs(n) { return Array.from({ length: n }, () => 'P').join(','); }
  function redAlAzar(quiere) {
    const f = quiere || entre(1, 7);
    if (f === 1) return `S(${pcs(entre(3, 6))})`;
    if (f === 2) return `H(${pcs(entre(3, 5))})`;
    if (f === 3) return `S(${pcs(entre(2, 4))},H(${pcs(entre(2, 3))}))`;
    if (f === 4) return `R(S(${pcs(entre(2, 4))}),S(${pcs(entre(2, 3))}))`;
    if (f === 5) return `R(S(${pcs(entre(2, 3))}),H(${pcs(entre(2, 3))}))`;
    if (f === 6) return `S(${pcs(entre(1, 2))},S(${pcs(entre(2, 3))}),H(${pcs(2)}))`;
    return `R(S(${pcs(entre(1, 2))},H(${pcs(2)})),S(${pcs(entre(2, 3))}),S(${pcs(2)}))`;
  }

  registrarSimulacion('cuenta-dominios', {
    ventana: 'Mapa de la red',
    mision: [
      'Cuenta bien una red que tenga un hub.',
      'Cuenta bien una red que tenga un router.',
      'Cuenta bien 3 redes seguidas (las dos cifras).'
    ],
    final: `Apunta en tu cuaderno (pregunta ${PREG.dominios}): dibuja la última red que has contado y escribe cuántos dominios de colisión y de difusión tiene, y por qué.`,
    crear(ctx) {
      const { pantalla } = ctx;
      let raiz, cuenta, intentos = 0, seguidas = 0, solVista = false, n = 0;
      pantalla.appendChild(el('p', 'sim__ayuda', 'Cuenta los dominios de colisión y de difusión de esta red. Si fallas, puedes ver la solución: cada número es un dominio de colisión y cada color, uno de difusión.'));
      const vista = el('div', 'sim__vista');
      pantalla.appendChild(vista);
      const dos = el('div', 'sim__dos');
      pantalla.appendChild(dos);
      const iCol = entrada('', 'Dominios de colisión', '6rem');
      const iDif = entrada('', 'Dominios de difusión', '6rem');
      iCol.inputMode = 'numeric';
      iDif.inputMode = 'numeric';
      campo(dos, 'Dominios de colisión', iCol);
      campo(dos, 'Dominios de difusión', iDif);
      const fila = el('div', 'lab__fila');
      const bComprobar = boton('Comprobar');
      const bSol = boton('Ver la solución');
      const bOtra = boton('Otra red →');
      fila.appendChild(bComprobar);
      fila.appendChild(bSol);
      fila.appendChild(bOtra);
      pantalla.appendChild(fila);
      const resultado = el('div');
      resultado.setAttribute('aria-live', 'polite');
      pantalla.appendChild(resultado);
      const colores = ['var(--accent)', 'var(--accent-warm)', 'var(--ok)', 'var(--error)'];

      function pinta() {
        const r = dibujarRed(raiz, solVista, colores);
        vista.innerHTML = r.svg;
        cuenta = r.cuenta;
      }
      function otra() {
        n++;
        /* Las primeras redes cubren la misión: una con hub y otra con router. */
        const quiere = !ctx.hecho(0) && n % 2 === 1 ? azar([2, 3, 6]) : !ctx.hecho(1) ? azar([4, 5, 7]) : null;
        raiz = leerRed(redAlAzar(quiere));
        intentos = 0;
        solVista = false;
        bSol.textContent = 'Ver la solución';
        bSol.disabled = true;
        bComprobar.disabled = false;
        iCol.value = '';
        iDif.value = '';
        resultado.innerHTML = '';
        pinta();
      }
      bComprobar.addEventListener('click', () => {
        const c = parseInt(iCol.value, 10), d = parseInt(iDif.value, 10);
        if (isNaN(c) || isNaN(d)) { avisa(resultado, ctx, 'Escribe las dos cifras.', 'cuidado'); return; }
        intentos++;
        const okC = c === cuenta.colision, okD = d === cuenta.difusion;
        const tieneHub = /H/.test(JSON.stringify(raiz, ['t', 'hijos'])), tieneRouter = raiz.t === 'R';
        if (okC && okD) {
          seguidas = intentos === 1 ? seguidas + 1 : 0;
          avisa(resultado, ctx, `¡Bien! ${cuenta.colision} de colisión y ${cuenta.difusion} de difusión.`, 'ok');
          ctx.apunta(`Red ${n}: ${cuenta.colision} de colisión y ${cuenta.difusion} de difusión.`);
          if (tieneHub) ctx.cumple(0);
          if (tieneRouter) ctx.cumple(1);
          if (seguidas >= 3) ctx.cumple(2, '3 redes seguidas a la primera.');
          bComprobar.disabled = true;
        } else {
          seguidas = 0;
          const pistas = [];
          if (!okC) pistas.push(tieneHub
            ? 'Colisión: mira el hub. Todo lo que cuelga de él, con su cable de subida, es un solo dominio.'
            : 'Colisión: cada cable que llega a un switch o a un router es un dominio. No te olvides de los cables entre aparatos.');
          if (!okD) pistas.push(tieneRouter
            ? 'Difusión: cuenta las bocas del router que se usan.'
            : 'Difusión: sin router, toda la red es un solo dominio.');
          avisa(resultado, ctx, pistas.join(' '));
          ctx.falla(`Red ${n}: ${c} y ${d} no es.`);
          bSol.disabled = false;
        }
      });
      bSol.addEventListener('click', () => {
        solVista = !solVista;
        pinta();
        bSol.textContent = solVista ? 'Esconder la solución' : 'Ver la solución';
        if (solVista) ctx.apunta(`Red ${n}: miras la solución (${cuenta.colision} y ${cuenta.difusion}).`);
      });
      bOtra.addEventListener('click', otra);
      otra();
    }
  });

  /* ============================================================
     S8 · Conecta el PC de Contabilidad (puerta de enlace)
     ============================================================ */
  function ipValida(t) {
    const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(t.trim());
    if (!m) return null;
    const o = m.slice(1).map(Number);
    return o.every(x => x <= 255) ? o : null;
  }
  const MAPA_PE = `<svg viewBox="0 0 640 205" width="100%" style="max-width:38rem;height:auto;display:block;margin:0 auto;color:var(--text)" role="img" aria-label="Contabilidad, red 192.168.1.0, con tu PC y el de un compañero (.1.11) en un switch; el router tiene la .1.1 en esa red y la .2.1 en la red del Taller, 192.168.2.0, donde está el PC .2.20; el router sale a Internet" translate="no">
<rect x="10" y="60" width="250" height="130" rx="10" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="6 4"/>
<rect x="380" y="60" width="250" height="130" rx="10" fill="none" stroke="var(--accent-warm)" stroke-width="2" stroke-dasharray="6 4"/>
<text x="20" y="80" font-size="15" font-weight="700" fill="var(--accent)">Contabilidad · 192.168.1.0</text>
<text x="390" y="80" font-size="15" font-weight="700" fill="var(--accent-warm)">Taller · 192.168.2.0</text>
<rect x="95" y="98" width="80" height="26" rx="5" fill="var(--surface)" stroke="currentColor" stroke-width="2"/><text x="135" y="116" text-anchor="middle" font-size="14" fill="currentColor">Switch</text>
<rect x="465" y="98" width="80" height="26" rx="5" fill="var(--surface)" stroke="currentColor" stroke-width="2"/><text x="505" y="116" text-anchor="middle" font-size="14" fill="currentColor">Switch</text>
<path d="M115 122 L60 150 M155 122 L210 150 M505 122 L505 150 M170 111 L300 70 M340 70 L470 111 M320 48 L320 22" stroke="currentColor" stroke-width="2" fill="none"/>
<circle cx="320" cy="62" r="16" fill="var(--surface)" stroke="currentColor" stroke-width="2"/><text x="320" y="66" text-anchor="middle" font-size="13" fill="currentColor">R</text>
<text x="268" y="86" font-size="14" fill="var(--accent)">.1.1</text><text x="344" y="86" font-size="14" fill="var(--accent-warm)">.2.1</text>
<text x="320" y="15" text-anchor="middle" font-size="14" fill="currentColor">Internet</text>
<rect x="40" y="150" width="40" height="24" rx="3" fill="var(--surface)" stroke="var(--accent)" stroke-width="2.5"/><text x="60" y="186" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor">Tu PC</text>
<rect x="190" y="150" width="40" height="24" rx="3" fill="var(--surface)" stroke="currentColor" stroke-width="2"/><text x="210" y="186" text-anchor="middle" font-size="14" fill="currentColor">.1.11</text>
<rect x="485" y="150" width="40" height="24" rx="3" fill="var(--surface)" stroke="currentColor" stroke-width="2"/><text x="505" y="186" text-anchor="middle" font-size="14" fill="currentColor">.2.20</text>
</svg>`;

  registrarSimulacion('puerta-enlace', {
    ventana: 'Propiedades de IPv4 · PC de Contabilidad',
    mision: [
      'Haz ping al compañero de Contabilidad (192.168.1.11).',
      'Haz ping al PC del Taller (192.168.2.20).',
      'Haz ping a google.es.'
    ],
    final: `Apunta en tu cuaderno (pregunta ${PREG.puerta}): la IP, la máscara y la puerta de enlace que has puesto, y por qué con la puerta de enlace mal llegabas al compañero pero no al Taller.`,
    crear(ctx) {
      const { pantalla } = ctx;
      const s = { ip: '192.168.1.11', mascara: '255.255.255.0', pe: '192.168.2.1' };
      pantalla.appendChild(el('p', 'sim__ayuda', 'Han puesto a mano la configuración de tu PC y algo no va. Arréglala y prueba con ping. Recuerda: tu puerta de enlace es la IP del router en TU red.'));
      const mapa = el('div', 'sim__vista');
      mapa.innerHTML = MAPA_PE;
      pantalla.appendChild(mapa);
      const dos = el('div', 'sim__dos');
      pantalla.appendChild(dos);
      const ajustes = el('div', 'sim__ajustes');
      const prueba = el('div', 'sim__ajustes');
      dos.appendChild(ajustes);
      dos.appendChild(prueba);
      [['ip', 'Dirección IP'], ['mascara', 'Máscara de subred'], ['pe', 'Puerta de enlace predeterminada']].forEach(([k, t]) => {
        const i = entrada(s[k], t, '12rem');
        i.addEventListener('change', () => { s[k] = i.value.trim(); ctx.apunta(`${t}: ${s[k] || '(vacía)'}.`); });
        campo(ajustes, t, i);
      });
      const term = el('div', 'lab__terminal');
      term.setAttribute('translate', 'no');
      term.setAttribute('role', 'log');
      term.setAttribute('aria-label', 'Resultado del ping');
      const salida = el('div', 'lab__terminal-salida');
      term.appendChild(salida);
      const fila = el('div', 'lab__fila');
      [['ping 192.168.1.11', 0], ['ping 192.168.2.20', 1], ['ping google.es', 2]].forEach(([cmd, i]) => {
        const b = boton(cmd, 'lab__boton lab__boton--codigo');
        b.setAttribute('translate', 'no');
        b.addEventListener('click', () => ping(cmd, i));
        fila.appendChild(b);
      });
      prueba.appendChild(el('p', 'sim__etiqueta', 'Prueba'));
      prueba.appendChild(fila);
      prueba.appendChild(term);
      const aviso = el('div');
      aviso.setAttribute('aria-live', 'polite');
      pantalla.appendChild(aviso);

      function linea(t, clase) {
        const p = el('p', 'lab__terminal-linea');
        p.appendChild(el('span', clase || null, t));
        salida.appendChild(p);
        salida.scrollTop = salida.scrollHeight;
      }
      function problema() {
        const ip = ipValida(s.ip), pe = ipValida(s.pe);
        const masc = s.mascara.replace(/\s/g, '');
        if (!ip) return { local: 'La IP no está bien escrita: cuatro números de 0 a 255 separados por puntos.' };
        if (masc !== '255.255.255.0' && masc !== '/24') return { local: 'La máscara de esta red es 255.255.255.0.' };
        if (ip[0] !== 192 || ip[1] !== 168 || ip[2] !== 1) return { local: 'Tu IP no es de la red de Contabilidad (192.168.1.x): tu PC no puede hablar con los de su switch.' };
        if (ip[3] === 0 || ip[3] === 255) return { local: `La .${ip[3]} no se puede dar a un equipo: es la dirección de la red o la de broadcast.` };
        if (ip[3] === 11) return { local: 'La 192.168.1.11 ya la tiene tu compañero: IP duplicada. Pon otra libre.' };
        if (ip[3] === 1) return { local: 'La 192.168.1.1 es la del router: IP duplicada.' };
        if (!pe) return { fuera: 'Sin puerta de enlace, tu PC no sabe a quién darle lo que va a otra red.' };
        if (pe.join('.') !== '192.168.1.1') {
          if (pe[2] !== 1) return { fuera: `La puerta de enlace ${s.pe} no está en tu red: tu PC no puede llegar a ella. Tiene que ser la IP del router en Contabilidad.` };
          return { fuera: `En la ${s.pe} no hay ningún router. La puerta de enlace es la IP del router en tu red.` };
        }
        return {};
      }
      function ping(cmd, i) {
        const pr = problema();
        linea('C:\\> ' + cmd, 'lab__t-cmd');
        const dest = cmd.split(' ')[1];
        if (pr.local) {
          linea(i === 0 ? 'Host de destino inaccesible.' : 'Error general.', 'lab__t-mal');
          avisa(aviso, ctx, pr.local);
          ctx.falla(`${cmd}: no responde.`);
          return;
        }
        if (i > 0 && pr.fuera) {
          linea('Tiempo de espera agotado para esta solicitud.', 'lab__t-mal');
          avisa(aviso, ctx, pr.fuera);
          ctx.falla(`${cmd}: no responde.`);
          return;
        }
        const ipDest = i === 0 ? '192.168.1.11' : i === 1 ? '192.168.2.20' : '142.250.184.3';
        linea(`Respuesta desde ${ipDest}: bytes=32 tiempo=${i === 2 ? entre(9, 20) : 1}ms TTL=${i === 0 ? 128 : i === 1 ? 127 : 116}`, 'lab__t-dato');
        avisa(aviso, ctx, i === 0
          ? 'Responde: el compañero está en tu red, el paquete va por el switch y no necesita la puerta de enlace.'
          : 'Responde: el destino está en otra red, así que tu PC se lo da al router (tu puerta de enlace) y él lo lleva.', 'ok');
        ctx.cumple(i, `${cmd}: responde (${dest}).`);
      }
    }
  });

  /* ============================================================
     S9 · Protege la red de la empresa
     ============================================================ */
  registrarSimulacion('protege-empresa', {
    ventana: 'Router de la empresa · 192.168.1.1',
    mision: [
      'Que los clientes puedan ver la web de la empresa (servidor, puerto 443).',
      'Que nadie de Internet entre en los PC de la oficina sin que lo pidan.',
      'Que nadie de fuera maneje el servidor a distancia (puerto 3389).',
      'Que Ana trabaje desde casa con los archivos de la oficina, cifrado.',
      'Que desde la oficina no se pueda entrar en webs de apuestas.'
    ],
    final: `Apunta en tu cuaderno (pregunta ${PREG.protege}): qué has cambiado en cada pestaña (cortafuegos, proxy y VPN) y qué hace cada una.`,
    crear(ctx) {
      const { pantalla, boton: bot } = ctx;
      const s = { bloquea: false, p443: true, p3389: true, proxy: false, vpn: false };
      pantalla.appendChild(el('p', 'sim__ayuda', 'Alguien configuró este router con prisas: para que Ana trabajara desde casa, abrió el escritorio remoto del servidor a todo Internet. Déjalo bien con las tres pestañas.'));
      const marco = el('div', 'sim__nav');
      const tiras = el('div', 'sim__pestanas');
      tiras.setAttribute('role', 'tablist');
      const cuerpo = el('div', 'sim__web');
      marco.appendChild(tiras);
      marco.appendChild(cuerpo);
      pantalla.appendChild(marco);
      const estado = el('div', 'sim__vista');
      pantalla.appendChild(estado);
      const aviso = el('div');
      aviso.setAttribute('aria-live', 'polite');
      pantalla.appendChild(aviso);
      let activa = 'cf';
      const PEST = [['cf', 'Cortafuegos'], ['px', 'Proxy'], ['vpn', 'VPN']];

      function pestanas() {
        tiras.innerHTML = '';
        PEST.forEach(([k, t]) => {
          const b = bot(t, 'sim__pestana' + (k === activa ? ' sim__pestana--activa' : ''));
          b.setAttribute('role', 'tab');
          b.setAttribute('aria-selected', String(k === activa));
          b.addEventListener('click', () => { activa = k; pestanas(); panel(); });
          tiras.appendChild(b);
        });
      }
      function panel() {
        cuerpo.innerHTML = '';
        if (activa === 'cf') {
          cuerpo.appendChild(el('p', 'sim__h', 'Cortafuegos'));
          interruptor(cuerpo, 'Bloquear las conexiones que entran sin que nadie de dentro las haya pedido', s.bloquea, v => { s.bloquea = v; revisa(`Cortafuegos: ${v ? 'bloquea' : 'deja pasar'} lo que entra sin pedirlo.`); });
          cuerpo.appendChild(el('p', 'sim__etiqueta', 'Puertos del servidor abiertos a Internet'));
          interruptor(cuerpo, '443 · la web de la empresa', s.p443, v => { s.p443 = v; revisa(`Puerto 443 ${v ? 'abierto' : 'cerrado'}.`); });
          interruptor(cuerpo, '3389 · escritorio remoto (manejar el servidor a distancia)', s.p3389, v => {
            s.p3389 = v;
            revisa(`Puerto 3389 ${v ? 'abierto' : 'cerrado'}.`);
          });
        } else if (activa === 'px') {
          cuerpo.appendChild(el('p', 'sim__h', 'Proxy'));
          cuerpo.appendChild(el('p', 'sim__ayuda', 'Todos los ordenadores de la oficina salen a Internet a través del proxy.'));
          interruptor(cuerpo, 'Bloquear las webs de apuestas', s.proxy, v => { s.proxy = v; revisa(`Proxy: webs de apuestas ${v ? 'bloqueadas' : 'permitidas'}.`); });
        } else {
          cuerpo.appendChild(el('p', 'sim__h', 'VPN'));
          cuerpo.appendChild(el('p', 'sim__ayuda', 'Un túnel cifrado desde fuera hasta la red de la oficina. Cada persona entra con su usuario y su contraseña.'));
          interruptor(cuerpo, 'Activar la VPN para teletrabajo (usuaria: ana)', s.vpn, v => { s.vpn = v; revisa(`VPN ${v ? 'activada' : 'desactivada'}.`); });
        }
      }
      function revisa(texto) {
        const lista = [
          [s.p443, s.p443 ? 'Los clientes ven la web.' : 'Has cerrado el 443: los clientes no ven la web.'],
          [s.bloquea, s.bloquea ? 'Lo que entra sin pedirlo, se bloquea.' : 'Cualquiera de Internet puede intentar entrar en los PC.'],
          [!s.p3389, !s.p3389 ? 'El escritorio remoto no se ve desde Internet.' : 'El 3389 abierto: cualquiera puede intentar manejar el servidor.'],
          [s.vpn, s.vpn ? 'Ana entra por la VPN, cifrado.' : (s.p3389 ? 'Ana entra por el 3389 abierto a todo el mundo: funciona, pero es peligroso.' : 'Ana no puede trabajar desde casa.')],
          [s.proxy, s.proxy ? 'Las webs de apuestas, bloqueadas.' : 'Desde la oficina se entra en webs de apuestas.']
        ];
        estado.innerHTML = '';
        estado.appendChild(el('p', 'sim__h', 'Cómo está la red'));
        const ul = el('ul', 'sim__casillas');
        lista.forEach(([ok, t]) => {
          const li = el('li', null, (ok ? '✓ ' : '✗ ') + t);
          li.style.color = ok ? 'var(--text)' : 'var(--error)';
          ul.appendChild(li);
        });
        estado.appendChild(ul);
        lista.forEach(([ok], i) => (ok ? ctx.cumple(i) : ctx.deshace(i)));
        aviso.innerHTML = '';
        if (!s.p3389 && !s.vpn) aviso.appendChild(ctx.aviso('Cerrar el 3389 está bien, pero ahora Ana no puede trabajar. ¿Cómo entra de forma segura?', 'cuidado'));
        if (texto) ctx.apunta(texto);
      }
      pestanas();
      panel();
      revisa();
    }
  });
})();
