/* ============================================================
   Generadores de subredes (15/11/2026). Cargado DESPUÉS de
   js/generadores.js: usa sus ayudas (_ent, _elige, _problemaSubredC,
   _PESOS_OCTETO) y añade entradas a GENERADORES.

   subred-c-primera  clase C → red de la 2ª subred, broadcast de la 1ª,
                     primer o último equipo. Lo pedía la UT1 S8
                     («practica-primera-c») y no existía.
   subred-b-mascara  clase B → bits, máscara, subredes, equipos, salto
                     o en qué número cae el salto (UT7).
   subred-b-primera  clase B → la 1ª y la 2ª subred (UT7).
   puedo-dar-ip      IP + máscara (clase C o B) → sí, es la de red o
                     es el broadcast (UT7).

   Criterio de siempre: todas las subredes se usan, la 1ª empieza en
   .0 y solo se restan 2 a los equipos.
   ============================================================ */

(function () {
  if (typeof GENERADORES === 'undefined' || typeof _problemaSubredC !== 'function') return;
  const PESOS = [128, 64, 32, 16, 8, 4, 2, 1];
  const ent = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const elige = l => l[Math.floor(Math.random() * l.length)];

  /* ---------- clase C: la 1ª subred ---------- */
  function genSubredCPrimera() {
    const p = _problemaSubredC();
    const pre = p.red.split('.').slice(0, 3).join('.');
    const que = elige(['segunda', 'broadcast', 'primero', 'ultimo']);
    const v = {
      segunda: ['la red de la 2ª subred', `${pre}.${p.salto}`],
      broadcast: ['el broadcast de la 1ª subred', `${pre}.${p.salto - 1}`],
      primero: ['el primer equipo de la 1ª subred', `${pre}.1`],
      ultimo: ['el último equipo de la 1ª subred', `${pre}.${p.salto - 2}`]
    }[que];
    const dato = Math.random() < 0.5 ? `con máscara ${p.mascara}` : `(${p.pide})`;
    return {
      enunciado: `${p.red} ${dato} — ¿${v[0]}?`,
      respuesta: v[1],
      formato: 'texto',
      pista: `Máscara ${p.mascara}, salto ${p.salto}. 1ª subred: ${pre}.0 · 2ª: ${pre}.${p.salto} · broadcast de la 1ª: ${pre}.${p.salto - 1} (la 2ª − 1) · equipos de ${pre}.1 a ${pre}.${p.salto - 2}.`
    };
  }

  /* ---------- clase B ---------- */
  /* Una red de clase B y lo que necesito → todos los datos. */
  function calcB(o1, o2, bits) {
    const dirs = Math.pow(2, 16 - bits);
    const enTercero = bits <= 8;
    const suma = enTercero ? PESOS.slice(0, bits) : PESOS.slice(0, bits - 8);
    const s = suma.reduce((a, b) => a + b, 0);
    const mascara = enTercero ? `255.255.${s}.0` : `255.255.255.${s}`;
    const salto = enTercero ? PESOS[bits - 1] : PESOS[bits - 9];
    const dir = off => `${o1}.${o2}.${Math.floor(off / 256)}.${off % 256}`;
    return {
      red: `${o1}.${o2}.0.0`, bits, dirs, equipos: dirs - 2, subredes: Math.pow(2, bits),
      mascara, prefijo: 16 + bits, salto, numero: enTercero ? '3º' : '4º', enTercero, suma, s,
      dir,
      segunda: dir(dirs), bc1: dir(dirs - 1), primero: dir(1), ultimo: dir(dirs - 2)
    };
  }
  function problemaB() {
    const o1 = ent(128, 191), o2 = ent(0, 255);
    const porSubredes = Math.random() < 0.5;
    let bits, pide, porque;
    if (porSubredes) {
      bits = ent(2, 8);
      const n = ent(Math.pow(2, bits - 1) + 1, Math.pow(2, bits));
      pide = `necesito ${n} subredes`;
      porque = `${n} subredes → 2^${bits} = ${Math.pow(2, bits)} llega → cojo ${bits} bits.`;
    } else {
      const h = elige([4, 5, 6, 7, 9, 10, 11, 12]);
      bits = 16 - h;
      const e = ent(Math.pow(2, h - 1) - 1, Math.pow(2, h) - 2);
      pide = `necesito ${e} equipos en cada subred`;
      porque = `${e} + 2 = ${e + 2} direcciones → 2^${h} = ${Math.pow(2, h)} llega → dejo ${h} bits de host y cojo 16 − ${h} = ${bits}.`;
    }
    return Object.assign(calcB(o1, o2, bits), { pide, porque });
  }
  function resumenB(p) {
    const suma = p.suma.length > 1 ? `${p.suma.join(' + ')} = ${p.s}` : String(p.s);
    return `Clase B: se parten el 3º y el 4º número. ${p.porque} ` +
      (p.enTercero
        ? `Los ${p.bits} bits caben en el 3º número: ${suma} → ${p.mascara}`
        : `8 bits llenan el 3º número (255) y ${p.bits - 8} ${p.bits - 8 === 1 ? 'pasa' : 'pasan'} al 4º: ${suma} → ${p.mascara}`) +
      ` (/${p.prefijo}). ${p.subredes} subredes de ${p.dirs} direcciones (${p.equipos} equipos). Salto ${p.salto} en el ${p.numero} número.`;
  }
  function genSubredBMascara() {
    const p = problemaB();
    const que = elige(['bits', 'mascara', 'mascara', 'equipos', 'salto', 'numero']);
    const pr = {
      bits: ['¿cuántos bits cojo?', String(p.bits), 'numero'],
      mascara: ['¿cuál es la máscara nueva?', p.mascara, 'texto'],
      equipos: ['¿cuántos equipos caben en cada subred?', String(p.equipos), 'numero'],
      salto: ['¿de cuánto es el salto?', String(p.salto), 'numero'],
      numero: ['¿en qué número cae el salto: en el 3º o en el 4º?', p.numero, 'texto']
    }[que];
    const out = { enunciado: `${p.red} · ${p.pide} — ${pr[0]}`, respuesta: pr[1], formato: pr[2], pista: resumenB(p) };
    if (que === 'mascara') out.respuestas = [p.mascara, `/${p.prefijo}`];
    if (que === 'numero') out.respuestas = p.enTercero ? ['3', '3º', 'tercero', 'el 3º', 'en el 3º', 'el tercero'] : ['4', '4º', 'cuarto', 'el 4º', 'en el 4º', 'el cuarto'];
    return out;
  }
  function genSubredBPrimera() {
    const p = problemaB();
    const que = elige(['segunda', 'broadcast', 'primero', 'ultimo']);
    const v = {
      segunda: ['la red de la 2ª subred', p.segunda],
      broadcast: ['el broadcast de la 1ª subred', p.bc1],
      primero: ['el primer equipo de la 1ª subred', p.primero],
      ultimo: ['el último equipo de la 1ª subred', p.ultimo]
    }[que];
    const dato = Math.random() < 0.5 ? `con máscara ${p.mascara}` : `(${p.pide})`;
    return {
      enunciado: `${p.red} ${dato} — ¿${v[0]}?`,
      respuesta: v[1],
      formato: 'texto',
      pista: `Máscara ${p.mascara}: salto ${p.salto} en el ${p.numero} número. 1ª: ${p.red} · 2ª: ${p.segunda} · broadcast de la 1ª: ${p.bc1} (la 2ª − 1) · equipos de ${p.primero} a ${p.ultimo}.`
    };
  }

  /* ---------- ¿Puedo dar esta IP a un equipo? ---------- */
  const RESP = {
    si: ['si', 'sí', 'si se puede', 'sí se puede', 'se puede', 'valida', 'válida'],
    red: ['red', 'la de red', 'es la de red', 'no red', 'no, es la de red', 'no es la de red', 'direccion de red', 'dirección de red', 'no, red'],
    broadcast: ['broadcast', 'el broadcast', 'es el broadcast', 'no broadcast', 'no, es el broadcast', 'no es el broadcast', 'difusion', 'difusión', 'no, broadcast']
  };
  function genPuedoDarIp() {
    let red, mascara, dir, dirs, nombre;
    const esC = Math.random() < 0.45;
    if (esC) {
      const p = _problemaSubredC();
      const pre = p.red.split('.').slice(0, 3).join('.');
      red = p.red; mascara = p.mascara; dirs = p.dirs; nombre = `salto ${p.salto} en el 4º número`;
      dir = off => `${pre}.${off}`;
    } else {
      const p = problemaB();
      red = p.red; mascara = p.mascara; dirs = p.dirs; dir = p.dir; nombre = `salto ${p.salto} en el ${p.numero} número`;
    }
    const total = (esC ? 256 : 65536) / dirs;
    const k = ent(1, Math.min(total, 12));
    const ini = (k - 1) * dirs, fin = ini + dirs - 1;
    const tipo = elige(['si', 'si', 'red', 'broadcast']);
    const off = tipo === 'red' ? ini : tipo === 'broadcast' ? fin : ent(ini + 1, fin - 1);
    const ip = dir(off);
    const resp = { si: 'sí', red: 'no, es la de red', broadcast: 'no, es el broadcast' }[tipo];
    return {
      enunciado: `${ip} con máscara ${mascara} — ¿se la puedo dar a un equipo? (sí / red / broadcast)`,
      respuesta: resp,
      respuestas: RESP[tipo],
      formato: 'texto',
      pista: `${nombre}. Está en la ${k}ª subred: red ${dir(ini)}, equipos de ${dir(ini + 1)} a ${dir(fin - 1)}, broadcast ${dir(fin)}.`
    };
  }

  GENERADORES['subred-c-primera'] = genSubredCPrimera;
  GENERADORES['subred-b-mascara'] = genSubredBMascara;
  GENERADORES['subred-b-primera'] = genSubredBPrimera;
  GENERADORES['puedo-dar-ip'] = genPuedoDarIp;
  window.SUBREDES_B = { calcB };
})();
