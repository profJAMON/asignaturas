/* ============================================================
   Unidad 7 de Instalaciones (subredes de clase B), 15/11/2026.
   Va en tema.html después de js/simulador.js y de
   js/generadores-subredes.js.

   LABORATORIO «hoja-b» (Toca y mira)
     <div class="lab" data-lab="hoja-b" data-red="172.16.0.0"
          data-bits="5" aria-label="…"></div>
     La hoja doble con un corte que se mueve con «− 1 bit» y «+ 1 bit».
     Debajo, al momento: máscara, subredes, direcciones, equipos, salto
     (y en qué número cae), la 1ª y la 2ª subred.

   SIMULACIONES (con pregunta enlazada)
     da-ip            S6 «¿Se la doy?»: peticiones de IP; dársela o decir
                      que es la de red o el broadcast.
     empresa-subredes S7 «Las subredes de la empresa»: elegir los bits
                      y sacar la red, la puerta de enlace y el broadcast
                      de un departamento.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window === 'undefined' || !window.LAB) return;
  const { el, boton, cabecera } = window.LAB;
  const PESOS = [128, 64, 32, 16, 8, 4, 2, 1];
  const PREG = { daIp: 10, empresa: 9 };
  const miles = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const entre = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const azar = l => l[Math.floor(Math.random() * l.length)];

  function calcB(o1, o2, bits) {
    const dirs = Math.pow(2, 16 - bits);
    const enTercero = bits <= 8;
    const suma = enTercero ? PESOS.slice(0, bits) : PESOS.slice(0, bits - 8);
    const s = suma.reduce((a, b) => a + b, 0);
    const dir = off => `${o1}.${o2}.${Math.floor(off / 256)}.${off % 256}`;
    return {
      bits, dirs, enTercero, suma, s, dir,
      mascara: enTercero ? `255.255.${s}.0` : `255.255.255.${s}`,
      prefijo: 16 + bits, subredes: Math.pow(2, bits),
      salto: enTercero ? PESOS[bits - 1] : PESOS[bits - 9],
      numero: enTercero ? '3º' : '4º'
    };
  }
  const limpia = t => String(t || '').trim().replace(/\s+/g, '');

  /* ---------- laboratorio hoja-b ---------- */
  window.registrarLab('hoja-b', caja => {
    cabecera(caja);
    const o = (caja.dataset.red || '172.16.0.0').split('.').map(Number);
    let bits = Math.min(14, Math.max(1, Number(caja.dataset.bits) || 3));
    const tabla = el('table', 'hoja-bits hoja-doble');
    tabla.setAttribute('translate', 'no');
    const fila = el('div', 'lab__fila');
    const menos = boton('− 1 bit'), mas = boton('+ 1 bit');
    fila.appendChild(menos);
    fila.appendChild(mas);
    const datos = el('div', 'lab__nota');
    datos.setAttribute('aria-live', 'polite');
    caja.appendChild(el('p', 'lab__nota', `Red ${o.join('.')} (clase B). Mueve el corte y mira cómo cambia todo.`));
    caja.appendChild(fila);
    caja.appendChild(tabla);
    caja.appendChild(datos);
    function pinta() {
      const r = calcB(o[0], o[1], bits);
      const celda = (i, t) => {
        const cog = i < bits, ult = i === bits - 1;
        return `<td style="${cog ? 'background:color-mix(in srgb, var(--accent) 24%, transparent);' : ''}${ult ? 'outline:2px solid var(--accent-warm);font-weight:700;' : ''}${i === bits - 1 ? 'border-right:3px solid var(--accent-warm);' : ''}">${t}</td>`;
      };
      let h = '';
      [0, 1].forEach(f => {
        const cols = [0, 1, 2, 3, 4, 5, 6, 7].map(c => f * 8 + c);
        h += `<tr><th>${f === 0 ? '3º nº' : '4º nº'}</th>${cols.map(i => `<th>${i + 1}</th>`).join('')}</tr>`;
        h += `<tr><td><strong>Peso</strong></td>${cols.map(i => celda(i, PESOS[i % 8])).join('')}</tr>`;
        h += `<tr><td><strong>Sub.</strong></td>${cols.map(i => celda(i, Math.pow(2, i + 1))).join('')}</tr>`;
        h += `<tr><td><strong>Dir.</strong></td>${cols.map(i => celda(i, Math.pow(2, 15 - i))).join('')}</tr>`;
      });
      tabla.innerHTML = h;
      const fin = r.dirs - 1;
      datos.innerHTML = `<p><strong>${bits} bits cogidos</strong> → máscara <strong translate="no">${r.mascara}</strong> (/${r.prefijo}) · ${miles(r.subredes)} subredes de ${miles(r.dirs)} direcciones · <strong>${miles(r.dirs - 2)} equipos</strong> en cada una · <strong>salto ${r.salto} en el ${r.numero} número</strong>.</p>` +
        `<p translate="no">1ª subred: ${r.dir(0)} · equipos de ${r.dir(1)} a ${r.dir(fin - 1)} · broadcast ${r.dir(fin)} · 2ª subred: ${r.dir(r.dirs)}</p>`;
      menos.disabled = bits <= 1;
      mas.disabled = bits >= 14;
    }
    menos.addEventListener('click', () => { bits--; pinta(); });
    mas.addEventListener('click', () => { bits++; pinta(); });
    pinta();
  });

  if (typeof window.registrarSimulacion !== 'function') return;
  function avisa(caja, ctx, texto, tipo) {
    caja.innerHTML = '';
    if (texto) caja.appendChild(ctx.aviso(texto, tipo));
  }

  /* ============================================================
     S6 · ¿Se la doy?
     ============================================================ */
  const ESCENARIOS = [
    { red: [172, 20], bits: 6 },   // 255.255.252.0, salto 4 en el 3º
    { red: [150, 8], bits: 10 },   // 255.255.255.192, salto 64 en el 4º
    { red: [130, 45], bits: 4 },   // 255.255.240.0, salto 16 en el 3º
    { red: [165, 3], bits: 9 }     // 255.255.255.128, salto 128 en el 4º
  ];
  registrarSimulacion('da-ip', {
    ventana: 'Gestor de direcciones del instituto',
    mision: [
      'Da una IP que sí se puede dar.',
      'Rechaza una dirección de red.',
      'Rechaza un broadcast.',
      'Acierta 5 peticiones seguidas.'
    ],
    final: `Apunta en tu cuaderno (pregunta ${PREG.daIp}): tres de las IP que te han pedido, con su máscara, y qué has contestado en cada una y por qué (en qué subred está y cuál es su red y su broadcast).`,
    crear(ctx) {
      const { pantalla } = ctx;
      let r, red, pet, seguidas = 0;
      pantalla.appendChild(el('p', 'sim__ayuda', 'Eres quien reparte las IP del instituto. Los ordenadores te piden una dirección: decide si se la das. No se dan ni la dirección de red ni el broadcast de una subred.'));
      const info = el('div', 'sim__vista');
      info.setAttribute('translate', 'no');
      pantalla.appendChild(info);
      const fila = el('div', 'lab__fila');
      const bDar = boton('✓ Dársela');
      const bRed = boton('✗ Es la dirección de red');
      const bBc = boton('✗ Es el broadcast');
      [bDar, bRed, bBc].forEach(b => fila.appendChild(b));
      pantalla.appendChild(fila);
      const res = el('div');
      res.setAttribute('aria-live', 'polite');
      pantalla.appendChild(res);
      const bOtra = boton('Siguiente petición →');
      const bRed2 = boton('↻ Otra red');
      const f2 = el('div', 'lab__fila');
      f2.appendChild(bOtra);
      f2.appendChild(bRed2);
      pantalla.appendChild(f2);

      function nuevaRed() {
        const e = azar(ESCENARIOS.filter(x => !red || x !== red));
        red = e;
        r = calcB(e.red[0], e.red[1], e.bits);
        nueva();
      }
      function nueva() {
        const pend = ['si', 'red', 'bc'].filter((t, i) => !ctx.hecho(i));
        const tipo = azar(pend.length ? pend.concat(['si']) : ['si', 'si', 'red', 'bc']);
        const k = entre(1, Math.min(r.subredes, 10));
        const ini = (k - 1) * r.dirs, fin = ini + r.dirs - 1;
        const off = tipo === 'red' ? ini : tipo === 'bc' ? fin : entre(ini + 1, fin - 1);
        pet = { tipo, k, ini, fin, ip: r.dir(off) };
        info.innerHTML = `<p class="sim__h">Red del instituto: ${red.red.join('.')}.0.0 · máscara ${r.mascara}</p>` +
          `<p style="font-size:1.35em">Un PC pide: <strong>${pet.ip}</strong></p>`;
        res.innerHTML = '';
        [bDar, bRed, bBc].forEach(b => { b.disabled = false; });
        bOtra.disabled = true;
      }
      function contesta(t) {
        const bien = t === pet.tipo;
        const porque = `Salto ${r.salto} en el ${r.numero} número: ${pet.ip} está en la ${pet.k}ª subred, de ${r.dir(pet.ini)} (red) a ${r.dir(pet.fin)} (broadcast).`;
        [bDar, bRed, bBc].forEach(b => { b.disabled = true; });
        bOtra.disabled = false;
        if (bien) {
          seguidas++;
          avisa(res, ctx, `¡Bien! ${porque}`, 'ok');
          ctx.cumple({ si: 0, red: 1, bc: 2 }[t], `${pet.ip} (${r.mascara}): ${t === 'si' ? 'dada' : t === 'red' ? 'es la de red' : 'es el broadcast'}.`);
          if (seguidas >= 5) ctx.cumple(3, '5 peticiones seguidas.');
        } else {
          seguidas = 0;
          avisa(res, ctx, `No. ${porque}`);
          ctx.falla(`${pet.ip}: fallada.`);
        }
      }
      bDar.addEventListener('click', () => contesta('si'));
      bRed.addEventListener('click', () => contesta('red'));
      bBc.addEventListener('click', () => contesta('bc'));
      bOtra.addEventListener('click', nueva);
      bRed2.addEventListener('click', () => { ctx.apunta('Cambias de red.'); nuevaRed(); });
      nuevaRed();
    }
  });

  /* ============================================================
     S7 · Las subredes de la empresa
     ============================================================ */
  registrarSimulacion('empresa-subredes', {
    ventana: 'Plan de direcciones · 172.30.0.0',
    mision: [
      'Elige cuántos bits coges: que haya 6 subredes y quepan 900 equipos en cada una.',
      'Escribe la dirección de red de Ventas (la 2ª subred).',
      'Escribe su puerta de enlace (el primer equipo).',
      'Escribe su broadcast.'
    ],
    final: `Apunta en tu cuaderno (pregunta ${PREG.empresa}): los bits que has cogido, la máscara y, de Ventas, la red, la puerta de enlace y el broadcast.`,
    crear(ctx) {
      const { pantalla } = ctx;
      pantalla.appendChild(el('p', 'sim__ayuda', 'Una empresa con la red 172.30.0.0 tiene 6 departamentos. El más grande tendrá 900 equipos. A cada departamento le toca una subred, por orden: Dirección la 1ª, Ventas la 2ª… La puerta de enlace es el primer equipo de cada subred.'));
      const dos = el('div', 'sim__dos');
      pantalla.appendChild(dos);
      const izq = el('div', 'sim__ajustes'), der = el('div', 'sim__ajustes');
      dos.appendChild(izq);
      dos.appendChild(der);
      const sel = document.createElement('select');
      sel.className = 'lab__entrada sim__select';
      sel.setAttribute('aria-label', 'Bits que cojo');
      sel.innerHTML = '<option value="" disabled hidden selected>Elige…</option>' + Array.from({ length: 14 }, (_, i) => `<option value="${i + 1}">${i + 1} bit${i ? 's' : ''}</option>`).join('');
      const l = el('label', 'sim__campo');
      l.appendChild(el('span', 'sim__etiqueta', '1. Bits que cojo'));
      l.appendChild(sel);
      izq.appendChild(l);
      const resumen = el('p', 'sim__etiqueta');
      resumen.setAttribute('translate', 'no');
      izq.appendChild(resumen);
      der.appendChild(el('p', 'sim__h', '2. Ventas (2ª subred)'));
      const campos = ['Dirección de red', 'Puerta de enlace', 'Broadcast'].map(t => {
        const i = document.createElement('input');
        i.type = 'text'; i.className = 'lab__entrada'; i.spellcheck = false; i.autocomplete = 'off';
        i.setAttribute('aria-label', t); i.setAttribute('translate', 'no'); i.disabled = true;
        const c = el('label', 'sim__campo');
        c.appendChild(el('span', 'sim__etiqueta', t));
        c.appendChild(i);
        der.appendChild(c);
        return i;
      });
      const bComp = boton('Comprobar');
      bComp.disabled = true;
      der.appendChild(bComp);
      const aviso = el('div');
      aviso.setAttribute('aria-live', 'polite');
      pantalla.appendChild(aviso);
      let r = null;
      sel.addEventListener('change', () => {
        const b = Number(sel.value);
        r = calcB(172, 30, b);
        resumen.textContent = `Máscara ${r.mascara} (/${r.prefijo}) · ${miles(r.subredes)} subredes · ${miles(r.dirs - 2)} equipos en cada una · salto ${r.salto} en el ${r.numero} número`;
        ctx.apunta(`Cojo ${b} bits: ${r.mascara}.`);
        [1, 2, 3].forEach(i => ctx.deshace(i));
        if (r.subredes < 6) {
          avisa(aviso, ctx, `Con ${b} bits solo salen ${r.subredes} subredes: no llega para 6 departamentos.`);
          ctx.deshace(0);
        } else if (r.dirs - 2 < 900) {
          avisa(aviso, ctx, `Con ${b} bits caben ${miles(r.dirs - 2)} equipos en cada subred: no llega a 900. Coge menos bits.`);
          ctx.deshace(0);
        } else {
          avisa(aviso, ctx, 'Vale: hay subredes para todos y caben 900 equipos. Ahora saca los datos de Ventas.', 'ok');
          ctx.cumple(0);
        }
        const vale = ctx.hecho(0);
        campos.forEach(c => { c.disabled = !vale; });
        bComp.disabled = !vale;
      });
      bComp.addEventListener('click', () => {
        if (!r || !ctx.hecho(0)) return;
        const bien = [r.dir(r.dirs), r.dir(r.dirs + 1), r.dir(2 * r.dirs - 1)];
        const pistas = [
          `La 2ª subred empieza un salto después de la 1ª (172.30.0.0): salto ${r.salto} en el ${r.numero} número.`,
          'La puerta de enlace es el primer equipo: la red de Ventas + 1.',
          'El broadcast de Ventas es la red de la 3ª subred − 1.'
        ];
        const mal = [];
        campos.forEach((c, i) => {
          if (limpia(c.value) === bien[i]) ctx.cumple(i + 1, `${['Red', 'Puerta de enlace', 'Broadcast'][i]} de Ventas: ${bien[i]}.`);
          else { ctx.deshace(i + 1); if (c.value) mal.push(pistas[i]); }
        });
        if (mal.length) { avisa(aviso, ctx, mal.join(' ')); ctx.falla('Algún dato de Ventas no está bien.'); }
        else if ([1, 2, 3].every(i => ctx.hecho(i))) avisa(aviso, ctx, '¡Todo bien!', 'ok');
        else avisa(aviso, ctx, 'Rellena los tres datos.', 'cuidado');
      });
    }
  });
})();
