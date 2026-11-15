/* ============================================================
   Generadores de las Unidades 8 y 9 de Instalaciones (cableado
   estructurado y montaje de la red), 15/11/2026.

   Archivo aparte, cargado DESPUÉS de js/generadores.js. Solo añade
   entradas al objeto global GENERADORES.

   canal-100m          latiguillo + cable fijo + latiguillo → ¿cumple
                       la norma? (fijo ≤ 90 m, cada latiguillo ≤ 5 m)
   armario-cuenta      tomas + 25 %, paneles de 24 y U del armario
   canalizacion-elige  situación → canaleta, bandeja, suelo técnico,
                       techo técnico, empotrada o tubo enterrado
   ============================================================ */

(function () {
  if (typeof GENERADORES === 'undefined') return;

  const elige = (lista) => lista[Math.floor(Math.random() * lista.length)];
  const entre = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const SI = ['si', 'sí', 's', 'cumple', 'si cumple', 'sí cumple', 'si, cumple', 'sí, cumple'];
  const NO = ['no', 'n', 'no cumple', 'no, no cumple'];

  /* ---------- ¿Cumple los 100 m? ---------- */
  function genCanal() {
    // Tipos: bien (todo dentro), fijo largo, latiguillo largo.
    const tipo = elige(['bien', 'bien', 'fijo', 'latiguillo']);
    let a = entre(1, 5), b = entre(15, 90), c = entre(1, 3);
    if (tipo === 'fijo') b = entre(91, 98);
    if (tipo === 'latiguillo') { if (Math.random() < 0.5) a = entre(6, 9); else c = entre(6, 8); }
    const cumple = a <= 5 && b <= 90 && c <= 5;
    let pista = 'Mira las tres reglas: el cable fijo, de la toma al panel, 90 m como mucho; cada latiguillo, 5 m como mucho; todo junto, 100 m como mucho.';
    if (!cumple && b > 90) pista = `El cable fijo mide ${b} m: se pasa de 90 m.`;
    else if (!cumple) pista = `Hay un latiguillo de más de 5 m (${a > 5 ? a : c} m).`;
    return {
      enunciado: `Latiguillo del ordenador a la toma: ${a} m · cable fijo de la toma al armario: ${b} m · latiguillo del panel al switch: ${c} m. ¿Cumple la norma? (sí o no)`,
      respuesta: cumple ? 'sí' : 'no',
      respuestas: cumple ? SI : NO,
      formato: 'texto',
      traducible: true,
      pista
    };
  }

  /* ---------- Contar para el armario ---------- */
  function genArmario() {
    const tipo = elige(['margen', 'margen', 'paneles', 'paneles', 'u']);
    if (tipo === 'margen') {
      const n = entre(3, 16) * 4 + elige([0, 0, 1, 2, 3]);
      const r = Math.ceil(n * 1.25);
      return {
        enunciado: `Una planta tiene ${n} tomas. Le sumas un 25 % de margen. ¿Cuántas bocas de panel preparas?`,
        respuesta: String(r),
        formato: 'numero',
        pista: `El 25 % es la cuarta parte: ${n} ÷ 4 = ${(n / 4).toString().replace('.', ',')}. Súmalo a ${n} y, si sale con decimales, redondea hacia arriba (no se puede preparar media boca).`
      };
    }
    if (tipo === 'paneles') {
      const m = entre(10, 90);
      const r = Math.ceil(m / 24);
      return {
        enunciado: `Necesitas ${m} bocas de panel. Los paneles son de 24 bocas. ¿Cuántos paneles pones?`,
        respuesta: String(r),
        formato: 'numero',
        pista: `Cada panel da 24 bocas: ${[1, 2, 3, 4].map(k => `${k} panel${k > 1 ? 'es' : ''} = ${24 * k}`).join(', ')}… Coge el primero que llegue a ${m}.`
      };
    }
    const p = entre(1, 3), s = entre(1, 3);
    const r = p + p + s + 1 + 1;
    return {
      enunciado: `Un armario lleva ${p} panel${p > 1 ? 'es' : ''} de parcheo (1 U cada uno) con su pasahilos debajo (1 U cada uno), ${s} switch${s > 1 ? 'es' : ''} de 1 U, una bandeja para el router (1 U) y una regleta de enchufes (1 U). ¿Cuántas U ocupa todo?`,
      respuesta: String(r),
      formato: 'numero',
      pista: `Suma una U por cada cosa: ${p} panel${p > 1 ? 'es' : ''} + ${p} pasahilos + ${s} switch${s > 1 ? 'es' : ''} + 1 bandeja + 1 regleta.`
    };
  }

  /* ---------- ¿Qué canalización? ---------- */
  const CANAL = [
    ['Una oficina ya construida: hay que llevar dos cables por la pared hasta una mesa, sin obras.', 'canaleta', ['canaleta', 'la canaleta', 'canaleta de superficie', 'en superficie', 'superficie']],
    ['Llevar muchos cables por encima del techo de un pasillo, donde hay falso techo de placas.', 'techo técnico', ['techo tecnico', 'techo técnico', 'falso techo', 'por el techo tecnico', 'bandeja en techo tecnico', 'bandeja por el techo tecnico']],
    ['Una sala de servidores con el suelo de placas levantado sobre patas, para pasar cables por debajo.', 'suelo técnico', ['suelo tecnico', 'suelo técnico', 'falso suelo', 'bajo suelo tecnico']],
    ['Un almacén con techo alto, sin falso techo: muchos cables colgados a la vista hacia el armario.', 'bandeja', ['bandeja', 'bandeja en techo', 'bandeja de rejilla', 'en techo', 'techo', 'bandeja colgada']],
    ['Una casa en obras: los cables van dentro de la pared, en tubos metidos en una roza, antes de pintar.', 'empotrada', ['empotrada', 'canalizacion empotrada', 'tubo empotrado', 'empotrado', 'en pared', 'roza']],
    ['Unir dos edificios del instituto separados por el patio.', 'tubo enterrado', ['tubo enterrado', 'enterrado', 'bajo tierra', 'tubo bajo tierra', 'subterranea', 'subterránea', 'tubo de pvc enterrado', 'campus']]
  ];
  function genCanalizacion() {
    const [t, r, rs] = elige(CANAL);
    return {
      enunciado: `${t} ¿Por dónde lo canalizas?`,
      respuesta: r,
      respuestas: rs,
      formato: 'texto',
      traducible: true,
      pista: 'Canaleta: en la pared, sin obras. Bandeja: colgada del techo, a la vista. Techo o suelo técnico: escondida en el falso techo o el falso suelo. Empotrada: dentro de la pared, en obra. Entre edificios: tubo enterrado.'
    };
  }

  GENERADORES['canal-100m'] = genCanal;
  GENERADORES['armario-cuenta'] = genArmario;
  GENERADORES['canalizacion-elige'] = genCanalizacion;
})();
