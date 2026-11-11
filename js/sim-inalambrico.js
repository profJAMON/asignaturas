/* ============================================================
   Simulaciones de la Unidad 5 de Instalaciones (sistemas
   inalámbricos), 11/11/2026. Usan el marco de js/simulador.js y
   van en tema.html después de él.

   elige-banda       S4 «Conecta cada aparato a su banda»: cinco
                     aparatos de una casa; el alumno elige 2,4 GHz
                     o 5 GHz para cada uno y ve cómo le va.
   router-seguro     S6 «Deja seguro el wifi de esta casa»: la
                     página de configuración de un router de mentira
                     (192.168.1.1) con todo mal puesto.
   coloca-repetidor  S8 «Coloca el repetidor»: plano de una casa;
                     el alumno elige dónde enchufa el repetidor y si
                     usa repetidor o wifi en malla, y ve las rayitas
                     y la velocidad en el dormitorio del fondo.

   Cada una va enlazada a una pregunta obligatoria («(Actividad 1)»).
   Sin colores nuevos: variables de siempre (--accent, --ok,
   --error, --accent-warm, --border, --text-dim).
   ============================================================ */

(function () {
  'use strict';
  if (typeof window.registrarSimulacion !== 'function') return;

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

  function rayitas(n) {
    /* 0-4 rayitas en SVG pequeño, con texto para lectores */
    let h = `<svg viewBox="0 0 40 24" width="40" height="24" role="img" aria-label="${n} de 4 rayitas">`;
    for (let i = 0; i < 4; i++) {
      const alto = 6 + i * 5;
      const color = i < n ? (n >= 3 ? 'var(--ok)' : n === 2 ? 'var(--accent-warm)' : 'var(--error)') : 'var(--border)';
      h += `<rect x="${2 + i * 10}" y="${24 - alto}" width="7" height="${alto}" rx="1" fill="${color}"></rect>`;
    }
    return h + '</svg>';
  }

  /* ============================================================
     S4 · Conecta cada aparato a su banda
     ============================================================ */
  const APARATOS = [
    { id: 'tele', nombre: 'Tele 4K del salón, a 2 m del router', lejos: false, pared: false, pide: 'mucha', solo24: false },
    { id: 'portatil', nombre: 'Portátil de arriba, detrás de una pared de ladrillo', lejos: true, pared: true, pide: 'normal', solo24: false },
    { id: 'movil', nombre: 'Móvil en el jardín', lejos: true, pared: false, pide: 'normal', solo24: false },
    { id: 'bombilla', nombre: 'Bombilla inteligente del pasillo', lejos: false, pared: false, pide: 'poca', solo24: true },
    { id: 'consola', nombre: 'Consola junto al router', lejos: false, pared: false, pide: 'mucha', solo24: false },
  ];

  function resultadoBanda(a, banda) {
    if (!banda) return { ok: false, texto: 'Sin conectar.' };
    if (a.solo24 && banda === '5') return { ok: false, mal: true, texto: 'No encuentra la red: casi todos los aparatos inteligentes solo tienen 2,4 GHz.' };
    if (banda === '5' && a.lejos) return { ok: false, mal: true, texto: a.pared ? 'Se corta: los 5 GHz atraviesan mal la pared de ladrillo.' : 'Se corta: los 5 GHz no llegan tan lejos.' };
    if (banda === '24' && a.pide === 'mucha') return { ok: false, mal: true, texto: 'Va, pero a tirones: está al lado del router y en 2,4 GHz desaprovecha la velocidad (y el microondas la molesta).' };
    if (banda === '24') return { ok: true, texto: a.lejos ? 'Bien: los 2,4 GHz llegan lejos y pasan mejor las paredes.' : 'Bien: no necesita velocidad y su chip solo va en 2,4 GHz.' };
    return { ok: true, texto: 'Muy bien: cerca del router, los 5 GHz dan mucha más velocidad.' };
  }

  registrarSimulacion('elige-banda', {
    ventana: 'App del router · Aparatos conectados',
    mision: APARATOS.map(a => `Que vaya bien: ${a.nombre.split(',')[0].toLowerCase()}.`),
    final: 'Apunta en tu cuaderno (pregunta 11): la banda de cada aparato y por qué.',
    crear(ctx) {
      const { el, pantalla } = ctx;
      pantalla.appendChild(el('p', 'sim__ayuda', 'El router emite dos redes: «Casa» (2,4 GHz) y «Casa-5G» (5 GHz). Elige a cuál conectas cada aparato.'));
      const lista = el('div', 'sim__ajustes');
      APARATOS.forEach((a, i) => {
        const caja = el('div', 'sim__vista');
        caja.appendChild(el('p', 'sim__h', a.nombre));
        const s = select([['', 'Elige la red…'], ['24', 'Casa (2,4 GHz)'], ['5', 'Casa-5G (5 GHz)']], '', `Red para ${a.nombre}`);
        s.style.flex = 'none';
        const res = el('p', 'sim__ayuda', 'Sin conectar.');
        res.setAttribute('aria-live', 'polite');
        s.addEventListener('change', () => {
          const r = resultadoBanda(a, s.value);
          res.textContent = r.texto;
          res.className = r.mal ? 'sim__peligro' : 'sim__ayuda';
          if (r.ok) ctx.cumple(i, `${a.nombre.split(',')[0]}: ${s.selectedOptions[0].textContent}.`);
          else { ctx.deshace(i); if (r.mal) ctx.falla(`${a.nombre.split(',')[0]}: ${r.texto}`); }
        });
        caja.appendChild(s);
        caja.appendChild(res);
        lista.appendChild(caja);
      });
      pantalla.appendChild(lista);
    },
  });

  /* ============================================================
     S6 · Deja seguro el wifi de esta casa
     ============================================================ */
  function fuerza(c) {
    if (!c) return { n: 0, t: 'Sin contraseña' };
    const comunes = ['12345678', '123456789', 'password', 'contraseña', 'qwerty123', '11111111', 'admin', 'admin1234'];
    if (comunes.includes(c.toLowerCase())) return { n: 0, t: 'De las primeras que se prueban' };
    const tipos = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(c)).length;
    if (c.length >= 12 && tipos >= 2) return { n: 3, t: 'Fuerte' };
    if (c.length >= 8) return { n: 2, t: 'Floja: corta o de un solo tipo' };
    return { n: 1, t: 'Muy floja: menos de 8 caracteres' };
  }

  registrarSimulacion('router-seguro', {
    ventana: 'http://192.168.1.1 · Configuración del router',
    mision: [
      'Cambia el nombre de la red: que no diga quién vive ahí.',
      'Pon la seguridad más fuerte que hay.',
      'Pon una contraseña wifi fuerte (12 caracteres o más, letras y números).',
      'Apaga el WPS.',
      'Cambia la contraseña de administración del router.',
    ],
    final: 'Apunta en tu cuaderno (pregunta 10): los cinco cambios que has hecho y para qué sirve cada uno.',
    crear(ctx) {
      const { el, pantalla } = ctx;
      const s = { ssid: 'Piso3B_Familia_Lopez', seg: 'wep', clave: '12345678', wps: true, oculta: false, admin: 'admin' };
      const original = s.ssid;

      pantalla.appendChild(el('p', 'sim__ayuda', 'Así viene el router de casa. Cambia los ajustes y mira «Lo que vería un vecino».'));
      const dos = el('div', 'sim__dos');
      const ajustes = el('div', 'sim__ajustes');
      const vista = el('div', 'sim__vista');
      dos.appendChild(ajustes);
      dos.appendChild(vista);
      pantalla.appendChild(dos);

      function campo(texto, control, ayuda) {
        const l = el('label', 'sim__campo');
        l.appendChild(el('span', 'sim__etiqueta', texto));
        l.appendChild(control);
        if (ayuda) l.appendChild(ayuda);
        ajustes.appendChild(l);
      }
      function entrada(valor, etiqueta) {
        const i = document.createElement('input');
        i.type = 'text';
        i.className = 'lab__entrada';
        i.value = valor;
        i.spellcheck = false;
        i.autocomplete = 'off';
        i.setAttribute('aria-label', etiqueta);
        i.setAttribute('translate', 'no');
        i.style.flex = 'none';
        return i;
      }
      function interruptor(texto, valor, alCambiar) {
        const l = el('label', 'sim__interruptor');
        const c = document.createElement('input');
        c.type = 'checkbox';
        c.checked = valor;
        c.addEventListener('change', () => alCambiar(c.checked));
        l.appendChild(c);
        l.appendChild(el('span', null, texto));
        ajustes.appendChild(l);
      }

      const iSsid = entrada(s.ssid, 'Nombre de la red (SSID)');
      iSsid.addEventListener('change', () => { s.ssid = iSsid.value.trim(); revisa(`Nombre de la red: ${s.ssid || '(vacío)'}.`); });
      campo('Nombre de la red (SSID)', iSsid);

      const sSeg = select([['abierta', 'Ninguna (red abierta)'], ['wep', 'WEP'], ['wpa', 'WPA'], ['wpa2', 'WPA2'], ['wpa3', 'WPA3']], s.seg, 'Seguridad');
      sSeg.addEventListener('change', () => { s.seg = sSeg.value; revisa(`Seguridad: ${sSeg.selectedOptions[0].textContent}.`); });
      campo('Seguridad', sSeg);

      const iClave = entrada(s.clave, 'Contraseña del wifi');
      const fClave = el('span', 'sim__ayuda');
      iClave.addEventListener('input', () => { s.clave = iClave.value; revisa(); });
      iClave.addEventListener('change', () => ctx.apunta(`Contraseña wifi: ${fuerza(s.clave).t.toLowerCase()}.`));
      campo('Contraseña del wifi', iClave, fClave);

      interruptor('WPS (conectar con el botón, sin contraseña)', s.wps, v => { s.wps = v; revisa(`WPS ${v ? 'encendido' : 'apagado'}.`); });
      interruptor('Ocultar el nombre de la red', s.oculta, v => {
        s.oculta = v;
        if (v) ctx.aviso('Ocultar el nombre no protege: cualquier programa de wifi encuentra la red igual. Lo que protege es WPA3 y una contraseña larga.', 'cuidado');
        revisa(`Nombre de la red ${v ? 'oculto' : 'visible'}.`);
      });

      const iAdmin = entrada(s.admin, 'Contraseña de administración');
      iAdmin.addEventListener('change', () => { s.admin = iAdmin.value; revisa(`Contraseña de administración: ${fuerza(s.admin).t.toLowerCase()}.`); });
      campo('Contraseña para entrar aquí (admin)', iAdmin);

      function revisa(texto) {
        const malNombre = !s.ssid || s.ssid === original || /lopez|3b|piso|familia/i.test(s.ssid);
        const f = fuerza(s.clave);
        const fa = fuerza(s.admin);
        fClave.textContent = `Fuerza: ${f.t}`;
        fClave.className = f.n >= 3 ? 'sim__ayuda' : 'sim__peligro';

        const riesgos = [];
        if (malNombre) riesgos.push('El nombre de la red dice quién vive ahí: sé a qué piso pertenece.');
        if (s.seg === 'abierta') riesgos.push('Red abierta: me conecto sin contraseña y veo todo lo que no vaya cifrado.');
        else if (s.seg === 'wep') riesgos.push('WEP se rompe en unos minutos con un programa gratis.');
        else if (s.seg === 'wpa') riesgos.push('WPA está anticuado: tiene fallos conocidos.');
        else if (s.seg === 'wpa2') riesgos.push('WPA2 está bien, pero WPA3 es más seguro si tus aparatos lo admiten.');
        if (s.seg !== 'abierta' && f.n < 3) riesgos.push('La contraseña del wifi se adivina probando las más usadas.');
        if (s.wps) riesgos.push('El WPS está encendido: se puede atacar para entrar sin la contraseña.');
        if (fa.n < 2 || s.admin === s.clave) riesgos.push('La contraseña de admin es la de fábrica (o la del wifi): si entro en la red, cambio el router a mi gusto.');

        vista.innerHTML = '';
        vista.appendChild(el('p', 'sim__h', 'Lo que vería un vecino'));
        const red = el('p', 'sim__ayuda', s.oculta ? 'Red oculta… pero mi programa la encuentra igual.' : `Redes cerca: «${s.ssid || '(sin nombre)'}»`);
        red.setAttribute('translate', 'no');
        vista.appendChild(red);
        const ul = el('ul');
        ul.setAttribute('aria-live', 'polite');
        if (!riesgos.length) ul.appendChild(el('li', null, 'No puedo hacer nada: la red está bien protegida.'));
        riesgos.forEach(r => ul.appendChild(el('li', 'sim__peligro', r)));
        vista.appendChild(ul);

        const ok = [!malNombre, s.seg === 'wpa3', s.seg !== 'abierta' && f.n >= 3, !s.wps, fa.n >= 2 && s.admin !== 'admin' && s.admin !== s.clave];
        ok.forEach((v, i) => (v ? ctx.cumple(i) : ctx.deshace(i)));
        if (texto) ctx.apunta(texto);
      }
      revisa();
    },
  });

  /* ============================================================
     S8 · Coloca el repetidor
     ============================================================ */
  const ROUTER = [60, 200];
  const FONDO = [500, 90];
  const SITIOS = [
    { id: 'A', x: 110, y: 205, nombre: 'Salón, pegado al router' },
    { id: 'B', x: 280, y: 150, nombre: 'Pasillo, a mitad de camino' },
    { id: 'C', x: 430, y: 150, nombre: 'Dormitorio del fondo' },
    { id: 'D', x: 250, y: 255, nombre: 'Cocina, encima del microondas', pega: 1, porque: 'el microondas molesta al wifi' },
    { id: 'E', x: 300, y: 60, nombre: 'Dentro del armario metálico del pasillo', pega: 2, porque: 'el metal frena la señal' },
  ];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  function barras(d) { return d < 130 ? 4 : d < 250 ? 3 : d < 330 ? 2 : d < 420 ? 1 : 0; }
  const VEL = [0, 20, 60, 120, 200];

  function plano(sitio, modo, llega, sale) {
    const R = r => `<circle cx="${r.x}" cy="${r.y}"`;
    const radio = n => [0, 110, 190, 250, 250][n];
    let h = '<svg viewBox="0 0 560 300" width="100%" role="img" aria-label="Plano de la casa con el router, los sitios posibles y la cobertura" style="max-width:560px">';
    /* cobertura */
    h += `<circle cx="${ROUTER[0]}" cy="${ROUTER[1]}" r="250" fill="var(--accent)" opacity="0.12"></circle>`;
    if (sitio && llega > 0) h += `${R(sitio)} r="${radio(llega)}" fill="${modo === 'malla' ? 'var(--ok)' : 'var(--accent-warm)'}" opacity="0.14"></circle>`;
    /* habitaciones */
    const hab = [[20, 140, 170, 140, 'Salón'], [190, 200, 150, 80, 'Cocina'], [190, 110, 180, 90, 'Pasillo'], [20, 20, 170, 120, 'Dormitorio 1'], [190, 20, 180, 90, 'Baño'], [370, 20, 170, 180, 'Dormitorio del fondo'], [340, 200, 200, 80, 'Terraza']];
    hab.forEach(([x, y, w, ht, n]) => {
      h += `<rect x="${x}" y="${y}" width="${w}" height="${ht}" fill="none" stroke="var(--border)" stroke-width="3"></rect>`;
      h += `<text x="${x + 6}" y="${y + 16}" font-size="14" fill="var(--text-dim)">${n}</text>`;
    });
    /* router */
    h += `<rect x="${ROUTER[0] - 14}" y="${ROUTER[1] - 8}" width="28" height="16" rx="3" fill="var(--accent)"></rect><text x="${ROUTER[0]}" y="${ROUTER[1] + 24}" font-size="11" text-anchor="middle" fill="currentColor">Router</text>`;
    /* persona en el fondo */
    h += `<circle cx="${FONDO[0]}" cy="${FONDO[1] - 10}" r="6" fill="currentColor"></circle><rect x="${FONDO[0] - 5}" y="${FONDO[1] - 3}" width="10" height="18" rx="3" fill="currentColor"></rect>`;
    h += `<text x="${FONDO[0]}" y="${FONDO[1] + 30}" font-size="11" text-anchor="middle" fill="currentColor">Tú, con el móvil</text>`;
    /* sitios */
    SITIOS.forEach(s => {
      const elegido = sitio && sitio.id === s.id;
      h += `<circle cx="${s.x}" cy="${s.y}" r="${elegido ? 11 : 9}" fill="${elegido ? (modo === 'malla' ? 'var(--ok)' : 'var(--accent-warm)') : 'none'}" stroke="currentColor" stroke-width="2"></circle>`;
      h += `<text x="${s.x}" y="${s.y + 4}" font-size="11" font-weight="700" text-anchor="middle" fill="${elegido ? 'var(--bg, #000)' : 'currentColor'}">${s.id}</text>`;
    });
    if (sitio) h += `<line x1="${ROUTER[0]}" y1="${ROUTER[1]}" x2="${sitio.x}" y2="${sitio.y}" stroke="var(--text-dim)" stroke-dasharray="4 4"></line>`;
    return h + '</svg>';
  }

  registrarSimulacion('coloca-repetidor', {
    ventana: 'App de wifi · Plano de casa',
    mision: [
      'Pon el repetidor donde le llegue buena señal del router (3 rayitas o más).',
      'Consigue 3 rayitas o más en el dormitorio del fondo.',
      'Consigue 100 Mbps o más en el dormitorio del fondo.',
    ],
    final: 'Apunta en tu cuaderno (pregunta 8): en qué sitio lo has puesto, por qué los otros sitios no valían y qué has tenido que cambiar para pasar de 100 Mbps.',
    crear(ctx) {
      const { el, pantalla } = ctx;
      let sitio = null;
      let modo = 'repetidor';
      pantalla.appendChild(el('p', 'sim__ayuda', 'En el dormitorio del fondo no llega el wifi. Elige dónde enchufas el aparato y mira las rayitas y la velocidad.'));
      const vista = el('div', 'sim__vista');
      pantalla.appendChild(vista);
      const datos = el('div', 'sim__ajustes');
      datos.setAttribute('aria-live', 'polite');
      pantalla.appendChild(datos);

      const dos = el('div', 'sim__dos');
      const sSitio = select([['', 'Elige un sitio…']].concat(SITIOS.map(s => [s.id, `${s.id} · ${s.nombre}`])), '', 'Dónde enchufas el aparato');
      const sModo = select([['repetidor', 'Un repetidor'], ['malla', 'Wifi en malla (dos aparatos iguales)']], modo, 'Qué aparato usas');
      [['Dónde lo enchufas', sSitio], ['Qué aparato usas', sModo]].forEach(([t, c]) => {
        const l = el('label', 'sim__campo');
        l.appendChild(el('span', 'sim__etiqueta', t));
        l.appendChild(c);
        dos.appendChild(l);
      });
      pantalla.appendChild(dos);

      function fila(texto, n, extra) {
        const p = el('p', 'sim__etiqueta');
        p.innerHTML = `${rayitas(n)} `;
        p.appendChild(document.createTextNode(texto + (extra ? ` · ${extra}` : '')));
        p.style.display = 'flex';
        p.style.alignItems = 'center';
        p.style.gap = '0.5rem';
        return p;
      }

      function actualizar(texto) {
        let llega = 0, sale = barras(dist(ROUTER, FONDO)), vel = VEL[sale];
        if (sitio) {
          llega = Math.max(0, barras(dist(ROUTER, [sitio.x, sitio.y])) - (sitio.pega || 0));
          const desde = llega > 0 ? Math.min(llega, barras(dist([sitio.x, sitio.y], FONDO))) : 0;
          if (desde > sale) {
            sale = desde;
            vel = Math.round(VEL[desde] * (modo === 'malla' ? 0.9 : 0.5));
          }
        }
        vista.innerHTML = plano(sitio, modo, llega, sale);
        datos.innerHTML = '';
        if (sitio) datos.appendChild(fila(`Al ${modo === 'malla' ? 'segundo aparato' : 'repetidor'} le llega del router`, llega, llega === 0 ? 'no se conecta' : null));
        datos.appendChild(fila('En el dormitorio del fondo', sale, `${vel} Mbps`));

        sitio && llega >= 3 ? ctx.cumple(0) : ctx.deshace(0);
        sale >= 3 ? ctx.cumple(1) : ctx.deshace(1);
        vel >= 100 ? ctx.cumple(2) : ctx.deshace(2);
        if (texto) ctx.apunta(texto);
        if (sitio && sitio.pega) ctx.falla(`Sitio ${sitio.id}: ${sitio.porque}.`);
        else if (sitio && llega > 0 && llega < 3) ctx.falla(`Sitio ${sitio.id}: le llega poca señal; repite una señal mala.`);
        if (sale >= 3 && vel < 100 && modo === 'repetidor') ctx.aviso('Ya hay señal, pero el repetidor escucha y repite por turnos: la velocidad baja a la mitad. ¿Qué aparato pierde menos?', 'cuidado');
      }

      sSitio.addEventListener('change', () => {
        sitio = SITIOS.find(s => s.id === sSitio.value);
        actualizar(`Aparato en ${sitio.id}: ${sitio.nombre.toLowerCase()}.`);
      });
      sModo.addEventListener('change', () => {
        modo = sModo.value;
        actualizar(modo === 'malla' ? 'Cambias a wifi en malla.' : 'Vuelves al repetidor.');
      });
      actualizar();
    },
  });
})();
