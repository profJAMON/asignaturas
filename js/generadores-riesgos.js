/* ============================================================
   Generadores de la Unidad 2 de Instalaciones (prevención de
   riesgos laborales).

   Va en un archivo aparte, cargado DESPUÉS de js/generadores.js,
   para no pisar los cambios de ese archivo que están pendientes
   de publicar. Solo añade entradas al objeto GENERADORES, que es
   global. Si algún día se quiere, se pega al final de
   generadores.js y se quita este <script> de tema.html.

   valoracion-riesgo: matriz de valoración del INSST
     probabilidad (Baja / Media / Alta)
     × consecuencia (Ligeramente dañino / Dañino / Extremadamente dañino)
     → Trivial / Tolerable / Moderado / Importante / Intolerable
   ============================================================ */

(function () {
  if (typeof GENERADORES === 'undefined') return;

  const PROB = ['baja', 'media', 'alta'];
  const CONS = ['ligeramente dañino', 'dañino', 'extremadamente dañino'];

  /* fila = probabilidad, columna = consecuencia */
  const MATRIZ = [
    ['Trivial', 'Tolerable', 'Moderado'],
    ['Tolerable', 'Moderado', 'Importante'],
    ['Moderado', 'Importante', 'Intolerable']
  ];

  const SIGLAS = {
    Trivial: 'T', Tolerable: 'TO', Moderado: 'M', Importante: 'I', Intolerable: 'IN'
  };

  const QUE_HACER = {
    Trivial: 'no hace falta ninguna acción específica',
    Tolerable: 'no hacen falta medidas nuevas, pero hay que vigilar que las que hay se cumplen',
    Moderado: 'hay que reducir el riesgo en un plazo determinado',
    Importante: 'no se debe empezar (o seguir) el trabajo hasta haber reducido el riesgo',
    Intolerable: 'se prohíbe el trabajo hasta que se reduzca el riesgo'
  };

  /* Peligros del taller de redes. p y c son índices de PROB y CONS. */
  const PELIGROS = [
    { t: 'Un trozo de cable UTP tirado en la zona de paso del taller', p: 2, c: 0,
      por: 'con cables por el suelo, alguien tropieza casi seguro; normalmente acaba en un traspié o un golpe leve' },
    { t: 'Subir a la escalera para pasar cable por el falso techo, con la escalera sin sus tacos antideslizantes', p: 1, c: 2,
      por: 'no pasa cada día, pero una caída de altura puede causar fracturas graves' },
    { t: 'La crimpadora eléctrica con el cable de alimentación pelado', p: 1, c: 2,
      por: 'se usa a menudo y la parte pelada queda a mano; un contacto eléctrico puede ser grave' },
    { t: 'Cajas de conectores apiladas hasta arriba en una estantería alta', p: 1, c: 0,
      por: 'se caen de vez en cuando; una caja de conectores pesa poco' },
    { t: 'Cortar canaleta con sierra de mano sin gafas', p: 1, c: 1,
      por: 'saltan virutas con frecuencia; una en el ojo es una lesión que requiere atención médica' },
    { t: 'Pelar cable con cúter en lugar de pelacables', p: 2, c: 1,
      por: 'con cúter los cortes en los dedos son habituales y pueden necesitar puntos' },
    { t: 'Ruido de la taladradora durante unos minutos al hacer un agujero para la caja de superficie', p: 0, c: 0,
      por: 'es un rato corto y ocasional; no llega a dañar el oído' },
    { t: 'Soldador de estaño encendido y apoyado fuera de su soporte', p: 1, c: 1,
      por: 'es fácil rozarlo; una quemadura en la mano duele y tarda en curar' },
    { t: 'Cuadro eléctrico del taller abierto y sin señalizar', p: 0, c: 2,
      por: 'los alumnos no suelen acercarse, pero tocar partes en tensión puede ser mortal' },
    { t: 'Regleta con seis equipos enchufados y otra regleta conectada a ella', p: 1, c: 2,
      por: 'la sobrecarga calienta la regleta; un incendio tiene consecuencias muy graves' },
    { t: 'Levantar sin doblar las rodillas una bobina de cable de 305 m (unos 10 kg)', p: 1, c: 1,
      por: 'se hace a menudo y mal hecho acaba en lumbalgia, que puede tenerte días de baja' },
    { t: 'Dos horas delante del ordenador con la pantalla demasiado cerca y sin pausas', p: 2, c: 0,
      por: 'pasa en casi todas las sesiones; produce fatiga visual y dolor de cuello, molestias leves' },
    { t: 'Guardar los alicates en el bolsillo trasero del pantalón', p: 0, c: 0,
      por: 'rara vez hace daño y, si lo hace, es un pinchazo o un roce' },
    { t: 'Trabajar en el rack con el suelo del armario lleno de latiguillos sueltos', p: 1, c: 0,
      por: 'los enganchones con los pies son frecuentes, pero suelen quedarse en un traspié' },
    { t: 'Pistola de aire caliente para el termorretráctil dejada encendida boca abajo sobre la mesa', p: 0, c: 1,
      por: 'no suele pasar si se trabaja con cuidado, pero la boquilla quema y puede chamuscar la mesa' }
  ];

  function nombre(v) {
    return [v, SIGLAS[v]];
  }

  function genValoracionRiesgo() {
    let p, c, enunciado, extra;
    if (Math.random() < 0.3) {
      p = Math.floor(Math.random() * 3);
      c = Math.floor(Math.random() * 3);
      enunciado = `Probabilidad ${PROB[p]} × consecuencia ${CONS[c]} → ¿valoración?`;
      extra = '';
    } else {
      const d = PELIGROS[Math.floor(Math.random() * PELIGROS.length)];
      p = d.p; c = d.c;
      enunciado = `${d.t}. Probabilidad ${PROB[p]}, consecuencia ${CONS[c]} → ¿valoración?`;
      extra = ` Por qué esa estimación: ${d.por}.`;
    }
    const v = MATRIZ[p][c];
    return {
      enunciado,
      respuesta: v,
      respuestas: nombre(v),
      formato: 'texto',
      pista: `${PROB[p][0].toUpperCase()}${PROB[p].slice(1)} × ${CONS[c]} = ${v} (${SIGLAS[v]}): ${QUE_HACER[v]}.${extra}`
    };
  }

  GENERADORES['valoracion-riesgo'] = genValoracionRiesgo;
})();
