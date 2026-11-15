/* ============================================================
   Carruseles generados de subredes de clase B (UT7, 15/11/2026).
   Va en tema.html después de js/diapos.js.

   subred-b-metodo  "172.16.0.0, 20 subredes" o "150.10.0.0, 300 equipos":
                    clase, la hoja doble (3º y 4º número), bits que cojo,
                    máscara, cuántas, salto y en qué número cae, y la 1ª
                    y la 2ª subred. Mismo método que subred-c-metodo
                    (UT1 S8): todas las subredes se usan, la 1ª empieza
                    en .0.0 y solo se restan 2 a los equipos.
   ============================================================ */

(function () {
  if (typeof registrarDiapos !== 'function' || !window.DIAPOS) return;
  const { tx, caja, svg } = window.DIAPOS;
  const PESOS = [128, 64, 32, 16, 8, 4, 2, 1];
  const ANCHO = 360, ALTO = 160;
  const miles = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const linea = (x1, y1, x2, y2, cls) => `<path d="M ${x1} ${y1} L ${x2} ${y2}" class="${cls}"/>`;

  function calc(v) {
    const { o, n, tipo } = v;
    let bits;
    if (tipo === 'subredes') { bits = 0; while (Math.pow(2, bits) < n) bits++; }
    else { let h = 0; while (Math.pow(2, h) < n + 2) h++; bits = 16 - h; }
    const dirs = Math.pow(2, 16 - bits);
    const enTercero = bits <= 8;
    const suma = enTercero ? PESOS.slice(0, bits) : PESOS.slice(0, bits - 8);
    const s = suma.reduce((a, b) => a + b, 0);
    const dir = off => `${o[0]}.${o[1]}.${Math.floor(off / 256)}.${off % 256}`;
    return {
      o, n, tipo, bits, dirs, enTercero, suma, s, dir,
      red: `${o[0]}.${o[1]}.0.0`,
      mascara: enTercero ? `255.255.${s}.0` : `255.255.255.${s}`,
      prefijo: 16 + bits,
      subredes: Math.pow(2, bits),
      salto: enTercero ? PESOS[bits - 1] : PESOS[bits - 9],
      numero: enTercero ? '3º' : '4º'
    };
  }

  /* La hoja doble: una fila por número (3º y 4º), 8 casillas cada una.
     valor(i) da lo que se escribe en la columna i (0-15). */
  function hoja(r, valor, opc) {
    const X0 = 62, W = 37;
    let s = '';
    [0, 1].forEach(f => {
      const y = 8 + f * 40;
      s += tx(6, y + 16, f === 0 ? '3º nº' : '4º nº', 'd-d d-peq');
      for (let c = 0; c < 8; c++) {
        const i = f * 8 + c;
        const cogido = opc.cogidos && i < r.bits;
        const marcado = (opc.marca || []).includes(i);
        s += caja(X0 + c * W, y, W - 3, 24, marcado ? 'd-caja-act' : (cogido ? 'd-caja-on' : 'd-caja'));
        let cls = cogido ? 'd-a' : 'd-d';
        if (marcado || (opc.suma && cogido && (r.enTercero ? f === 0 : f === 1))) cls = 'd-c';
        s += tx(X0 + c * W + (W - 3) / 2, y + 16, String(valor(i)), cls + ' d-peq', 'middle');
      }
    });
    if (opc.corte) {
      const f = r.bits <= 8 ? 0 : 1, c = r.bits - f * 8;
      const xc = X0 + c * W - 1.5, y = 8 + f * 40;
      s += linea(xc, y - 4, xc, y + 28, 'd-linea-c');
    }
    return s;
  }
  const subredesDe = i => String(Math.pow(2, i + 1));
  const direccDe = i => String(Math.pow(2, 15 - i));
  const pesoDe = i => PESOS[i % 8];

  function diapos(v) {
    const r = calc(v);
    const necesito = r.tipo === 'subredes' ? `${r.n} subredes` : `${miles(r.n)} equipos en cada subred`;
    const abajo = (a, b) => tx(ANCHO / 2, 116, a, 'd-c d-grande', 'middle') + (b ? tx(ANCHO / 2, 144, b, 'd-t', 'middle') : '');
    const L = [];

    L.push({
      svg: svg(ANCHO, ALTO, `${r.red}, necesito ${necesito}`,
        tx(ANCHO / 2, 50, r.red, 'd-t d-grande', 'middle') +
        tx(ANCHO / 2, 86, `necesito ${necesito}`, 'd-c', 'middle') +
        tx(ANCHO / 2, 120, '¿máscara? ¿salto? ¿subredes?', 'd-d', 'middle')),
      texto: `Me dan la red <strong>${r.red}</strong> y necesito <strong>${necesito}</strong>. Los mismos 5 pasos que en la clase C, con una diferencia: ahora hay <strong>dos números</strong> para partir.`
    });

    let oct = '';
    r.o.forEach((x, i) => {
      const xx = 10 + i * 86, host = i >= 2;
      oct += caja(xx, 14, 78, 30, host ? 'd-caja-act' : 'd-caja');
      oct += tx(xx + 39, 34, String(x), host ? 'd-c' : 'd-a', 'middle');
      oct += tx(xx + 39, 62, host ? 'host' : 'red', host ? 'd-c' : 'd-a', 'middle');
    });
    L.push({
      svg: svg(ANCHO, ALTO, `${r.o[0]}: clase B, máscara por defecto 255.255.0.0`,
        oct + tx(ANCHO / 2, 96, `${r.o[0]} → clase B`, 'd-t', 'middle') + tx(ANCHO / 2, 126, '255.255.0.0  (/16)', 'd-a d-grande', 'middle')),
      texto: `Paso 1, la clase: empieza por ${r.o[0]} (de 128 a 191) → <strong>clase B</strong>, máscara 255.255.0.0. Los dos primeros números no se tocan. Se parten el <strong>3º y el 4º</strong>: 16 bits.`
    });

    L.push({
      svg: svg(ANCHO, ALTO, 'La hoja doble: subredes de cada bit en el 3º y en el 4º número',
        hoja(r, subredesDe, {}) + tx(ANCHO / 2, 120, 'subredes: empieza en 2 y va doblando', 'd-d', 'middle') +
        tx(ANCHO / 2, 144, 'del 3º número sigue en el 4º', 'd-d', 'middle')),
      texto: 'Paso 2, la <strong>hoja doble</strong>: la de la clase C, dos veces seguidas. Los bits se cogen desde la izquierda del 3º número y, si no bastan, siguen en el 4º. La fila de subredes va doblando: 2, 4, 8… 256, 512…'
    });

    let porque, valor, marca;
    if (r.tipo === 'subredes') {
      valor = subredesDe; marca = [r.bits - 1];
      porque = `Busco en la fila de subredes el primer número que llega a ${r.n}: es <strong>${miles(r.subredes)}</strong>, en la columna ${r.bits} → <strong>cojo ${r.bits} bits</strong>.`;
    } else {
      valor = direccDe; marca = [r.bits - 1];
      porque = `Cada subred necesita ${miles(r.n)} + 2 = <strong>${miles(r.n + 2)} direcciones</strong>. En la fila de direcciones voy hacia la derecha mientras llegue: me quedo en el <strong>${miles(r.dirs)}</strong>, columna ${r.bits} → <strong>cojo ${r.bits} bits</strong>.`;
    }
    L.push({
      svg: svg(ANCHO, ALTO, `Cojo ${r.bits} bits`,
        hoja(r, valor, { cogidos: true, corte: true, marca }) + abajo(`cojo ${r.bits} bits`, r.tipo === 'subredes' ? 'fila de subredes' : 'fila de direcciones')),
      texto: 'Paso 2. ' + porque
    });

    const suma = r.suma.length > 1 ? `${r.suma.join(' + ')} = ${r.s}` : String(r.s);
    L.push({
      svg: svg(ANCHO, ALTO, `Máscara nueva ${r.mascara}, /${r.prefijo}`,
        hoja(r, pesoDe, { cogidos: true, corte: true, suma: true }) + abajo(r.mascara, `/${r.prefijo}  (16 + ${r.bits})`)),
      texto: r.enTercero
        ? `Paso 3, la <strong>máscara</strong>. Los ${r.bits} bits caben en el 3º número: sumo sus pesos, ${suma}. Queda <strong>${r.mascara}</strong>.`
        : `Paso 3, la <strong>máscara</strong>. Los 8 primeros bits llenan el 3º número: <strong>255</strong>. Los ${r.bits - 8} que sobran van al 4º: ${suma}. Queda <strong>${r.mascara}</strong>.`
    });

    L.push({
      svg: svg(ANCHO, ALTO, `${r.subredes} subredes de ${r.dirs} direcciones`,
        hoja(r, direccDe, { cogidos: true, corte: true, marca: [r.bits - 1] }) +
        abajo(`${miles(r.subredes)} subredes`, `${miles(r.dirs)} direcciones − 2 = ${miles(r.dirs - 2)} equipos`)),
      texto: `Paso 4, cuántas: salen <strong>${miles(r.subredes)} subredes</strong> de ${miles(r.dirs)} direcciones. Equipos en cada una: ${miles(r.dirs)} − 2 = <strong>${miles(r.dirs - 2)}</strong>.`
    });

    const inicios = [0, 1, 2].map(k => r.dir(k * r.dirs));
    L.push({
      svg: svg(ANCHO, ALTO, `Salto ${r.salto} en el ${r.numero} número`,
        hoja(r, pesoDe, { cogidos: true, corte: true, marca: [r.bits - 1] }) +
        abajo(`salto ${r.salto} en el ${r.numero}`, inicios.join('   '))),
      texto: `Paso 5, el <strong>salto</strong>: el peso del último bit cogido, <strong>${r.salto}</strong>. Ese bit está en el <strong>${r.numero} número</strong>, así que es ahí donde las subredes van de ${r.salto} en ${r.salto}.`
    });

    const fin = r.dirs - 1;
    const filas = [['red de la 1ª', r.dir(0), 'd-a'], ['primer equipo', r.dir(1), 'd-t'], ['último equipo', r.dir(fin - 1), 'd-t'], ['broadcast', r.dir(fin), 'd-c'], ['red de la 2ª', r.dir(r.dirs), 'd-a']];
    let t = '';
    filas.forEach(([n, ip, c], i) => { t += tx(20, 30 + i * 26, n, 'd-d') + tx(200, 30 + i * 26, ip, c); });
    L.push({
      svg: svg(ANCHO, ALTO, `1ª subred ${r.dir(0)} a ${r.dir(fin)}; 2ª subred ${r.dir(r.dirs)}`, t),
      texto: `La 1ª y la 2ª subred: la 1ª empieza en ${r.dir(0)}; la 2ª, un salto más allá: <strong>${r.dir(r.dirs)}</strong>. El <strong>broadcast</strong> de la 1ª es la 2ª − 1, y los equipos van del .1 al broadcast − 1.`
    });
    return L;
  }

  registrarDiapos('subred-b-metodo', {
    crear: v => diapos(v),
    leer: s => {
      const m = String(s).trim().replace(/(\d)\.(?=\d{3}\s*(equipos?|hosts?|subred))/i, '$1').match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\s*[,;]?\s*(\d{1,5})\s*(subred(?:es)?|equipos?|hosts?)$/i);
      if (!m) return null;
      const o = m.slice(1, 5).map(Number);
      const n = Number(m[5]);
      if (o[0] < 128 || o[0] > 191 || o[1] > 255 || o[2] !== 0 || o[3] !== 0) return null;
      const tipo = /^subred/i.test(m[6]) ? 'subredes' : 'equipos';
      if (n < 2 || (tipo === 'subredes' ? n > 256 : n > 16382)) return null;
      return { o, n, tipo };
    },
    etiqueta: 'Escribe una red de clase B y lo que necesitas',
    ejemplo: '160.20.0.0, 500 equipos',
    error: 'Escríbelo así: 160.20.0.0, 12 subredes (o 500 equipos). La red, de clase B (empieza por 128 a 191) y acabada en .0.0; de 2 a 256 subredes o de 2 a 16382 equipos.',
    modo: 'text',
    titulo: v => `${v.o.join('.')}, ${v.n} ${v.tipo}, paso a paso`
  });
})();
