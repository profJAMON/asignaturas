/* ============================================================
   Diapositivas generadas de Instalaciones, Unidad 1 (redes).
   ============================================================
   Cada generador explica un cálculo paso a paso con el número que se
   le dé. Se usan en el .html de la sesión así:

     <div class="diapos" data-diapos="subred-salto"
          data-valor="192.168.1.100/26" aria-label="…"></div>

   El motor (carrusel, botones, "Prueba con otro número") está en
   js/diapos.js; este archivo solo añade generadores con
   registrarDiapos(). Lista:

     unidades          "2 TB a MB"              escalera bit…TB
     tiempo-descarga   "400 MB a 200 Mbps"      cuánto tarda
     ip-a-binario      "192.168.1.25"           los 4 octetos en binario
     mascara           "/26" o "255.255.255.192" de prefijo a decimal
     clase-ip          "10.250.1.1"              clase, máscara por defecto, red/host
     subred-salto      "192.168.1.100/26"        red, broadcast y rango
     subred-c-metodo   "192.10.10.0, 14 subredes" clase C: bits, máscara, salto y lista
                       (o "200.175.14.0, 45 equipos")
     ipv6-abreviar     "2035:0001:…:0001"        las tres reglas
   ============================================================ */

(function () {
  if (typeof registrarDiapos !== 'function' || !window.DIAPOS) return;
  const { tx, caja, svg, esc, grupos4 } = window.DIAPOS;

  /* ---------- Ayudas ---------- */

  function miles(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  /* Número a la española: 2048 -> 2.048 ; 3,5 con coma. */
  function num(n) {
    if (Number.isInteger(n)) return miles(n);
    const r = Math.round(n * 10000) / 10000;
    if (Number.isInteger(r)) return miles(r);
    const [e, d] = String(r).split('.');
    return miles(e) + ',' + d;
  }
  function leerNumero(s) {
    const t = String(s).trim().replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
    if (!/^\d+(\.\d+)?$/.test(t)) return null;
    return Number(t);
  }
  function linea(x1, y1, x2, y2, cls) {
    return `<path d="M ${x1} ${y1} L ${x2} ${y2}" class="${cls || 'd-linea-d'}"/>`;
  }
  function aBin8(n) {
    return n.toString(2).padStart(8, '0');
  }
  const PESOS = [128, 64, 32, 16, 8, 4, 2, 1];
  function sumaPesos(n) {
    const partes = aBin8(n).split('').map((b, i) => (b === '1' ? PESOS[i] : 0)).filter(Boolean);
    return partes;
  }
  function leerIp(s) {
    const t = String(s).trim();
    const m = t.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!m) return null;
    const o = m.slice(1).map(Number);
    return o.every(x => x <= 255) ? o : null;
  }

  /* ============================================================
     1. Escalera de unidades: "2 TB a MB"
     ============================================================ */
  const ESCALERA = ['bit', 'B', 'KB', 'MB', 'GB', 'TB'];
  /* factor del salto entre ESCALERA[i] y ESCALERA[i+1] */
  const SALTO_UNI = [8, 1024, 1024, 1024, 1024];

  function leerUnidad(u) {
    if (/^bits?$/i.test(u) || u === 'b') return 0;
    if (u === 'B' || /^bytes?$/i.test(u)) return 1;
    const i = ['KB', 'MB', 'GB', 'TB'].indexOf(u.toUpperCase());
    return i < 0 ? -1 : i + 2;
  }
  function calcUnidades(v) {
    const { cant, de, a } = v;
    const pasos = [];
    let valor = cant;
    const sube = a > de;
    for (let i = de; sube ? i < a : i > a; i += sube ? 1 : -1) {
      const f = sube ? SALTO_UNI[i] : SALTO_UNI[i - 1];
      const antes = valor;
      valor = sube ? valor / f : valor * f;
      pasos.push({ desde: i, hasta: sube ? i + 1 : i - 1, f, antes, despues: valor });
    }
    return { pasos, resultado: valor, sube };
  }

  function dibujaEscalera(de, a, activos, salto) {
    /* 6 cajas en fila: bit B KB MB GB TB */
    let s = '';
    const W = 50, G = 10, X0 = 5, Y = 14;
    ESCALERA.forEach((u, i) => {
      const x = X0 + i * (W + G);
      let cls = 'd-caja';
      if (activos.includes(i) || i === a) cls = 'd-caja-on';
      if (i === de) cls = 'd-caja-act';
      s += caja(x, Y, W, 30, cls);
      const clsT = i === de ? 'd-c' : (i === a ? 'd-a' : (activos.includes(i) ? 'd-t' : 'd-d'));
      s += tx(x + W / 2, Y + 20, u, clsT, 'middle');
      if (i < 5) {
        const esSalto = salto && Math.min(salto.desde, salto.hasta) === i;
        s += tx(x + W + G / 2, Y + 50, i === 0 ? '8' : '1024', esSalto ? 'd-c' : 'd-d', 'middle');
      }
    });
    s += tx(X0, Y + 70, 'pequeña', 'd-d');
    s += tx(X0 + 6 * (W + G) - G, Y + 70, 'grande', 'd-d', 'end');
    return s;
  }

  function diaposUnidades(v) {
    const { cant, de, a } = v;
    const { pasos, resultado, sube } = calcUnidades(v);
    const ALTO = 150, ANCHO = 360;
    const U = ESCALERA;
    const lista = [];
    const enRuta = [];
    const lo = Math.min(de, a), hi = Math.max(de, a);
    for (let i = lo; i <= hi; i++) enRuta.push(i);

    lista.push({
      svg: svg(ANCHO, ALTO, `Escalera de unidades, de ${U[de]} a ${U[a]}`,
        dibujaEscalera(de, a, [], null) + tx(ANCHO / 2, 128, `${num(cant)} ${U[de]} → ¿? ${U[a]}`, 'd-t d-grande', 'middle')),
      texto: `Vamos a pasar <strong>${num(cant)} ${U[de]}</strong> a <strong>${U[a]}</strong>. Primero escribe la escalera y marca las dos unidades: de dónde sales y a dónde vas.`
    });
    const n = pasos.length;
    lista.push({
      svg: svg(ANCHO, ALTO, `Hay ${n} saltos`,
        dibujaEscalera(de, a, enRuta, null) + tx(ANCHO / 2, 128, `${n} ${n === 1 ? 'salto' : 'saltos'} ${sube ? 'hacia la derecha' : 'hacia la izquierda'}`, 'd-t d-grande', 'middle')),
      texto: `Cuenta los saltos: de ${U[de]} a ${U[a]} hay <strong>${n}</strong>. ` + (sube
        ? 'Vas hacia una unidad <strong>más grande</strong>: en cada salto se <strong>divide</strong>.'
        : 'Vas hacia una unidad <strong>más pequeña</strong>: en cada salto se <strong>multiplica</strong>.')
    });
    pasos.forEach((p, k) => {
      const op = sube ? '÷' : '×';
      const cuenta = `${num(p.antes)} ${op} ${num(p.f)} = ${num(p.despues)}`;
      lista.push({
        svg: svg(ANCHO, ALTO, `${U[p.desde]} a ${U[p.hasta]}: ${cuenta}`,
          dibujaEscalera(p.hasta, a, enRuta, p) + tx(ANCHO / 2, 128, cuenta, 'd-t d-grande', 'middle')),
        texto: `Salto ${k + 1}, de ${U[p.desde]} a ${U[p.hasta]}: ${sube ? 'divides' : 'multiplicas'} ${p.f === 8 ? '<strong>por 8</strong> (es el salto entre bit y byte)' : 'por <strong>1024</strong>'}. ${num(p.antes)} ${U[p.desde]} ${op} ${num(p.f)} = <strong>${num(p.despues)} ${U[p.hasta]}</strong>.`
      });
    });
    lista.push({
      svg: svg(ANCHO, ALTO, `${num(cant)} ${U[de]} son ${num(resultado)} ${U[a]}`,
        dibujaEscalera(a, a, enRuta, null) + tx(ANCHO / 2, 128, `${num(cant)} ${U[de]} = ${num(resultado)} ${U[a]}`, 'd-a d-grande', 'middle')),
      texto: `Resultado: <strong>${num(cant)} ${U[de]} = ${num(resultado)} ${U[a]}</strong>. Comprueba que tiene sentido: ${sube ? 'en una unidad más grande sale un número <strong>más pequeño</strong>.' : 'en una unidad más pequeña sale un número <strong>más grande</strong>.'}`
    });
    return lista;
  }

  registrarDiapos('unidades', {
    crear: v => diaposUnidades(v),
    leer: s => {
      const m = String(s).trim().match(/^([\d.,]+)\s*([A-Za-z]+)\s*(?:a|en|→|->)\s*([A-Za-z]+)$/);
      if (!m) return null;
      const cant = leerNumero(m[1]);
      const de = leerUnidad(m[2]);
      const a = leerUnidad(m[3]);
      if (cant === null || cant <= 0 || cant > 1e6 || de < 0 || a < 0 || de === a) return null;
      const r = calcUnidades({ cant, de, a }).resultado;
      if (r < 0.001) return null;
      return { cant, de, a };
    },
    etiqueta: 'Escribe la cantidad, la unidad, «a» y la unidad a la que pasas',
    ejemplo: '3 GB a MB',
    error: 'Escríbelo así: 3 GB a MB (unidades: bit, B, KB, MB, GB, TB). Si sale un número demasiado pequeño, prueba con uno mayor.',
    titulo: v => `${num(v.cant)} ${ESCALERA[v.de]} a ${ESCALERA[v.a]}, paso a paso`
  });

  /* ============================================================
     2. Tiempo de descarga: "400 MB a 200 Mbps"
     ============================================================ */
  function diaposDescarga(v) {
    const { tam, uni, vel } = v;
    const ANCHO = 360, ALTO = 150;
    const mb = uni === 'GB' ? tam * 1024 : tam;
    const mbits = mb * 8;
    const exacto = mbits / vel;
    /* Segundos con un decimal como mucho: 27,3067 s no le dice nada a nadie. */
    const seg = Math.round(exacto * 10) / 10;
    const aprox = seg === exacto ? '=' : '≈';

    function tarjetas(resaltaB, resaltab) {
      return caja(10, 12, 160, 54, resaltaB ? 'd-caja-act' : 'd-caja-on') +
        tx(90, 34, 'archivo', 'd-d', 'middle') +
        tx(90, 56, `${num(tam)} ${uni}`, (resaltaB ? 'd-c' : 'd-t') + ' d-grande', 'middle') +
        caja(190, 12, 160, 54, resaltab ? 'd-caja-act' : 'd-caja-on') +
        tx(270, 34, 'línea', 'd-d', 'middle') +
        tx(270, 56, `${num(vel)} Mbps`, (resaltab ? 'd-c' : 'd-t') + ' d-grande', 'middle');
    }
    const lista = [];
    lista.push({
      svg: svg(ANCHO, ALTO, `Archivo de ${num(tam)} ${uni} por una línea de ${num(vel)} Mbps`,
        tarjetas(false, false) + tx(180, 112, '¿cuánto tarda?', 'd-t d-grande', 'middle')),
      texto: `Un archivo de <strong>${num(tam)} ${uni}</strong> por una línea de <strong>${num(vel)} Mbps</strong>. ¿Cuánto tarda como mínimo?`
    });
    lista.push({
      svg: svg(ANCHO, ALTO, 'Mira las letras: B mayúscula son bytes, b minúscula son bits',
        tarjetas(true, true) + tx(90, 100, 'B = bytes', 'd-c', 'middle') + tx(270, 100, 'b = bits', 'd-c', 'middle') +
        tx(180, 132, 'no se puede dividir aún', 'd-d', 'middle')),
      texto: `Mira las letras antes de nada. El archivo está en ${uni} (<strong>B</strong> mayúscula, <strong>bytes</strong>) y la línea en Mbps (<strong>b</strong> minúscula, <strong>bits</strong>). Son familias distintas: todavía no se puede dividir.`
    });
    if (uni === 'GB') {
      lista.push({
        svg: svg(ANCHO, ALTO, `${num(tam)} GB son ${num(mb)} MB`,
          tarjetas(true, false) + tx(180, 112, `${num(tam)} GB × 1024 = ${num(mb)} MB`, 'd-t d-grande', 'middle')),
        texto: `La línea va en <strong>mega</strong>bits, así que el archivo lo quiero en <strong>mega</strong>s. De GB a MB es un salto: × 1024 = <strong>${num(mb)} MB</strong>.`
      });
    }
    lista.push({
      svg: svg(ANCHO, ALTO, `${num(mb)} MB son ${num(mbits)} megabits`,
        tarjetas(true, false) + tx(180, 112, `${num(mb)} MB × 8 = ${num(mbits)} Mb`, 'd-t d-grande', 'middle')),
      texto: `Paso 1: el archivo a <strong>megabits</strong>. Cada byte son 8 bits: ${num(mb)} × 8 = <strong>${num(mbits)} Mb</strong>. Ahora los dos datos están en bits.`
    });
    lista.push({
      svg: svg(ANCHO, ALTO, `${num(mbits)} entre ${num(vel)} son ${num(seg)} segundos`,
        tarjetas(false, true) + tx(180, 112, `${num(mbits)} ÷ ${num(vel)} ${aprox} ${num(seg)} s`, 'd-t d-grande', 'middle')),
      texto: `Paso 2: divide entre la velocidad. La línea pasa ${num(vel)} megabits cada segundo: ${num(mbits)} ÷ ${num(vel)} ${aprox} <strong>${num(seg)} segundos</strong>${aprox === '≈' ? ' (redondeando a un decimal)' : ''}.`
    });
    let extra = '';
    let textoMin = '';
    if (seg >= 60) {
      const min = Math.floor(seg / 60);
      const resto = Math.round((seg - min * 60) * 10) / 10;
      extra = tx(180, 132, `= ${min} min ${num(resto)} s`, 'd-d', 'middle');
      textoMin = ` Como pasa de 60, en minutos: ${num(seg)} ÷ 60 → <strong>${min} min y ${num(resto)} s</strong>.`;
    }
    lista.push({
      svg: svg(ANCHO, ALTO, `Tarda como mínimo ${num(seg)} segundos`,
        tarjetas(false, false) + tx(180, 108, `mínimo ${num(seg)} s`, 'd-a d-grande', 'middle') + extra),
      texto: `Tarda como mínimo <strong>${num(seg)} s</strong>.${textoMin} Es el <strong>mínimo teórico</strong>: en la vida real nunca se aprovecha el 100 % de la línea y tarda algo más.`
    });
    return lista;
  }

  registrarDiapos('tiempo-descarga', {
    crear: v => diaposDescarga(v),
    leer: s => {
      const m = String(s).trim().match(/^([\d.,]+)\s*(MB|GB)\s*(?:a|por|con|,)?\s*([\d.,]+)\s*Mbps$/i);
      if (!m) return null;
      const tam = leerNumero(m[1]);
      const vel = leerNumero(m[3]);
      if (!tam || !vel || tam > 1e6 || vel > 1e5) return null;
      return { tam, uni: m[2].toUpperCase(), vel };
    },
    etiqueta: 'Escribe el tamaño del archivo y la velocidad de la línea',
    ejemplo: '700 MB a 100 Mbps',
    error: 'Escríbelo así: 700 MB a 100 Mbps (el archivo en MB o GB, la línea en Mbps).',
    titulo: v => `Archivo de ${num(v.tam)} ${v.uni} por ${num(v.vel)} Mbps, paso a paso`
  });

  /* ============================================================
     3. IP a binario: "192.168.1.25"
     ============================================================ */
  function columnasIp(o, opc) {
    /* 4 columnas de 85: decimal arriba, binario debajo */
    let s = '';
    o.forEach((n, i) => {
      const x = 10 + i * 86;
      const act = opc.actual === i;
      const hecho = opc.hechos.includes(i);
      s += caja(x, 10, 78, 30, act ? 'd-caja-act' : (hecho ? 'd-caja-on' : 'd-caja'));
      s += tx(x + 39, 31, String(n), (act ? 'd-c' : 'd-t') + ' d-grande', 'middle');
      if (i < 3) s += tx(x + 82, 34, '.', 'd-d', 'middle');
      if (hecho || act) s += tx(x + 39, 62, grupos4(aBin8(n)), act ? 'd-c' : 'd-a', 'middle');
      if (opc.etiquetas) s += tx(x + 39, 82, '8 bits', 'd-d', 'middle');
    });
    return s;
  }
  function diaposIpBinario(o) {
    const ANCHO = 360, ALTO = 130;
    const ip = o.join('.');
    const lista = [];
    lista.push({
      svg: svg(ANCHO, ALTO, `La IP ${ip}, cuatro octetos`, columnasIp(o, { hechos: [], etiquetas: true })),
      texto: `La IP <strong>${ip}</strong> son <strong>4 octetos</strong> separados por puntos. Cada uno se pasa a binario por separado, con <strong>8 bits</strong>, usando la fila 128 64 32 16 8 4 2 1.`
    });
    o.forEach((n, i) => {
      const partes = sumaPesos(n);
      const suma = partes.length ? partes.join(' + ') : 'ningún 1';
      const hechos = [];
      for (let k = 0; k < i; k++) hechos.push(k);
      lista.push({
        svg: svg(ANCHO, ALTO, `${n} en binario es ${grupos4(aBin8(n))}`,
          columnasIp(o, { actual: i, hechos }) + tx(ANCHO / 2, 104, n === 0 ? '0 = 0000 0000' : `${suma} = ${n}`, 'd-t', 'middle')),
        texto: n === 0
          ? `Octeto ${i + 1}: el <strong>0</strong> no necesita ningún 1: <strong>0000 0000</strong>.`
          : n === 255
            ? `Octeto ${i + 1}: <strong>255</strong> es el más grande, todos a 1: <strong>1111 1111</strong>.`
            : `Octeto ${i + 1}: <strong>${n}</strong> = ${suma}. Pon un 1 debajo de esos valores y 0 en el resto: <strong>${grupos4(aBin8(n))}</strong>.`
      });
    });
    lista.push({
      svg: svg(ANCHO, ALTO, `${ip} en binario, 32 bits`,
        columnasIp(o, { hechos: [0, 1, 2, 3] }) + tx(ANCHO / 2, 104, '4 × 8 = 32 bits', 'd-a d-grande', 'middle')),
      texto: `Ya está: <strong>${ip}</strong> en binario son 4 octetos de 8 bits, <strong>32 bits</strong> en total.`
    });
    return lista;
  }
  registrarDiapos('ip-a-binario', {
    crear: o => diaposIpBinario(o),
    leer: leerIp,
    etiqueta: 'Escribe una dirección IP',
    ejemplo: '10.0.5.200',
    error: 'Cuatro números del 0 al 255 separados por puntos, por ejemplo 10.0.5.200.',
    titulo: o => `${o.join('.')} en binario, paso a paso`
  });

  /* ============================================================
     4. Máscara: "/26" o "255.255.255.192"
     ============================================================ */
  function mascaraOctetos(p) {
    const bits = '1'.repeat(p) + '0'.repeat(32 - p);
    return [0, 1, 2, 3].map(i => bits.slice(i * 8, i * 8 + 8));
  }
  function filaMascara(p, opc) {
    const oct = mascaraOctetos(p);
    let s = '';
    oct.forEach((b, i) => {
      const x = 10 + i * 86;
      const act = opc.actual === i;
      s += caja(x, 10, 78, 30, act ? 'd-caja-act' : 'd-caja');
      /* los unos en acento, los ceros apagados */
      let html = '';
      grupos4(b).split('').forEach(c => {
        const cls = c === '1' ? (act ? 'd-c' : 'd-a') : 'd-d';
        html += c === ' ' ? ' ' : `<tspan class="${cls}">${c}</tspan>`;
      });
      s += `<text x="${x + 39}" y="30" text-anchor="middle" xml:space="preserve">${html}</text>`;
      if (opc.decimales && opc.decimales.includes(i)) {
        s += tx(x + 39, 64, String(parseInt(b, 2)), (act ? 'd-c' : 'd-t') + ' d-grande', 'middle');
      }
    });
    if (opc.partes) {
      /* llave de red y de host */
      /* Dónde acaba el último 1: cada cifra mide ~7,8 (0,6 em de 13 px)
         y el grupo de 9 caracteres ("1111 1111") va centrado en su caja. */
      const i = Math.floor(p / 8), k = p % 8;
      const xCorte = k === 0
        ? 10 + i * 86 - 4
        : 10 + i * 86 + 39 - 4.5 * 7.8 + (k + (k >= 4 ? 1 : 0)) * 7.8 - (k === 4 ? 3.9 : 0);
      s += linea(10, 50, Math.max(10, xCorte - 3), 50, 'd-linea-a');
      if (p > 0) s += tx((10 + xCorte) / 2, 66, 'red', 'd-a', 'middle');
      if (p < 32) {
        s += linea(xCorte + 3, 50, 352, 50, 'd-linea-c');
        s += tx((xCorte + 352) / 2, 66, 'host', 'd-c', 'middle');
      }
    }
    return s;
  }
  function diaposMascara(p) {
    const ANCHO = 362, ALTO = 128;
    const oct = mascaraOctetos(p);
    const dec = oct.map(b => parseInt(b, 2));
    const lista = [];
    const llenos = Math.floor(p / 8);
    lista.push({
      svg: svg(ANCHO, ALTO, `/${p}: ${p} unos y ${32 - p} ceros`,
        tx(ANCHO / 2, 56, `/${p}`, 'd-t d-enorme', 'middle') + tx(ANCHO / 2, 92, `${p} unos + ${32 - p} ceros = 32 bits`, 'd-d', 'middle')),
      texto: `<strong>/${p}</strong> quiere decir: los <strong>${p}</strong> primeros bits a <strong>1</strong> y los otros <strong>${32 - p}</strong> a <strong>0</strong>. Siempre 32 bits en total.`
    });
    const cuenta = [];
    let quedan = p;
    for (let i = 0; i < 4; i++) { const c = Math.min(8, Math.max(0, quedan)); cuenta.push(c); quedan -= c; }
    lista.push({
      svg: svg(ANCHO, ALTO, 'Los 32 bits de la máscara, en 4 octetos', filaMascara(p, { partes: true })),
      texto: `Escribe los 32 bits en 4 octetos de 8: ${cuenta.filter(c => c > 0).join(' + ')} = ${p} unos, y ceros hasta el final. Los <strong>unos</strong> marcan la parte de <strong>red</strong>; los <strong>ceros</strong>, la del <strong>host</strong> (el equipo).`
    });
    const hechos = [];
    if (llenos > 0) {
      for (let i = 0; i < llenos; i++) hechos.push(i);
      lista.push({
        svg: svg(ANCHO, ALTO, 'Un octeto todo a unos vale 255', filaMascara(p, { decimales: hechos.slice() })),
        texto: `Ahora cada octeto a decimal. ${llenos === 1 ? 'El primero está' : `Los ${llenos} primeros están`} entero${llenos === 1 ? '' : 's'} a unos: 1111 1111 = <strong>255</strong>.`
      });
    }
    if (p % 8) {
      const i = llenos;
      const partes = sumaPesos(dec[i]);
      hechos.push(i);
      lista.push({
        svg: svg(ANCHO, ALTO, `${oct[i]} vale ${dec[i]}`,
          filaMascara(p, { actual: i, decimales: hechos.slice() }) + tx(ANCHO / 2, 104, `${partes.join(' + ')} = ${dec[i]}`, 'd-t', 'middle')),
        texto: `El octeto ${i + 1} está a medias: ${grupos4(oct[i])}. Suma los valores de sus unos: ${partes.join(' + ')} = <strong>${dec[i]}</strong>.`
      });
    }
    const ceros = [];
    for (let i = Math.ceil(p / 8); i < 4; i++) ceros.push(i);
    if (ceros.length) {
      ceros.forEach(i => hechos.push(i));
      lista.push({
        svg: svg(ANCHO, ALTO, 'Un octeto todo a ceros vale 0', filaMascara(p, { decimales: hechos.slice() })),
        texto: `${ceros.length === 1 ? 'El que queda está' : 'Los que quedan están'} todo a ceros: 0000 0000 = <strong>0</strong>.`
      });
    }
    lista.push({
      svg: svg(ANCHO, ALTO, `/${p} es ${dec.join('.')}`,
        filaMascara(p, { decimales: [0, 1, 2, 3] }) + tx(ANCHO / 2, 106, `/${p} = ${dec.join('.')}`, 'd-a d-grande', 'middle')),
      texto: `<strong>/${p} = ${dec.join('.')}</strong>. Es la misma máscara escrita de dos formas.`
    });
    return lista;
  }
  registrarDiapos('mascara', {
    crear: p => diaposMascara(p),
    leer: s => {
      const t = String(s).trim().replace(/^\//, '');
      if (/^\d{1,2}$/.test(t)) {
        const p = Number(t);
        return p >= 1 && p <= 32 ? p : null;
      }
      const o = leerIp(t);
      if (!o) return null;
      const bits = o.map(aBin8).join('');
      if (!/^1+0*$/.test(bits)) return null;
      return bits.indexOf('0') < 0 ? 32 : bits.indexOf('0');
    },
    etiqueta: 'Escribe una máscara en CIDR (/26) o en decimal (255.255.255.192)',
    ejemplo: '/20',
    error: 'Escribe /N (de 1 a 32) o una máscara válida en decimal, con los unos todos seguidos.',
    titulo: p => `La máscara /${p}, paso a paso`
  });

  /* ============================================================
     5. Clase de una IP: clase, máscara por defecto, red y host
     ============================================================ */
  const CLASES = [
    { c: 'A', de: 0, a: 127, oct: 1, mask: '255.0.0.0', p: 8 },
    { c: 'B', de: 128, a: 191, oct: 2, mask: '255.255.0.0', p: 16 },
    { c: 'C', de: 192, a: 223, oct: 3, mask: '255.255.255.0', p: 24 },
    { c: 'D', de: 224, a: 239 },
    { c: 'E', de: 240, a: 255 }
  ];
  function regla(o1) {
    /* Regla de 0 a 255 con los tramos de las clases */
    const X0 = 14, W = 332;
    const x = v => X0 + (v / 256) * W;
    let s = '';
    CLASES.forEach(k => {
      const dentro = o1 >= k.de && o1 <= k.a;
      s += `<rect x="${x(k.de)}" y="54" width="${x(k.a + 1) - x(k.de) - 1}" height="22" rx="2" class="${dentro ? 'd-caja-act' : 'd-caja'}"/>`;
      s += tx((x(k.de) + x(k.a + 1)) / 2, 70, k.c, dentro ? 'd-c' : 'd-d', 'middle');
    });
    [0, 128, 192, 224, 256].forEach(v => {
      s += tx(x(v), 92, v === 256 ? '255' : String(v), 'd-d', 'middle');
    });
    const xm = x(o1 + 0.5);
    s += `<path d="M ${xm} 50 L ${xm - 5} 42 L ${xm + 5} 42 z" class="d-relleno-c"/>`;
    s += tx(xm, 36, String(o1), 'd-c', 'middle');
    return s;
  }
  function octetosIp(o, opc) {
    let s = '';
    o.forEach((n, i) => {
      const x = 10 + i * 86;
      let cls = 'd-caja', clsT = 'd-t';
      if (opc.primero && i === 0) { cls = 'd-caja-act'; clsT = 'd-c'; }
      if (opc.red !== undefined) {
        if (i < opc.red) { cls = 'd-caja-on'; clsT = 'd-a'; } else { cls = 'd-caja-act'; clsT = 'd-c'; }
      }
      if (opc.apagar && i > 0) clsT = 'd-d';
      s += caja(x, opc.y || 10, 78, 30, cls);
      s += tx(x + 39, (opc.y || 10) + 21, String(n), clsT + ' d-grande', 'middle');
    });
    return s;
  }
  /* conMascara = false: solo clase → red y host (para cuando aún no se ha visto la máscara) */
  function diaposClaseIp(o, conMascara = true) {
    const ANCHO = 362, ALTO = 128;
    const ip = o.join('.');
    const k = CLASES.find(c => o[0] >= c.de && o[0] <= c.a);
    const lista = [];
    lista.push({
      svg: svg(ANCHO, ALTO, `${ip}: se mira solo el primer número`, octetosIp(o, { primero: true, apagar: true, y: 30 })),
      texto: `<strong>${ip}</strong>. Para saber la clase, <strong>solo se mira el primer número</strong>: el <strong>${o[0]}</strong>. Los otros tres no importan.`
    });
    lista.push({
      svg: svg(ANCHO, ALTO, `${o[0]} está en la clase ${k.c}`, regla(o[0])),
      texto: `¿Entre qué números cae el ${o[0]}? Entre ${k.de} y ${k.a}: <strong>clase ${k.c}</strong>.`
    });
    if (k.oct) {
      const mo = k.mask.split('.').map(Number);
      if (conMascara) lista.push({
        svg: svg(ANCHO, ALTO, `Clase ${k.c}: máscara por defecto ${k.mask}`,
          octetosIp(o, { y: 10 }) + octetosIp(mo, { y: 56 }) + tx(ANCHO / 2, 112, `${k.mask} = /${k.p}`, 'd-a', 'middle')),
        texto: `Clase ${k.c} → máscara por defecto <strong>${k.mask}</strong>, que en CIDR es <strong>/${k.p}</strong>.`
      });
      const red = o.slice(0, k.oct).join('.');
      const host = o.slice(k.oct).join('.');
      let partes = octetosIp(o, { red: k.oct, y: 20 });
      const xc = 10 + k.oct * 86 - 4;
      partes += linea(10, 64, xc - 4, 64, 'd-linea-a') + tx((10 + xc) / 2, 82, 'red', 'd-a', 'middle');
      partes += linea(xc + 4, 64, 352, 64, 'd-linea-c') + tx((xc + 352) / 2, 82, 'host', 'd-c', 'middle');
      lista.push({
        svg: svg(ANCHO, ALTO, `Parte de red ${red}, parte de host ${host}`, partes),
        texto: conMascara
          ? `En la máscara, cada 255 es un octeto de <strong>red</strong> y cada 0, de <strong>host</strong>. Así que la red es <strong>${red}</strong> y el equipo es <strong>${host}</strong>.`
          : `En la clase ${k.c}, ${k.oct === 1 ? 'el primer octeto es' : `los ${k.oct} primeros octetos son`} de <strong>red</strong> y el resto, de <strong>host</strong>. Así que la red es <strong>${red}</strong> y el equipo es <strong>${host}</strong>.`
      });
    } else {
      lista.push({
        svg: svg(ANCHO, ALTO, `Clase ${k.c}: no se reparte en red y host`, regla(o[0])),
        texto: (k.c === 'D'
          ? 'La clase D es para <strong>multicast</strong> (enviar a un grupo).'
          : 'La clase E está <strong>reservada</strong> (experimental).')
          + (conMascara ? ' No tiene máscara por defecto ni se reparte en red y host.' : ' No se reparte en red y host.')
      });
    }
    return lista;
  }
  registrarDiapos('clase-ip', {
    crear: o => diaposClaseIp(o),
    leer: leerIp,
    etiqueta: 'Escribe una dirección IP',
    ejemplo: '172.20.3.4',
    error: 'Cuatro números del 0 al 255 separados por puntos, por ejemplo 172.20.3.4.',
    titulo: o => `La IP ${o.join('.')}, paso a paso`
  });
  registrarDiapos('clase-red-host', {
    crear: o => diaposClaseIp(o, false),
    leer: leerIp,
    etiqueta: 'Escribe una dirección IP',
    ejemplo: '172.20.3.4',
    error: 'Cuatro números del 0 al 255 separados por puntos, por ejemplo 172.20.3.4.',
    titulo: o => `La IP ${o.join('.')}: clase, red y host`
  });

  /* ============================================================
     6. Subred por el método del salto: "192.168.1.100/26"
     ============================================================ */
  function rectaBloques(r, opc) {
    const X0 = 14, W = 332;
    const x = v => X0 + (v / 256) * W;
    let s = '';
    const n = 256 / r.salto;
    for (let b = 0; b < n; b++) {
      const ini = b * r.salto;
      const suyo = ini === r.base;
      s += `<rect x="${x(ini)}" y="40" width="${Math.max(1, x(ini + r.salto) - x(ini) - 1)}" height="20" class="${suyo && opc.marcar ? 'd-caja-act' : 'd-caja'}"/>`;
    }
    /* etiquetas: si hay pocos bloques, todas; si hay muchos, solo el suyo */
    const etiquetas = n <= 8 ? Array.from({ length: n + 1 }, (_, b) => b * r.salto) : [0, r.base, r.base + r.salto, 256];
    const usados = [];
    etiquetas.forEach(v => {
      const xv = x(v);
      if (usados.some(u => Math.abs(u - xv) < 22)) return;
      usados.push(xv);
      const esSuyo = opc.marcar && (v === r.base || v === r.base + r.salto);
      s += tx(xv, 76, String(v), esSuyo ? 'd-c' : 'd-d', 'middle');
    });
    if (opc.punto) {
      const xm = x(r.h + 0.5);
      s += `<path d="M ${xm} 36 L ${xm - 5} 28 L ${xm + 5} 28 z" class="d-relleno-c"/>`;
      s += tx(xm, 22, String(r.h), 'd-c', 'middle');
    }
    return s;
  }
  function calcSubred(v) {
    const { o, p } = v;
    const bitsHost = 32 - p;
    const salto = Math.pow(2, bitsHost);
    const h = o[3];
    const base = Math.floor(h / salto) * salto;
    return { o, p, bitsHost, salto, h, base, bc: base + salto - 1, pre: o.slice(0, 3).join('.') };
  }
  function diaposSubred(v) {
    const r = calcSubred(v);
    const ANCHO = 360, ALTO = 140;
    const ip = r.o.join('.');
    const lista = [];
    const cabecera = tx(ANCHO / 2, 30, `${ip}/${r.p}`, 'd-t d-grande', 'middle');
    lista.push({
      svg: svg(ANCHO, ALTO, `${ip}/${r.p}: ¿a qué red pertenece?`,
        cabecera + tx(ANCHO / 2, 80, '¿red? ¿broadcast? ¿cuántos caben?', 'd-d', 'middle')),
      texto: `Tenemos la IP <strong>${ip}</strong> con máscara <strong>/${r.p}</strong>. Vamos a sacar su red, su broadcast y cuántos equipos caben. Con /24 o más, solo cambia el <strong>último número</strong>: los otros tres (${r.pre}) se copian tal cual.`
    });
    lista.push({
      svg: svg(ANCHO, ALTO, `Bits de host: 32 menos ${r.p} = ${r.bitsHost}`,
        cabecera + tx(ANCHO / 2, 84, `32 − ${r.p} = ${r.bitsHost} bits de host`, 'd-a d-grande', 'middle')),
      texto: `Paso 1, los <strong>bits de host</strong>: una IP tiene 32 bits y ${r.p} son de red. Quedan 32 − ${r.p} = <strong>${r.bitsHost}</strong>.`
    });
    lista.push({
      svg: svg(ANCHO, ALTO, `Salto: 2 elevado a ${r.bitsHost} = ${r.salto}`,
        cabecera + tx(ANCHO / 2, 84, `salto = 2^${r.bitsHost} = ${r.salto}`, 'd-a d-grande', 'middle')),
      texto: `Paso 2, el <strong>salto</strong>: 2 elevado a ${r.bitsHost} = <strong>${r.salto}</strong>. Es el tamaño de cada bloque${r.salto === 256 ? ': con /24 hay un solo bloque, del 0 al 255.' : '.'}`
    });
    const n = 256 / r.salto;
    const lista0 = n <= 8 ? Array.from({ length: n }, (_, b) => b * r.salto).join(', ') : `0, ${r.salto}, ${2 * r.salto}… hasta 256`;
    lista.push({
      svg: svg(ANCHO, ALTO, `Los bloques van de ${r.salto} en ${r.salto}; el ${r.h} cae en el que empieza en ${r.base}`,
        rectaBloques(r, { marcar: true, punto: true }) + tx(ANCHO / 2, 112, `${r.h} está entre ${r.base} y ${r.base + r.salto}`, 'd-t', 'middle')),
      texto: `Paso 3, los bloques empiezan en múltiplos del salto: ${lista0}. ¿Dónde cae el <strong>${r.h}</strong>? Entre ${r.base} y ${r.base + r.salto}: su bloque empieza en <strong>${r.base}</strong>.`
    });
    function ficha(hasta) {
      const filas = [
        ['red', `${r.pre}.${r.base}`],
        ['primera', `${r.pre}.${r.base + 1}`],
        ['última', `${r.pre}.${r.bc - 1}`],
        ['broadcast', `${r.pre}.${r.bc}`],
        ['caben', `${r.salto - 2} equipos`]
      ];
      let s = '';
      filas.forEach((f, i) => {
        if (!hasta.includes(i)) return;
        const y = 22 + i * 24;
        const nuevo = hasta[hasta.length - 1] === i && hasta.length < 5;
        s += tx(40, y, f[0], 'd-d');
        s += tx(150, y, f[1], nuevo ? 'd-c d-grande' : 'd-a d-grande');
      });
      return s;
    }
    lista.push({
      svg: svg(ANCHO, ALTO, `Dirección de red ${r.pre}.${r.base}`, ficha([0])),
      texto: `Paso 4, la <strong>dirección de red</strong> es el principio del bloque: <strong>${r.pre}.${r.base}</strong>. No se le da a ningún equipo.`
    });
    lista.push({
      svg: svg(ANCHO, ALTO, `Broadcast ${r.pre}.${r.bc}`, ficha([0, 3])),
      texto: `Paso 5, el <strong>broadcast</strong> es la anterior al bloque siguiente: ${r.base + r.salto} − 1 = <strong>${r.bc}</strong>. Tampoco se le da a ningún equipo.`
    });
    lista.push({
      svg: svg(ANCHO, ALTO, `Utilizables de ${r.pre}.${r.base + 1} a ${r.pre}.${r.bc - 1}`, ficha([0, 1, 2, 3])),
      texto: `Paso 6, las <strong>utilizables</strong> son las de en medio: de <strong>.${r.base + 1}</strong> (la siguiente a la de red) a <strong>.${r.bc - 1}</strong> (la anterior al broadcast).`
    });
    let aviso = '';
    if (r.h === r.base) aviso = ` ¡Ojo! ${ip} es justo la dirección de red: no se le puede poner a un equipo.`;
    if (r.h === r.bc) aviso = ` ¡Ojo! ${ip} es justo el broadcast: no se le puede poner a un equipo.`;
    lista.push({
      svg: svg(ANCHO, ALTO, `Caben ${r.salto - 2} equipos`, ficha([0, 1, 2, 3, 4])),
      texto: `Paso 7, cuántos caben: 2^${r.bitsHost} − 2 = ${r.salto} − 2 = <strong>${r.salto - 2} equipos</strong> (se restan la de red y la de broadcast).${aviso}`
    });
    return lista;
  }
  registrarDiapos('subred-salto', {
    crear: v => diaposSubred(v),
    leer: s => {
      const m = String(s).trim().match(/^(\d{1,3}(?:\.\d{1,3}){3})\s*\/\s*(\d{1,2})$/);
      if (!m) return null;
      const o = leerIp(m[1]);
      const p = Number(m[2]);
      if (!o || p < 24 || p > 30) return null;
      return { o, p };
    },
    etiqueta: 'Escribe una IP con su máscara, de /24 a /30',
    ejemplo: '192.168.5.77/27',
    error: 'Escríbela así: 192.168.5.77/27 (la máscara, de /24 a /30).',
    titulo: v => `${v.o.join('.')}/${v.p}, paso a paso`
  });

  /* ============================================================
     7. IPv6, las tres reglas: "2035:0001:2FC5:0000:0000:087C:0000:0001"
     ============================================================ */
  /* Una fila de 8 bloques. Cada bloque es una lista de trozos
     [texto, clase]; clase 'fuera' = ceros que se quitan (cálido y
     tachados), 'nuevo' = bloque que ha cambiado (cian). */
  function filaBloques(bloques, opc) {
    /* 8 cajas de 40 + 4 de hueco = 352 */
    const y = opc.y || 14;
    let s = '';
    bloques.forEach((trozos, i) => {
      const x = 4 + i * 44;
      if (opc.ocultos && opc.ocultos.includes(i)) return;
      const tachado = trozos.some(t => t[1] === 'fuera');
      const nuevo = trozos.some(t => t[1] === 'nuevo');
      s += caja(x, y, 40, 30, tachado ? 'd-caja-act' : (nuevo ? 'd-caja-on' : 'd-caja'));
      const partes = trozos.map(([t, c]) => {
        const cls = c === 'fuera' ? 'd-c d-tachado' : (c === 'nuevo' ? 'd-a' : 'd-t');
        return `<tspan class="${cls}">${esc(t)}</tspan>`;
      }).join('');
      s += `<text x="${x + 20}" y="${y + 20}" text-anchor="middle">${partes}</text>`;
    });
    if (opc.hueco) {
      const [ini, fin] = opc.hueco;
      const x1 = 4 + ini * 44, x2 = 4 + fin * 44 + 40;
      s += caja(x1, y, x2 - x1, 30, 'd-caja-on');
      s += tx((x1 + x2) / 2, y + 21, '::', 'd-a d-grande', 'middle');
    }
    return s;
  }
  const llano = bl => bl.map(b => [[b, '']]);
  function tramoCeros(b) {
    /* el tramo más largo de bloques "0" seguidos (mínimo 2); si empatan, el primero */
    let mejor = null, ini = -1;
    for (let i = 0; i <= 8; i++) {
      if (i < 8 && b[i] === '0') { if (ini < 0) ini = i; continue; }
      if (ini >= 0) {
        const largo = i - ini;
        if (largo >= 2 && (!mejor || largo > mejor[1] - mejor[0] + 1)) mejor = [ini, i - 1];
        ini = -1;
      }
    }
    return mejor;
  }
  function textoCorto(b, tramo) {
    if (!tramo) return b.join(':');
    const izq = b.slice(0, tramo[0]).join(':');
    const der = b.slice(tramo[1] + 1).join(':');
    return `${izq}::${der}`;
  }
  function diaposIpv6(bl) {
    const ANCHO = 360, ALTO = 136;
    const original = bl;
    const r1 = bl.map(b => (b === '0000' ? '0000' : b.replace(/^0+/, '')));
    const cambia1 = bl.map((b, i) => (b !== r1[i] ? i : -1)).filter(i => i >= 0);
    const r2 = r1.map(b => (b === '0000' ? '0' : b));
    const cambia2 = r1.map((b, i) => (b !== r2[i] ? i : -1)).filter(i => i >= 0);
    const tramo = tramoCeros(r2);
    const final = textoCorto(r2, tramo);
    const lista = [];
    const flecha = tx(ANCHO / 2, 60, '↓', 'd-d', 'middle');
    const abajo = t => tx(ANCHO / 2, 124, t, 'd-t', 'middle');
    /* antes: los ceros que se van, tachados; después: lo que cambia, en cian */
    const antes1 = bl.map((b, i) => {
      if (!cambia1.includes(i)) return [[b, '']];
      const n = b.length - r1[i].length;
      return [[b.slice(0, n), 'fuera'], [b.slice(n), '']];
    });
    const despues1 = r1.map((b, i) => [[b, cambia1.includes(i) ? 'nuevo' : '']]);
    const antes2 = r1.map((b, i) => (cambia2.includes(i) ? [['000', 'fuera'], ['0', '']] : [[b, '']]));
    const despues2 = r2.map((b, i) => [[b, cambia2.includes(i) ? 'nuevo' : '']]);

    lista.push({
      svg: svg(ANCHO, ALTO, 'La dirección IPv6 entera, 8 bloques', filaBloques(llano(original), {}) + abajo(original.join(':'))),
      texto: 'Una IPv6 entera: <strong>8 bloques</strong> de 4 dígitos hexadecimales, separados por dos puntos. Para acortarla hay tres reglas, y se aplican <strong>en orden</strong>.'
    });
    lista.push({
      svg: svg(ANCHO, ALTO, 'Regla 1: quitar los ceros a la izquierda de cada bloque',
        cambia1.length
          ? filaBloques(antes1, {}) + flecha + filaBloques(despues1, { y: 70 }) + abajo(r1.join(':'))
          : filaBloques(llano(r1), {}) + abajo(r1.join(':'))),
      texto: cambia1.length
        ? '<strong>Regla 1:</strong> en cada bloque se quitan los ceros <strong>de la izquierda</strong>. Arriba, tachados, los que se van; abajo, en azul, cómo queda. Los de la derecha nunca se quitan: cambiaría el número. Los 0000 se dejan para la regla 2.'
        : '<strong>Regla 1:</strong> se quitan los ceros de la izquierda de cada bloque. Aquí no hay ninguno que quitar.'
    });
    lista.push({
      svg: svg(ANCHO, ALTO, 'Regla 2: un bloque 0000 se deja en 0',
        cambia2.length
          ? filaBloques(antes2, {}) + flecha + filaBloques(despues2, { y: 70 }) + abajo(r2.join(':'))
          : filaBloques(llano(r2), {}) + abajo(r2.join(':'))),
      texto: cambia2.length
        ? '<strong>Regla 2:</strong> un bloque de cuatro ceros, <strong>0000</strong>, se queda en un solo <strong>0</strong>: se tachan tres.'
        : '<strong>Regla 2:</strong> un bloque 0000 se deja en 0. Aquí no hay ninguno.'
    });
    if (tramo) {
      const antes3 = r2.map((b, i) => [[b, i >= tramo[0] && i <= tramo[1] ? 'fuera' : '']]);
      const fuera = [];
      for (let i = tramo[0]; i <= tramo[1]; i++) fuera.push(i);
      const sobra = r2.filter(b => b === '0').length > tramo[1] - tramo[0] + 1;
      lista.push({
        svg: svg(ANCHO, ALTO, 'Regla 3: los bloques de ceros seguidos se cambian por dos puntos dobles',
          filaBloques(antes3, {}) + flecha + filaBloques(llano(r2), { y: 70, ocultos: fuera, hueco: tramo }) + abajo(final)),
        texto: `<strong>Regla 3:</strong> los ${tramo[1] - tramo[0] + 1} bloques de ceros <strong>seguidos</strong> (tachados) se cambian por <strong>::</strong>. Solo se puede hacer <strong>una vez</strong> en toda la dirección${sobra ? ': por eso el otro 0 se queda escrito' : ''}.`
      });
    } else {
      lista.push({
        svg: svg(ANCHO, ALTO, 'Regla 3: no hay dos bloques de ceros seguidos', filaBloques(llano(r2), {}) + abajo(final)),
        texto: '<strong>Regla 3:</strong> sirve para dos o más bloques de ceros <strong>seguidos</strong>. Aquí no los hay, así que no se aplica.'
      });
    }
    lista.push({
      svg: svg(ANCHO, ALTO, `Resultado: ${final}`,
        tx(ANCHO / 2, 36, original.join(':'), 'd-d', 'middle') + tx(ANCHO / 2, 64, '↓', 'd-d', 'middle') + tx(ANCHO / 2, 96, final, 'd-a d-grande', 'middle')),
      texto: `Resultado: <strong>${final}</strong>. Es la misma dirección, solo que más corta.`
    });
    return lista;
  }
  registrarDiapos('ipv6-abreviar', {
    crear: bl => diaposIpv6(bl),
    leer: s => {
      const t = String(s).replace(/\u200B/g, '').trim().toUpperCase();
      const b = t.split(':');
      if (b.length !== 8 || !b.every(x => /^[0-9A-F]{1,4}$/.test(x))) return null;
      return b.map(x => x.padStart(4, '0'));
    },
    etiqueta: 'Escribe una IPv6 entera, con sus 8 bloques',
    ejemplo: 'FE80:0000:0000:0000:0202:B3FF:FE1E:8329',
    error: 'Tienen que ser 8 bloques separados por «:», cada uno de 1 a 4 dígitos (0-9 y A-F).',
    modo: 'text',
    titulo: bl => `${bl.join(':')} abreviada, paso a paso`
  });
  /* ============================================================
     8. Subredes de clase C con la hoja de bits (17/10/2026):
        "192.10.10.0, 14 subredes" o "200.175.14.0, 45 equipos".
        Todas las subredes se usan; solo se restan 2 a los equipos.
     ============================================================ */
  function calcSubredC(v) {
    const { o, n, tipo } = v;
    let bits;
    if (tipo === 'subredes') {
      bits = 0;
      while (Math.pow(2, bits) < n) bits++;
    } else {
      let h = 0;
      while (Math.pow(2, h) < n + 2) h++;
      bits = 8 - h;
    }
    const sumandos = PESOS.slice(0, bits);
    const ultimo = sumandos.reduce((a, b) => a + b, 0);
    return {
      o, n, tipo, bits, sumandos, ultimo,
      pre: o.slice(0, 3).join('.'),
      prefijo: 24 + bits,
      subredes: Math.pow(2, bits),
      dirs: Math.pow(2, 8 - bits),
      salto: PESOS[bits - 1]
    };
  }
  /* La hoja: pesos, subredes y direcciones de cada columna.
     opc: cogidos (pinta las columnas cogidas), marca: [[fila, col]…]
     en color cálido, corte (raya tras el último bit cogido),
     suma (pesos cogidos en cálido). */
  function hojaBits(r, opc) {
    const X0 = 62, W = 37;
    const filas = [
      ['peso', i => PESOS[i]],
      ['subredes', i => Math.pow(2, i + 1)],
      ['direcc.', i => Math.pow(2, 7 - i)]
    ];
    let s = '';
    filas.forEach((f, fi) => {
      const y = 6 + fi * 28;
      s += tx(4, y + 15, f[0], 'd-d d-peq');
      for (let i = 0; i < 8; i++) {
        const cogido = opc.cogidos && i < r.bits;
        const marcado = (opc.marca || []).some(m => m[0] === fi && m[1] === i);
        s += caja(X0 + i * W, y, W - 3, 22, marcado ? 'd-caja-act' : (cogido ? 'd-caja-on' : 'd-caja'));
        let cls = cogido ? 'd-a' : 'd-d';
        if (marcado || (opc.suma && fi === 0 && i < r.bits)) cls = 'd-c';
        s += tx(X0 + i * W + (W - 3) / 2, y + 16, String(f[1](i)), cls, 'middle');
      }
    });
    if (opc.corte) {
      const xc = X0 + r.bits * W - 1.5;
      s += linea(xc, 2, xc, 92, 'd-linea-c');
    }
    return s;
  }
  function diaposSubredC(v) {
    const r = calcSubredC(v);
    const ANCHO = 360, ALTO = 150;
    const red = r.o.join('.');
    const necesito = r.tipo === 'subredes' ? `${r.n} subredes` : `${r.n} equipos en cada subred`;
    const lista = [];
    const abajo = (a, b) => tx(ANCHO / 2, 118, a, 'd-c d-grande', 'middle') + (b ? tx(ANCHO / 2, 142, b, 'd-t', 'middle') : '');

    lista.push({
      svg: svg(ANCHO, ALTO, `${red}, necesito ${necesito}`,
        tx(ANCHO / 2, 50, red, 'd-t d-grande', 'middle') +
        tx(ANCHO / 2, 84, `necesito ${necesito}`, 'd-c', 'middle') +
        tx(ANCHO / 2, 118, '¿máscara? ¿salto? ¿subredes?', 'd-d', 'middle')),
      texto: `Me dan la red <strong>${red}</strong> y me dicen que necesito <strong>${necesito}</strong>. Voy a sacar la máscara nueva, cuántas subredes salen, cuántos equipos caben y el salto. Siempre con los mismos 5 pasos.`
    });

    let oct = '';
    r.o.forEach((x, i) => {
      const xx = 10 + i * 86;
      oct += caja(xx, 14, 78, 30, i === 3 ? 'd-caja-act' : 'd-caja');
      oct += tx(xx + 39, 34, String(x), i === 3 ? 'd-c' : 'd-a', 'middle');
      oct += tx(xx + 39, 62, i === 3 ? 'host' : 'red', i === 3 ? 'd-c' : 'd-a', 'middle');
    });
    lista.push({
      svg: svg(ANCHO, ALTO, `${r.o[0]}: clase C, máscara por defecto 255.255.255.0`,
        oct + tx(ANCHO / 2, 96, `${r.o[0]} → clase C`, 'd-t', 'middle') +
        tx(ANCHO / 2, 124, '255.255.255.0  (/24)', 'd-a d-grande', 'middle')),
      texto: `Paso 1, la clase: empieza por ${r.o[0]} → <strong>clase C</strong>. Su máscara por defecto es 255.255.255.0: los tres primeros números son la red y no se tocan. Lo que voy a partir es el <strong>último número</strong>, que tiene 8 bits.`
    });

    lista.push({
      svg: svg(ANCHO, ALTO, 'La hoja: pesos, subredes y direcciones de cada bit',
        hojaBits(r, {}) + tx(ANCHO / 2, 124, 'los bits se cogen desde la izquierda', 'd-d', 'middle')),
      texto: 'Paso 2, la hoja. Arriba, los <strong>pesos</strong> de los 8 bits del último número. Si cojo bits empezando por la izquierda, en esa columna leo cuántas <strong>subredes</strong> salen y cuántas <strong>direcciones</strong> tiene cada una. Cada bit más: el doble de subredes y la mitad de direcciones.'
    });

    let porque;
    if (r.tipo === 'subredes') {
      const noLlegan = [];
      for (let i = 1; i < r.bits; i++) noLlegan.push(Math.pow(2, i));
      porque = `Busco en la fila de subredes el primer número que llega a ${r.n}: ${noLlegan.length ? noLlegan.join(', ') + (noLlegan.length > 1 ? ' no llegan' : ' no llega') + '; ' : ''}<strong>${r.subredes}</strong> sí. Está en la columna ${r.bits} → <strong>cojo ${r.bits} bit${r.bits > 1 ? 's' : ''}</strong>.`;
    } else {
      const llegan = [];
      for (let i = 0; i < r.bits; i++) llegan.push(Math.pow(2, 7 - i));
      porque = `Cada subred necesita ${r.n} equipos + 2 (la de red y el broadcast) = <strong>${r.n + 2} direcciones</strong>. En la fila de direcciones voy hacia la derecha mientras llegue a ${r.n + 2}: ${llegan.join(', ')} ${llegan.length > 1 ? 'llegan' : 'llega'}; ${Math.pow(2, 7 - r.bits)} ya no. Me quedo en el <strong>${r.dirs}</strong>, columna ${r.bits} → <strong>cojo ${r.bits} bit${r.bits > 1 ? 's' : ''}</strong>.`;
    }
    const filaMarca = r.tipo === 'subredes' ? 1 : 2;
    lista.push({
      svg: svg(ANCHO, ALTO, `Cojo ${r.bits} bits`,
        hojaBits(r, { cogidos: true, corte: true, marca: [[filaMarca, r.bits - 1]] }) + abajo(`cojo ${r.bits} bit${r.bits > 1 ? 's' : ''}`)),
      texto: 'Paso 2. ' + porque
    });

    const suma = r.sumandos.length > 1 ? `${r.sumandos.join(' + ')} = ${r.ultimo}` : '128';
    lista.push({
      svg: svg(ANCHO, ALTO, `Máscara nueva 255.255.255.${r.ultimo}, /${r.prefijo}`,
        hojaBits(r, { cogidos: true, corte: true, suma: true }) + abajo(suma, `255.255.255.${r.ultimo}   (/${r.prefijo})`)),
      texto: `Paso 3, la <strong>máscara nueva</strong>: sumo los pesos de los bits que he cogido, ${suma}. El último número de la máscara pasa de 0 a ${r.ultimo}: <strong>255.255.255.${r.ultimo}</strong>, que es /${r.prefijo} (24 + ${r.bits}).`
    });

    lista.push({
      svg: svg(ANCHO, ALTO, `${r.subredes} subredes de ${r.dirs} direcciones, ${r.dirs - 2} equipos en cada una`,
        hojaBits(r, { cogidos: true, corte: true, marca: [[1, r.bits - 1], [2, r.bits - 1]] }) +
        abajo(`${r.subredes} subredes · ${r.dirs - 2} equipos`, `${r.dirs} direcciones − 2 = ${r.dirs - 2}`)),
      texto: `Paso 4, cuántas: en la columna ${r.bits} leo <strong>${r.subredes} subredes</strong> de <strong>${r.dirs} direcciones</strong>. Equipos en cada una: ${r.dirs} − 2 = <strong>${r.dirs - 2}</strong>, porque la dirección de red y el broadcast no se dan a nadie. Todas las subredes se usan, también la primera y la última.`
    });

    const inicios = [];
    for (let k = 0; k < Math.min(r.subredes, 5); k++) inicios.push('.' + k * r.salto);
    lista.push({
      svg: svg(ANCHO, ALTO, `Salto ${r.salto}`,
        hojaBits(r, { cogidos: true, corte: true, marca: [[0, r.bits - 1]] }) +
        abajo(`salto = ${r.salto}`, inicios.join('  ') + (r.subredes > 5 ? '  …' : ''))),
      texto: `Paso 5, el <strong>salto</strong>: es el peso del último bit cogido, <strong>${r.salto}</strong> (el mismo número que las direcciones de cada subred). Las subredes empiezan de ${r.salto} en ${r.salto}: ${inicios.join(', ')}${r.subredes > 5 ? '…' : '.'}`
    });

    const ks = r.subredes <= 4 ? Array.from({ length: r.subredes }, (_, k) => k + 1) : [1, 2, 3, 0, r.subredes];
    let t = tx(10, 18, `${r.pre}. …`, 'd-d') + tx(10, 40, 'nº', 'd-d') + tx(56, 40, 'red', 'd-d') + tx(130, 40, 'equipos', 'd-d') + tx(272, 40, 'broadcast', 'd-d');
    ks.forEach((k, i) => {
      const y = 64 + i * 20;
      if (k === 0) { t += tx(10, y, '…', 'd-d'); return; }
      const ini = (k - 1) * r.salto, fin = ini + r.dirs - 1;
      t += tx(10, y, `${k}ª`, 'd-t') + tx(56, y, `.${ini}`, 'd-a') + tx(130, y, `.${ini + 1} – .${fin - 1}`, 'd-t') + tx(272, y, `.${fin}`, 'd-c');
    });
    lista.push({
      svg: svg(ANCHO, ALTO, `Lista de las ${r.subredes} subredes`, t),
      texto: `Y la lista: la 1ª subred empieza en .0, la 2ª en .${r.salto}… La <strong>N</strong>ª empieza en (N − 1) × ${r.salto}. El <strong>broadcast</strong> de cada una es la red siguiente − 1, y los <strong>equipos</strong> son los de en medio.`
    });
    return lista;
  }
  registrarDiapos('subred-c-metodo', {
    crear: v => diaposSubredC(v),
    leer: s => {
      const m = String(s).trim().match(/^(\d{1,3}(?:\.\d{1,3}){3})\s*[,;]?\s*(\d{1,3})\s*(subred(?:es)?|equipos?|hosts?)$/i);
      if (!m) return null;
      const o = leerIp(m[1]);
      const n = Number(m[2]);
      if (!o || o[0] < 192 || o[0] > 223 || o[3] !== 0) return null;
      const tipo = /^subred/i.test(m[3]) ? 'subredes' : 'equipos';
      if (n < 2 || (tipo === 'subredes' ? n > 64 : n > 126)) return null;
      return { o, n, tipo };
    },
    etiqueta: 'Escribe una red de clase C y lo que necesitas',
    ejemplo: '210.100.56.0, 30 equipos',
    error: 'Escríbelo así: 210.100.56.0, 6 subredes (o 30 equipos). La red, de clase C (empieza por 192 a 223) y acabada en 0; de 2 a 64 subredes o de 2 a 126 equipos.',
    modo: 'text',
    titulo: v => `${v.o.join('.')}, ${v.n} ${v.tipo}, paso a paso`
  });
})();
