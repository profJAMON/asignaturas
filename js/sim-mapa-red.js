/* ============================================================
   Unidad 3 de Instalaciones, S4 «El mapa de la red» (23/11/2026).
   Va en tema.html después de js/simulador.js.

   Tres simulaciones sobre la misma oficina inventada (una academia
   con Recepción, Aula y Despacho), cada una enlazada a una pregunta
   obligatoria:

     mapa-que-va      Actividad 1 «¿Físico o lógico?»: salen datos de
                      la red en tarjetas y el alumno los pone en el
                      mapa que toca.                     → pregunta 1
     mapa-dibuja      Actividad 2 «Dibuja los dos mapas»: en el
                      físico, une cada aparato con su roseta y su
                      puerto siguiendo el parte del instalador (al
                      azar en cada intento); el portátil, por wifi.
                      En el lógico, una IP a cada aparato sin
                      repetir y en la red 192.168.1.0.  → pregunta 2
     mapa-que-miras   Actividad 3 «¿Qué mapa miras?»: encargos y
                      averías; primero se elige el mapa y después se
                      contesta mirándolo.                → pregunta 6

   «Lógico» aquí es el mapa lógico de la sesión (IP, red y puerta
   de enlace), no la topología lógica del hub de la S2.
   Sin colores nuevos: dentro de la ventana, las variables de
   siempre (--accent, --accent-warm, --ok, --error, --text…).
   CSS: bloque «Mapas de red» (.mr-*) en css/estilos.css.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof window.registrarSimulacion !== 'function' || !window.LAB) return;
  const { el, boton } = window.LAB;
  const PREG = { queVa: 1, dibuja: 2, queMiras: 6 };

  const barajar = l => {
    const a = l.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function avisa(caja, ctx, texto, tipo) {
    caja.innerHTML = '';
    if (texto) caja.appendChild(ctx.aviso(texto, tipo));
  }
  function noTraducir(n) { n.setAttribute('translate', 'no'); return n; }

  /* ============================================================
     La academia: salas, rosetas y aparatos
     ============================================================ */
  const SALAS = [
    { id: 'rec', nombre: 'Recepción', x: 4, w: 112 },
    { id: 'aula', nombre: 'Aula', x: 120, w: 150 },
    { id: 'desp', nombre: 'Despacho', x: 274, w: 82 }
  ];
  const ROSETAS = {
    'R-01': { sala: 'rec', x: 34 }, 'R-02': { sala: 'rec', x: 86 },
    'R-03': { sala: 'aula', x: 150 }, 'R-04': { sala: 'aula', x: 195 }, 'R-05': { sala: 'aula', x: 240 },
    'R-06': { sala: 'desp', x: 315 }
  };
  /* El portátil va el último: es el único sin cable. */
  const APARATOS = [
    { id: 'PC-REC', tipo: 'pc', sala: 'rec', x: 34, y: 132 },
    { id: 'IMPR-REC', tipo: 'impr', sala: 'rec', x: 86, y: 132 },
    { id: 'PC-AULA-1', tipo: 'pc', sala: 'aula', x: 150, y: 128 },
    { id: 'AP-AULA', tipo: 'ap', sala: 'aula', x: 235, y: 128 },
    { id: 'PC-AULA-2', tipo: 'pc', sala: 'aula', x: 150, y: 196 },
    { id: 'PC-DESP', tipo: 'pc', sala: 'desp', x: 315, y: 132 },
    { id: 'PORT-01', tipo: 'port', sala: 'aula', x: 235, y: 196, wifi: true }
  ];
  const CON_CABLE = APARATOS.filter(a => !a.wifi);
  const salaDe = id => SALAS.find(s => s.id === id).nombre;
  const aparato = id => APARATOS.find(a => a.id === id);
  const xPuerto = p => 118 + (p - 1) * 30;
  const RED = '192.168.1.';
  const IP_ROUTER = RED + '1';

  /* La oficina ya montada (la de la Actividad 3). */
  const FIJA = {
    conex: {
      'PC-REC': { r: 'R-01', p: 2 }, 'IMPR-REC': { r: 'R-02', p: 3 }, 'PC-AULA-1': { r: 'R-03', p: 4 },
      'AP-AULA': { r: 'R-05', p: 5 }, 'PC-AULA-2': { r: 'R-04', p: 6 }, 'PC-DESP': { r: 'R-06', p: 7 }
    },
    wifi: true,
    ips: {
      'PC-REC': RED + '10', 'IMPR-REC': RED + '20', 'PC-AULA-1': RED + '11', 'AP-AULA': RED + '2',
      'PC-AULA-2': RED + '12', 'PC-DESP': RED + '13', 'PORT-01': RED + '14'
    }
  };

  /* Un parte al azar: cada aparato, una roseta de su sala y un
     puerto libre (el 1 es el del router). */
  function parteAlAzar() {
    const conex = {};
    const puertos = barajar([2, 3, 4, 5, 6, 7, 8]);
    SALAS.forEach(s => {
      const rs = barajar(Object.keys(ROSETAS).filter(r => ROSETAS[r].sala === s.id));
      CON_CABLE.filter(a => a.sala === s.id).forEach((a, i) => { conex[a.id] = { r: rs[i] }; });
    });
    CON_CABLE.forEach((a, i) => { conex[a.id].p = puertos[i]; });
    return conex;
  }

  /* ============================================================
     Dibujos (SVG de 360 de ancho)
     ============================================================ */
  function icono(a, marcado) {
    const c = marcado ? 'var(--accent-warm)' : 'currentColor';
    const g = marcado ? 3 : 1.8;
    const { x, y } = a;
    let s = '';
    if (a.tipo === 'pc') s = `<rect x="${x - 13}" y="${y - 24}" width="26" height="17" rx="2" fill="var(--surface)" stroke="${c}" stroke-width="${g}"/><path d="M${x - 6} ${y - 3}h12M${x} ${y - 7}v4" stroke="${c}" stroke-width="${g}"/>`;
    else if (a.tipo === 'impr') s = `<rect x="${x - 14}" y="${y - 19}" width="28" height="14" rx="2" fill="var(--surface)" stroke="${c}" stroke-width="${g}"/><rect x="${x - 8}" y="${y - 25}" width="16" height="6" fill="var(--surface)" stroke="${c}" stroke-width="${g}"/>`;
    else if (a.tipo === 'ap') s = `<circle cx="${x}" cy="${y - 13}" r="9" fill="var(--surface)" stroke="${c}" stroke-width="${g}"/><path d="M${x - 5} ${y - 14}q5-5 10 0M${x - 2.5} ${y - 11}q2.5-2.5 5 0" fill="none" stroke="${c}" stroke-width="1.5"/>`;
    else s = `<rect x="${x - 11}" y="${y - 22}" width="22" height="14" rx="2" fill="var(--surface)" stroke="${c}" stroke-width="${g}"/><path d="M${x - 16} ${y - 6}h32" stroke="${c}" stroke-width="${g + 0.6}" stroke-linecap="round"/>`;
    return s + `<text x="${x}" y="${y + 9}" text-anchor="middle" font-size="10" fill="currentColor"${marcado ? ' font-weight="700"' : ''}>${a.id}</text>`;
  }

  /* d = { conex: {id: {r, p}}, wifi, sel, selRoseta } */
  function svgFisico(d, etiqueta) {
    const usados = {};
    Object.values(d.conex).forEach(c => { if (c.p) usados[c.p] = true; });
    let s = `<svg viewBox="0 0 360 252" class="mr-dibujo" role="img" aria-label="${esc(etiqueta)}" translate="no">`;
    s += '<rect x="4" y="4" width="352" height="54" rx="6" fill="none" stroke="var(--border)" stroke-width="1.5" stroke-dasharray="5 4"/>';
    s += '<text x="10" y="17" font-size="10" fill="var(--text-dim)">Armario (en Recepción)</text>';
    s += '<text x="348" y="17" text-anchor="end" font-size="10" fill="var(--text-dim)">SW-ACADEMIA</text>';
    s += '<rect x="12" y="25" width="58" height="22" rx="4" fill="var(--surface)" stroke="currentColor" stroke-width="1.8"/><text x="41" y="40" text-anchor="middle" font-size="10" fill="currentColor">ROUTER</text>';
    s += '<rect x="100" y="22" width="248" height="28" rx="4" fill="var(--surface)" stroke="currentColor" stroke-width="1.8"/>';
    s += '<path d="M70 36H108" stroke="var(--accent)" stroke-width="2.5"/>';
    for (let p = 1; p <= 8; p++) {
      const x = xPuerto(p);
      const lleno = p === 1 || usados[p];
      s += `<rect x="${x - 10}" y="29" width="20" height="15" rx="2" fill="${lleno ? 'var(--accent)' : 'var(--surface)'}" stroke="currentColor" stroke-width="1.2"/>`;
      s += `<text x="${x}" y="40.5" text-anchor="middle" font-size="9" fill="${lleno ? 'var(--surface)' : 'currentColor'}">${p}</text>`;
    }
    SALAS.forEach(z => {
      s += `<rect x="${z.x}" y="70" width="${z.w}" height="178" rx="4" fill="none" stroke="var(--text-dim)" stroke-width="1.5"/>`;
      s += `<text x="${z.x + z.w / 2}" y="242" text-anchor="middle" font-size="10" fill="var(--text-dim)">${z.nombre}</text>`;
    });
    /* Cables de pared (roseta → puerto), debajo de todo lo demás. */
    Object.values(d.conex).forEach(c => {
      if (c.r && c.p) s += `<path d="M${ROSETAS[c.r].x} 66L${xPuerto(c.p)} 44" stroke="var(--accent)" stroke-width="2.5"/>`;
    });
    Object.entries(ROSETAS).forEach(([r, v]) => {
      const marc = d.selRoseta === r;
      s += `<rect x="${v.x - 7}" y="65" width="14" height="10" rx="1.5" fill="var(--surface)" stroke="${marc ? 'var(--accent-warm)' : 'currentColor'}" stroke-width="${marc ? 3 : 1.5}"/>`;
      s += `<text x="${v.x}" y="86" text-anchor="middle" font-size="9" fill="var(--text-dim)">${r}</text>`;
    });
    /* Latiguillos (aparato → roseta). */
    Object.entries(d.conex).forEach(([id, c]) => {
      if (!c.r) return;
      const a = aparato(id);
      s += `<path d="M${a.x} ${a.y - 25}L${ROSETAS[c.r].x} 75" stroke="var(--accent)" stroke-width="2"/>`;
    });
    if (d.wifi) {
      const p = aparato('PORT-01'), ap = aparato('AP-AULA');
      s += `<path d="M${p.x} ${p.y - 23}L${ap.x} ${ap.y - 3}" stroke="var(--accent)" stroke-width="2" stroke-dasharray="4 4"/>`;
    }
    APARATOS.forEach(a => { s += icono(a, d.sel === a.id); });
    return s + '</svg>';
  }

  /* d = { ips: {id: ip}, malas: {id: true} } */
  function svgLogico(d, etiqueta) {
    let s = `<svg viewBox="0 0 360 252" class="mr-dibujo" role="img" aria-label="${esc(etiqueta)}" translate="no">`;
    s += '<rect x="6" y="6" width="348" height="30" rx="6" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="6 4"/>';
    s += '<text x="16" y="26" font-size="12" font-weight="700" fill="var(--accent)">Red 192.168.1.0 · máscara 255.255.255.0</text>';
    s += '<path d="M28 36V242" stroke="var(--accent)" stroke-width="3"/>';
    const filas = [{ id: 'ROUTER', ip: IP_ROUTER, nota: 'puerta de enlace' }]
      .concat(APARATOS.map(a => ({ id: a.id, ip: d.ips[a.id], nota: a.wifi ? 'va por wifi' : '', mala: d.malas && d.malas[a.id] })));
    filas.forEach((f, i) => {
      const y = 58 + i * 26;
      s += `<path d="M28 ${y - 4}H46" stroke="var(--accent)" stroke-width="2"/><circle cx="50" cy="${y - 4}" r="4" fill="var(--surface)" stroke="currentColor" stroke-width="1.5"/>`;
      s += `<text x="60" y="${y}" font-size="11" fill="currentColor">${f.id}</text>`;
      const color = !f.ip ? 'var(--accent-warm)' : f.mala ? 'var(--error)' : 'currentColor';
      s += `<text x="148" y="${y}" font-size="11" font-family="var(--font-mono, monospace)" fill="${color}"${f.ip ? '' : ' font-weight="700"'}>${f.ip || '¿?'}</text>`;
      if (f.nota) s += `<text x="236" y="${y}" font-size="9.5" fill="var(--text-dim)">${f.nota}</text>`;
    });
    return s + '</svg>';
  }

  function etiquetaFisico(d) {
    const partes = CON_CABLE.filter(a => d.conex[a.id] && d.conex[a.id].p)
      .map(a => `${a.id}, roseta ${d.conex[a.id].r}, puerto ${d.conex[a.id].p}`);
    return 'Mapa físico de la academia: armario con el router en el puerto 1 del switch; Recepción, Aula y Despacho con sus rosetas. ' +
      (partes.length ? 'Conectados: ' + partes.join('; ') + '. ' : 'Aún no hay aparatos conectados. ') +
      (d.wifi ? 'PORT-01 va por wifi a AP-AULA.' : '');
  }
  function etiquetaLogico(d) {
    return 'Mapa lógico de la academia: red 192.168.1.0; el router tiene la 192.168.1.1, la puerta de enlace. ' +
      APARATOS.map(a => `${a.id}: ${d.ips[a.id] || 'sin IP'}`).join('; ') + '.';
  }

  /* ============================================================
     Actividad 1 — ¿Físico o lógico?
     ============================================================ */
  const TARJETAS = [
    ['f', 'Roseta R-12', 'Una roseta es un sitio de la pared: sale en el mapa físico.'],
    ['f', 'Puerto 7 del switch', 'Dónde se pincha el cable es físico.'],
    ['f', 'Cable UTP cat. 6', 'El tipo de cable es físico: el lógico no dibuja cables.'],
    ['f', 'Despacho del fondo, planta 1', 'Dónde está cada cosa (sala, planta) es físico.'],
    ['f', 'El cable va por el falso techo', 'Por dónde va el cable es físico.'],
    ['f', 'Armario de la planta baja', 'Dónde está el armario es físico.'],
    ['f', 'Latiguillo de 2 m', 'Un latiguillo es un cable: físico.'],
    ['f', 'El portátil va sin cable, por wifi', 'Cómo se une el aparato (con cable o sin él) sale en el físico, con una línea discontinua hasta el punto de acceso.'],
    ['l', '192.168.1.20', 'Una dirección IP es lógica.'],
    ['l', 'Red 192.168.1.0', 'En qué red está cada aparato es lógico.'],
    ['l', 'Puerta de enlace 192.168.1.1', 'La puerta de enlace es una IP: lógico.'],
    ['l', 'Máscara 255.255.255.0', 'La máscara va con la IP: lógico.'],
    ['l', 'El portátil está en la misma red que los PC', 'En qué red está es lógico, vaya por cable o por wifi.'],
    ['l', 'Esta IP ya la tiene otro equipo', 'Las IP repetidas se ven en el mapa lógico.'],
    ['l', 'IP del servidor: 192.168.1.5', 'Una IP es lógica, sea del aparato que sea.'],
    ['l', 'El router tiene la 192.168.1.1', 'Es una IP: lógico. El router sale en los dos mapas, pero su IP solo en el lógico.']
  ];
  const META = 4;

  registrarSimulacion('mapa-que-va', {
    ventana: 'Mapas de la academia',
    mision: [
      `Pon bien ${META} tarjetas en el mapa físico.`,
      `Pon bien ${META} tarjetas en el mapa lógico.`
    ],
    final: `Apunta en tu cuaderno (pregunta ${PREG.queVa}): dos cosas que salen solo en el mapa físico y dos que salen solo en el lógico.`,
    crear(ctx) {
      const { pantalla } = ctx;
      let mazo = barajar(TARJETAS);
      const bien = { f: 0, l: 0 };
      pantalla.appendChild(el('p', 'sim__ayuda', 'Te llegan datos de la red de una academia. Pon cada uno en el mapa donde se dibuja.'));
      const carta = el('div', 'mr-tarjeta');
      carta.setAttribute('aria-live', 'polite');
      pantalla.appendChild(carta);
      const fila = el('div', 'lab__fila mr-elige');
      const bF = boton('Al mapa físico');
      const bL = boton('Al mapa lógico');
      fila.appendChild(bF);
      fila.appendChild(bL);
      pantalla.appendChild(fila);
      const aviso = el('div');
      aviso.setAttribute('aria-live', 'polite');
      pantalla.appendChild(aviso);
      const dos = el('div', 'sim__dos');
      pantalla.appendChild(dos);
      const listas = {};
      [['f', 'Mapa físico', '¿Dónde está? ¿Por dónde va el cable?'], ['l', 'Mapa lógico', '¿Qué IP tiene? ¿En qué red está?']].forEach(([k, t, sub]) => {
        const v = el('div', 'sim__vista');
        v.appendChild(el('p', 'sim__h', t));
        v.appendChild(el('p', 'sim__ayuda', sub));
        const ul = el('ul', 'mr-lista');
        ul.setAttribute('aria-label', 'Tarjetas en el ' + t.toLowerCase());
        v.appendChild(ul);
        dos.appendChild(v);
        listas[k] = ul;
      });

      function saca() {
        if (!mazo.length) mazo = barajar(TARJETAS);
        carta.innerHTML = '';
        carta.appendChild(noTraducir(el('span', 'mr-tarjeta__texto', mazo[0][1])));
      }
      function elige(k) {
        const [tipo, texto, porque] = mazo[0];
        if (tipo === k) {
          mazo.shift();
          listas[k].appendChild(noTraducir(el('li', null, texto)));
          bien[k]++;
          ctx.apunta(`«${texto}» → mapa ${k === 'f' ? 'físico' : 'lógico'}.`);
          avisa(aviso, ctx, porque, 'ok');
          if (bien[k] >= META) ctx.cumple(k === 'f' ? 0 : 1);
        } else {
          ctx.falla(`«${texto}» no va en el mapa ${k === 'f' ? 'físico' : 'lógico'}.`);
          avisa(aviso, ctx, `No. ${porque} Te la vuelvo a sacar más tarde.`);
          mazo.push(mazo.shift());
        }
        saca();
      }
      bF.addEventListener('click', () => elige('f'));
      bL.addEventListener('click', () => elige('l'));
      saca();
    }
  });

  /* ============================================================
     Actividad 2 — Dibuja los dos mapas
     ============================================================ */
  const IPS = [
    RED + '1', RED + '10', RED + '11', RED + '12', RED + '13', RED + '14', RED + '15', RED + '20', '192.168.2.14'
  ];

  registrarSimulacion('mapa-dibuja', {
    ventana: 'Mapas de la academia',
    mision: [
      'Mapa físico: une los seis aparatos de cable con su roseta y su puerto, como dice el parte.',
      'Mapa físico: une el portátil al punto de acceso.',
      'Mapa lógico: da a cada aparato una IP de la red 192.168.1.0, sin repetir.'
    ],
    final: `Apunta en tu cuaderno (pregunta ${PREG.dibuja}): la roseta, el puerto y la IP de PC-AULA-2, en qué mapa has mirado cada dato y cómo sale el portátil en cada mapa.`,
    crear(ctx) {
      const { pantalla } = ctx;
      const parte = parteAlAzar();
      const d = { conex: {}, wifi: false, sel: null, selRoseta: null };
      const ips = {};
      APARATOS.forEach(a => { ips[a.id] = ''; });

      const pestanas = el('div', 'sim__pestanas');
      pestanas.setAttribute('role', 'tablist');
      const tF = el('button', 'sim__pestana sim__pestana--activa', 'Mapa físico');
      const tL = el('button', 'sim__pestana', 'Mapa lógico');
      [tF, tL].forEach(t => { t.type = 'button'; t.setAttribute('role', 'tab'); pestanas.appendChild(t); });
      pantalla.appendChild(pestanas);
      const hojaF = el('div', 'mr-hoja');
      const hojaL = el('div', 'mr-hoja');
      hojaL.style.display = 'none';
      pantalla.appendChild(hojaF);
      pantalla.appendChild(hojaL);
      function ver(f) {
        hojaF.style.display = f ? '' : 'none';
        hojaL.style.display = f ? 'none' : '';
        tF.classList.toggle('sim__pestana--activa', f);
        tL.classList.toggle('sim__pestana--activa', !f);
        tF.setAttribute('aria-selected', String(f));
        tL.setAttribute('aria-selected', String(!f));
      }
      tF.addEventListener('click', () => ver(true));
      tL.addEventListener('click', () => ver(false));
      ver(true);

      /* ---- Físico ---- */
      hojaF.appendChild(el('p', 'sim__ayuda', 'Toca un aparato, después su roseta y después su puerto del switch. La línea continua es cable; la discontinua, wifi. El puerto 1 ya lo usa el router.'));
      const tabla = el('table', 'mr-parte');
      tabla.innerHTML = '<caption>Parte del instalador</caption><thead><tr><th>Aparato</th><th>Sala</th><th>Roseta → puerto</th></tr></thead>';
      const tb = el('tbody');
      APARATOS.forEach(a => {
        const tr = el('tr');
        const c = parte[a.id];
        [a.id, salaDe(a.sala), a.wifi ? 'wifi' : `${c.r} → ${c.p}`].forEach((t, i) => {
          const td = el('td', null, t);
          if (i !== 1) noTraducir(td);
          tr.appendChild(td);
        });
        tb.appendChild(tr);
      });
      tabla.appendChild(tb);
      const dibF = el('div', 'mr-vista');
      hojaF.appendChild(dibF);
      hojaF.appendChild(tabla);

      const grupos = el('div', 'mr-grupos');
      hojaF.appendChild(grupos);
      function grupo(titulo) {
        const g = el('div', 'mr-grupo');
        g.appendChild(el('p', 'sim__etiqueta', titulo));
        const f = el('div', 'lab__fila');
        g.appendChild(f);
        grupos.appendChild(g);
        return f;
      }
      const fA = grupo('1. Aparato');
      const fR = grupo('2. Roseta');
      const fP = grupo('3. Puerto del switch o wifi');
      const bAp = {}, bRo = {}, bPu = {};
      APARATOS.forEach(a => {
        const b = noTraducir(boton(a.id));
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => tocaAparato(a.id));
        fA.appendChild(b);
        bAp[a.id] = b;
      });
      Object.keys(ROSETAS).forEach(r => {
        const b = noTraducir(boton(r));
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => tocaRoseta(r));
        fR.appendChild(b);
        bRo[r] = b;
      });
      for (let p = 2; p <= 8; p++) {
        const b = boton('Puerto ' + p);
        b.addEventListener('click', () => tocaPuerto(p));
        fP.appendChild(b);
        bPu[p] = b;
      }
      const bWifi = boton('Por wifi a AP-AULA');
      bWifi.addEventListener('click', tocaWifi);
      fP.appendChild(bWifi);
      const avisoF = el('div');
      avisoF.setAttribute('aria-live', 'polite');
      hojaF.appendChild(avisoF);

      function pintaF() {
        dibF.innerHTML = svgFisico(d, etiquetaFisico(d));
        APARATOS.forEach(a => {
          const sel = d.sel === a.id;
          bAp[a.id].classList.toggle('lab__boton--activo', sel);
          bAp[a.id].setAttribute('aria-pressed', String(sel));
        });
        Object.keys(ROSETAS).forEach(r => {
          const sel = d.selRoseta === r;
          bRo[r].classList.toggle('lab__boton--activo', sel);
          bRo[r].setAttribute('aria-pressed', String(sel));
        });
      }
      function suelta() { d.sel = null; d.selRoseta = null; }
      function revisaF() {
        const hechos = CON_CABLE.every(a => d.conex[a.id] && d.conex[a.id].p);
        if (hechos) ctx.cumple(0, 'Los seis aparatos de cable están unidos a su roseta y su puerto.');
        if (d.wifi) ctx.cumple(1, 'PORT-01 va por wifi a AP-AULA: en el mapa físico, línea discontinua.');
      }
      function tocaAparato(id) {
        const a = aparato(id);
        if (a.wifi ? d.wifi : (d.conex[id] && d.conex[id].p)) {
          suelta();
          avisa(avisoF, ctx, `${id} ya está conectado.`, 'ok');
        } else {
          d.sel = id;
          d.selRoseta = null;
          avisa(avisoF, ctx, a.wifi ? `${id}: mira en el parte cómo se une.` : `${id}: ahora toca su roseta.`, 'cuidado');
        }
        pintaF();
      }
      function tocaRoseta(r) {
        if (!d.sel) { avisa(avisoF, ctx, 'Primero toca un aparato.', 'cuidado'); return; }
        const a = aparato(d.sel);
        if (a.wifi) {
          ctx.falla(`${a.id} a la roseta ${r}.`);
          avisa(avisoF, ctx, `${a.id} es un portátil que va sin cable: mira en el parte cómo se une.`);
          return;
        }
        const ocupada = CON_CABLE.find(o => d.conex[o.id] && d.conex[o.id].r === r);
        if (ocupada) {
          avisa(avisoF, ctx, `La roseta ${r} ya la usa ${ocupada.id}.`);
          return;
        }
        if (ROSETAS[r].sala !== a.sala) {
          ctx.falla(`${a.id} a la roseta ${r}.`);
          avisa(avisoF, ctx, `${r} está en ${salaDe(ROSETAS[r].sala)} y ${a.id} está en ${salaDe(a.sala)}: el latiguillo no llega. Mira la fila de ${a.id} en el parte.`);
          return;
        }
        if (parte[a.id].r !== r) {
          ctx.falla(`${a.id} a la roseta ${r}.`);
          avisa(avisoF, ctx, `${r} está en la sala buena, pero no es la del parte. Mira la fila de ${a.id}: la roseta va antes de la flecha.`);
          return;
        }
        d.selRoseta = r;
        avisa(avisoF, ctx, `Bien: ${a.id} a ${r}. Ahora, ¿a qué puerto del switch llega el cable de esa roseta?`, 'cuidado');
        pintaF();
      }
      function tocaPuerto(p) {
        if (!d.sel) { avisa(avisoF, ctx, 'Primero toca un aparato.', 'cuidado'); return; }
        const a = aparato(d.sel);
        if (a.wifi) {
          ctx.falla(`${a.id} al puerto ${p}.`);
          avisa(avisoF, ctx, `${a.id} va sin cable: no llega a ningún puerto del switch. Mira en el parte cómo se une.`);
          return;
        }
        if (!d.selRoseta) { avisa(avisoF, ctx, `Antes del puerto, toca la roseta de ${a.id}.`, 'cuidado'); return; }
        const ocupado = CON_CABLE.find(o => d.conex[o.id] && d.conex[o.id].p === p);
        if (ocupado) {
          avisa(avisoF, ctx, `El puerto ${p} ya lo usa ${ocupado.id}.`);
          return;
        }
        if (parte[a.id].p !== p) {
          ctx.falla(`${a.id} (${d.selRoseta}) al puerto ${p}.`);
          avisa(avisoF, ctx, `Ese no es el puerto del parte. Mira la fila de ${a.id}: el puerto va después de la flecha.`);
          return;
        }
        d.conex[a.id] = { r: d.selRoseta, p };
        ctx.apunta(`${a.id} → roseta ${d.selRoseta} → puerto ${p}.`);
        avisa(avisoF, ctx, `${a.id} conectado: ${d.selRoseta} y puerto ${p}.`, 'ok');
        suelta();
        pintaF();
        revisaF();
      }
      function tocaWifi() {
        if (!d.sel) { avisa(avisoF, ctx, 'Primero toca un aparato.', 'cuidado'); return; }
        const a = aparato(d.sel);
        if (!a.wifi) {
          ctx.falla(`${a.id} por wifi.`);
          avisa(avisoF, ctx, `${a.id} va con cable: en el parte tiene roseta y puerto.`);
          return;
        }
        d.wifi = true;
        ctx.apunta(`${a.id} → wifi a AP-AULA (sin cable).`);
        avisa(avisoF, ctx, `${a.id} va por wifi: en el mapa físico no tiene roseta ni puerto, solo una línea discontinua hasta el punto de acceso.`, 'ok');
        suelta();
        pintaF();
        revisaF();
      }

      /* ---- Lógico ---- */
      hojaL.appendChild(el('p', 'sim__ayuda', 'Aquí no hay salas, rosetas ni cables: solo la red y la IP de cada aparato. El router ya tiene la suya. Elige una IP para cada aparato, también para el portátil.'));
      const dibL = el('div', 'mr-vista');
      hojaL.appendChild(dibL);
      const campos = el('div', 'mr-ips');
      hojaL.appendChild(campos);
      const avisoL = el('div');
      avisoL.setAttribute('aria-live', 'polite');
      hojaL.appendChild(avisoL);
      APARATOS.forEach(a => {
        const l = el('label', 'sim__campo');
        l.appendChild(noTraducir(el('span', 'sim__etiqueta', a.id)));
        const s = document.createElement('select');
        s.className = 'lab__entrada sim__select';
        s.setAttribute('translate', 'no');
        const o0 = document.createElement('option');
        o0.value = '';
        o0.textContent = 'Elige…';
        o0.disabled = true;
        o0.hidden = true;
        o0.selected = true;
        s.appendChild(o0);
        IPS.forEach(ip => {
          const o = document.createElement('option');
          o.value = ip;
          o.textContent = ip;
          s.appendChild(o);
        });
        s.addEventListener('change', () => cambiaIp(a.id, s.value));
        l.appendChild(s);
        campos.appendChild(l);
      });
      function problemas() {
        const malas = {};
        const visto = {};
        APARATOS.forEach(a => {
          const ip = ips[a.id];
          if (!ip) return;
          if (!ip.startsWith(RED) || ip === IP_ROUTER) malas[a.id] = true;
          if (visto[ip]) { malas[a.id] = true; malas[visto[ip]] = true; } else visto[ip] = a.id;
        });
        return malas;
      }
      function pintaL() {
        const malas = problemas();
        dibL.innerHTML = svgLogico({ ips, malas }, etiquetaLogico({ ips }));
        const ok = APARATOS.every(a => ips[a.id]) && !Object.keys(malas).length;
        if (ok) ctx.cumple(2, 'Siete IP distintas, todas de la red 192.168.1.0.');
        else ctx.deshace(2);
      }
      function cambiaIp(id, ip) {
        ips[id] = ip;
        ctx.apunta(`${id}: ${ip}.`);
        const otro = APARATOS.find(a => a.id !== id && ips[a.id] === ip);
        if (ip === IP_ROUTER) {
          ctx.falla(`${id} con la ${ip}.`);
          avisa(avisoL, ctx, `La ${ip} es la del router: estaría repetida. Cada aparato, una IP distinta.`);
        } else if (!ip.startsWith(RED)) {
          ctx.falla(`${id} con la ${ip}.`);
          avisa(avisoL, ctx, `La ${ip} no es de la red 192.168.1.0 (mira el tercer número): ${id} no podría hablar con los demás.`);
        } else if (otro) {
          ctx.falla(`${id} con la ${ip}, que ya tiene ${otro.id}.`);
          avisa(avisoL, ctx, `La ${ip} ya la tiene ${otro.id}: IP repetida. Cambia una de las dos.`);
        } else if (aparato(id).wifi) {
          avisa(avisoL, ctx, `${id} va por wifi, pero en el mapa lógico está en la misma red que los demás.`, 'ok');
        } else {
          avisa(avisoL, ctx, '');
        }
        pintaL();
      }

      pintaF();
      pintaL();
    }
  });

  /* ============================================================
     Actividad 3 — ¿Qué mapa miras?
     ============================================================ */
  const ENCARGOS = [
    { m: 'f', t: 'PC-DESP no tiene red. Vas al armario a mirar si su cable está bien pinchado en el switch.',
      p: '¿A qué puerto del switch va?', o: ['Puerto 5', 'Puerto 6', 'Puerto 7', 'Puerto 8'], c: 2,
      pista: 'Busca PC-DESP y sigue su cable hasta el switch.' },
    { m: 'f', t: 'La impresora no imprime. Vas a mirar si su latiguillo se ha soltado de la pared.',
      p: '¿En qué roseta la buscas?', o: ['R-01', 'R-02', 'R-03', 'R-05'], c: 1,
      pista: 'Busca IMPR-REC y sigue su latiguillo hasta la pared.' },
    { m: 'f', t: 'El punto de acceso del aula se ha apagado. Quieres seguir su cable hasta el armario.',
      p: '¿A qué puerto del switch llega?', o: ['Puerto 4', 'Puerto 5', 'Puerto 6', 'Puerto 7'], c: 1,
      pista: 'Busca AP-AULA, su roseta y el cable que sube al switch.' },
    { m: 'f', t: 'Vas a cambiar el switch de sitio y tienes que volver a pinchar todos sus cables.',
      p: '¿Cuántos cables tienes que volver a pinchar?', o: ['6', '7', '8'], c: 1,
      pista: 'Cuenta los puertos ocupados del switch. No te olvides del router.' },
    { m: 'l', t: 'Llega un PC nuevo para el despacho y le vas a poner la IP a mano.',
      p: '¿Qué IP le puedes poner sin repetir?', o: ['192.168.1.12', '192.168.1.13', '192.168.1.15', '192.168.1.20'], c: 2,
      pista: 'Mira qué IP ya están dadas: no puedes repetir ninguna.' },
    { m: 'l', t: 'El PC nuevo ya tiene IP, pero no sale a Internet: le falta la puerta de enlace.',
      p: '¿Qué puerta de enlace le pones?', o: ['192.168.1.1', '192.168.1.10', '192.168.2.1'], c: 0,
      pista: 'La puerta de enlace es la IP del router.' },
    { m: 'l', t: 'Vas a añadir la impresora en un PC y te pide su dirección IP.',
      p: '¿Qué IP tiene IMPR-REC?', o: ['192.168.1.2', '192.168.1.13', '192.168.1.20', '192.168.1.1'], c: 2,
      pista: 'Busca la fila de IMPR-REC.' },
    { m: 'l', t: 'Un alumno pregunta si el portátil, que va por wifi, está en otra red que los PC del aula.',
      p: '¿En qué red está PORT-01?', o: ['192.168.1.0, como los demás', 'En ninguna: no tiene cable', '192.168.2.0'], c: 0,
      pista: 'Mira la línea de la red: ¿de dónde cuelga PORT-01?' }
  ];
  const META3 = 3;

  registrarSimulacion('mapa-que-miras', {
    ventana: 'Encargos de la academia',
    mision: [
      `Resuelve ${META3} encargos con el mapa físico.`,
      `Resuelve ${META3} encargos con el mapa lógico.`
    ],
    final: `Apunta en tu cuaderno (pregunta ${PREG.queMiras}): un encargo que has resuelto con el mapa físico, qué puerto o roseta has encontrado y qué te has ahorrado porque estaba apuntado en el mapa.`,
    crear(ctx) {
      const { pantalla } = ctx;
      let cola = barajar(ENCARGOS);
      const hechos = { f: 0, l: 0 };
      pantalla.appendChild(el('p', 'sim__ayuda', 'Trabajas en la academia. Para cada encargo, abre el mapa que te sirve y contesta mirándolo.'));
      const caja = el('div', 'mr-encargo');
      pantalla.appendChild(caja);

      function siguiente() {
        if (!cola.length) cola = barajar(ENCARGOS);
        const e = cola.shift();
        caja.innerHTML = '';
        caja.appendChild(el('p', 'sim__h', 'Encargo'));
        caja.appendChild(el('p', 'mr-encargo__texto', e.t));
        caja.appendChild(el('p', 'sim__etiqueta', '¿Qué mapa abres?'));
        const fila = el('div', 'lab__fila');
        const bF = boton('Mapa físico');
        const bL = boton('Mapa lógico');
        fila.appendChild(bF);
        fila.appendChild(bL);
        caja.appendChild(fila);
        const aviso = el('div');
        aviso.setAttribute('aria-live', 'polite');
        caja.appendChild(aviso);
        const zona = el('div', 'mr-hoja');
        caja.appendChild(zona);
        function abre(k) {
          if (k !== e.m) {
            ctx.falla(`Encargo: «${e.p}» → mapa ${k === 'f' ? 'físico' : 'lógico'}.`);
            avisa(aviso, ctx, k === 'f'
              ? 'En el mapa físico salen salas, rosetas, cables y puertos, pero no las IP. Prueba con el otro.'
              : 'En el mapa lógico salen la red y las IP, pero no las rosetas, los cables ni los puertos. Prueba con el otro.');
            return;
          }
          bF.disabled = true;
          bL.disabled = true;
          (k === 'f' ? bF : bL).classList.add('lab__boton--activo');
          avisa(aviso, ctx, '');
          ctx.apunta(`Encargo: abro el mapa ${k === 'f' ? 'físico' : 'lógico'}.`);
          const v = el('div', 'mr-vista');
          v.innerHTML = k === 'f' ? svgFisico(FIJA, etiquetaFisico(FIJA)) : svgLogico({ ips: FIJA.ips }, etiquetaLogico(FIJA));
          zona.appendChild(v);
          zona.appendChild(el('p', 'sim__pide', e.p));
          const op = el('div', 'lab__fila');
          const av2 = el('div');
          av2.setAttribute('aria-live', 'polite');
          e.o.forEach((t, i) => {
            const b = noTraducir(boton(t));
            b.addEventListener('click', () => {
              if (i !== e.c) {
                ctx.falla(`«${e.p}»: ${t}.`);
                avisa(av2, ctx, 'No. ' + e.pista);
                return;
              }
              op.querySelectorAll('button').forEach(x => { x.disabled = true; });
              b.classList.add('lab__boton--activo');
              ctx.apunta(`«${e.p}»: ${t}.`);
              hechos[k]++;
              if (hechos[k] >= META3) ctx.cumple(k === 'f' ? 0 : 1);
              avisa(av2, ctx, k === 'f'
                ? `Eso es: ${t}. Sin el mapa, tendrías que seguir el cable a mano.`
                : `Eso es: ${t}.`, 'ok');
              const sig = boton('Siguiente encargo →');
              sig.addEventListener('click', siguiente);
              av2.appendChild(sig);
            });
            op.appendChild(b);
          });
          zona.appendChild(op);
          zona.appendChild(av2);
        }
        bF.addEventListener('click', () => abre('f'));
        bL.addEventListener('click', () => abre('l'));
      }
      siguiente();
    }
  });
})();
