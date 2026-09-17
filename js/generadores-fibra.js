/* ============================================================
   Generadores de la Unidad 4 de Instalaciones (fibra óptica).

   Archivo aparte, cargado DESPUÉS de js/generadores.js, igual que
   los de riesgos y cobre. Solo añade entradas al objeto global
   GENERADORES.

   fibra-tipo       descripción → monomodo o multimodo (y OM/OS)
   fibra-conector   descripción → LC, SC, ST, FC, MPO, UPC o APC
   perdidas-fibra   presupuesto de pérdidas de un enlace (dB)
   margen-fibra     margen = lo que aguanta el módulo − pérdidas

   Valores de cálculo (los mismos que en la sesión 4):
   multimodo 3,5 dB/km · monomodo 0,5 dB/km · conexión 0,75 dB ·
   empalme 0,3 dB. Las longitudes se eligen para que el resultado
   tenga como mucho dos decimales, porque la corrección numérica es
   exacta.
   ============================================================ */

(function () {
  if (typeof GENERADORES === 'undefined') return;

  function elige(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function entero(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function redondea(x) {
    return Math.round(x * 100) / 100;
  }

  /* 3,05 con coma, sin ceros sobrantes */
  function coma(x) {
    return String(redondea(x)).replace('.', ',');
  }

  /* ---------- Monomodo o multimodo ---------- */

  const MONO = ['monomodo', 'mono', 'sm', 'single-mode', 'single mode', 'singlemode', 'monomodo os2', 'os2', 'os1'];
  const MULTI = ['multimodo', 'multi', 'mm', 'multimode', 'multi-mode'];

  const TIPOS = [
    ['Latiguillo con la cubierta amarilla', 'monomodo'],
    ['Cable con el texto impreso 9/125', 'monomodo'],
    ['Cable con el texto impreso 50/125', 'multimodo'],
    ['Cable con el texto impreso 62,5/125', 'multimodo'],
    ['Latiguillo aguamarina (aqua)', 'multimodo'],
    ['Latiguillo naranja de una instalación antigua', 'multimodo'],
    ['Cable violeta marcado OM4', 'multimodo'],
    ['Cable verde lima marcado OM5', 'multimodo'],
    ['Fibra con un único camino posible para la luz', 'monomodo'],
    ['Fibra en la que la luz va por muchos caminos a la vez', 'multimodo'],
    ['La fibra que sufre dispersión modal', 'multimodo'],
    ['Fibra que llega a 10 km con 10GBASE-LR', 'monomodo'],
    ['Fibra que usa 10GBASE-SR (hasta 300-400 m)', 'multimodo'],
    ['Fibra que usa 1000BASE-SX', 'multimodo'],
    ['Fibra que usa 1000BASE-LX', 'monomodo'],
    ['Fibra que se usa con luz de 850 nm', 'multimodo'],
    ['Fibra para un enlace de 25 km entre dos pueblos', 'monomodo'],
    ['Fibra que llega a casa en una instalación FTTH', 'monomodo'],
    ['Fibra que admite un emisor LED barato', 'multimodo'],
    ['Fibra con núcleo de 9 µm', 'monomodo'],
    ['Latiguillo con conectores SC de cuerpo verde (APC)', 'monomodo'],
    ['Fibra que pierde unos 0,35 dB por kilómetro', 'monomodo']
  ];

  function genFibraTipo() {
    const [t, r] = elige(TIPOS);
    return {
      enunciado: `${t} → ¿monomodo o multimodo?`,
      respuesta: r,
      respuestas: r === 'monomodo' ? MONO : MULTI,
      formato: 'texto',
      pista: 'Monomodo: 9 µm, amarillo, láser, 1310/1550 nm, kilómetros, LX/LR, APC. Multimodo: 50 o 62,5 µm, naranja/aqua/violeta/lima, 850 nm, cientos de metros, SX/SR, dispersión modal.'
    };
  }

  /* ---------- Conectores ---------- */

  const CONECTORES = [
    ['Pequeño, con pestaña como un RJ-45, en pareja en los módulos SFP', 'LC'],
    ['El conector de los módulos SFP de un switch', 'LC'],
    ['Férula de 1,25 mm, el más habitual en centros de datos', 'LC'],
    ['Cuadrado, se enchufa empujando y se saca tirando', 'SC'],
    ['El conector cuadrado de la fibra que llega a la ONT de casa', 'SC'],
    ['Redondo y metálico, se engancha empujando y girando (bayoneta)', 'ST'],
    ['Típico de instalaciones multimodo antiguas, parecido a un BNC', 'ST'],
    ['Redondo y metálico, de rosca, no se suelta con las vibraciones', 'FC'],
    ['Rectangular y ancho, lleva 12 o 24 fibras en una sola férula', 'MPO'],
    ['Conector de muchas fibras para enlaces de 40 a 400 Gbps', 'MPO'],
    ['Pulido con la punta cortada a 8 grados, cuerpo verde', 'APC'],
    ['Pulido de punta plana, cuerpo azul en monomodo', 'UPC'],
    ['Pulido que usan las instalaciones FTTH para evitar reflejos', 'APC'],
    ['Pulido habitual de los conectores LC de un switch', 'UPC']
  ];

  function genFibraConector() {
    const [t, r] = elige(CONECTORES);
    const resp = [r];
    if (r === 'MPO') resp.push('MTP', 'MPO/MTP');
    if (r === 'SC') resp.push('SC/APC', 'SC/UPC');
    return {
      enunciado: `${t} → ¿qué es?`,
      respuesta: r,
      respuestas: resp,
      formato: 'texto',
      pista: 'LC pequeño (Little) · SC cuadrado (Square) · ST bayoneta · FC rosca · MPO muchas fibras · UPC plano y azul · APC a 8° y verde.'
    };
  }

  /* ---------- Pérdidas y margen ---------- */

  const DB_KM = { multimodo: 3.5, monomodo: 0.5 };
  const CONEXION = 0.75;
  const EMPALME = 0.3;

  /* Multimodo: de 60 a 500 m en pasos de 20 m (3,5 × 0,02 = 0,07).
     Monomodo: de 0,2 a 20 km en pasos de 0,2 km (0,5 × 0,2 = 0,1). */
  function enlaceAleatorio() {
    const tipo = Math.random() < 0.5 ? 'multimodo' : 'monomodo';
    let metros, km, textoLong;
    if (tipo === 'multimodo') {
      metros = entero(3, 25) * 20;
      km = metros / 1000;
      textoLong = `${metros} m`;
    } else {
      km = entero(1, 100) * 0.2;
      km = Math.round(km * 10) / 10;
      textoLong = `${coma(km)} km`;
    }
    const conexiones = elige([2, 2, 2, 4]);
    const empalmes = tipo === 'multimodo' ? elige([0, 2, 2]) : elige([0, 2, 2, 4, 6]);
    const cable = redondea(km * DB_KM[tipo]);
    const con = redondea(conexiones * CONEXION);
    const emp = redondea(empalmes * EMPALME);
    const total = redondea(cable + con + emp);
    return { tipo, km, textoLong, conexiones, empalmes, cable, con, emp, total };
  }

  function descripcion(e) {
    const emp = e.empalmes === 0 ? 'sin empalmes' : `${e.empalmes} empalmes`;
    return `${e.tipo[0].toUpperCase()}${e.tipo.slice(1)}, ${e.textoLong}, ${e.conexiones} conexiones, ${emp}`;
  }

  function cuentas(e) {
    const km = e.tipo === 'multimodo' ? `${e.textoLong} = ${coma(e.km)} km → ` : '';
    return `${km}${coma(e.km)} × ${coma(DB_KM[e.tipo])} = ${coma(e.cable)} · ${e.conexiones} × 0,75 = ${coma(e.con)} · ${e.empalmes} × 0,3 = ${coma(e.emp)} → total ${coma(e.total)} dB.`;
  }

  function genPerdidasFibra() {
    const e = enlaceAleatorio();
    return {
      enunciado: `${descripcion(e)} → pérdida en dB`,
      respuesta: String(e.total),
      formato: 'numero',
      pista: cuentas(e)
    };
  }

  function genMargenFibra() {
    const e = enlaceAleatorio();
    /* lo que aguanta el módulo: cerca de la pérdida, para que a veces
       sobre, a veces vaya justo y a veces no llegue */
    const aguanta = Math.max(2, Math.round(e.total + elige([-2, -1, 1, 2, 3, 4, 5, 6])));
    const margen = redondea(aguanta - e.total);
    let veredicto;
    if (margen < 0) veredicto = 'negativo: no funciona.';
    else if (margen < 3) veredicto = 'funciona, pero va justo (menos de 3 dB).';
    else veredicto = 'bien diseñado (3 dB o más).';
    return {
      enunciado: `${descripcion(e)}. El módulo aguanta ${aguanta} dB → margen en dB`,
      respuesta: String(margen),
      formato: 'numero',
      pista: `Pérdida: ${cuentas(e)} Margen = ${aguanta} − ${coma(e.total)} = ${coma(margen)} dB, ${veredicto}`
    };
  }

  GENERADORES['fibra-tipo'] = genFibraTipo;
  GENERADORES['fibra-conector'] = genFibraConector;
  GENERADORES['perdidas-fibra'] = genPerdidasFibra;
  GENERADORES['margen-fibra'] = genMargenFibra;
})();
