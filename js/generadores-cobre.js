/* ============================================================
   Generadores de la Unidad 3 de Instalaciones (medios de
   transmisión: cobre y topologías).

   Archivo aparte, cargado DESPUÉS de js/generadores.js, igual que
   js/generadores-riesgos.js. Solo añade entradas al objeto global
   GENERADORES.

   t568-colores        color de un pin, o pin de un color, en T568A/B
   directo-o-cruzado   qué cable une dos aparatos (sin Auto-MDIX)
   topologia-y-medio   descripción o avería → topología o tipo de cable
   ============================================================ */

(function () {
  if (typeof GENERADORES === 'undefined') return;

  function elige(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  /* ---------- T568A / T568B ---------- */

  const T568 = {
    A: ['blanco-verde', 'verde', 'blanco-naranja', 'azul', 'blanco-azul', 'naranja', 'blanco-marrón', 'marrón'],
    B: ['blanco-naranja', 'naranja', 'blanco-verde', 'azul', 'blanco-azul', 'verde', 'blanco-marrón', 'marrón']
  };

  /* "blanco-verde" se acepta también como "blanco verde", "blanco/verde",
     "blanco y verde", "verde-blanco", "bv"… */
  function variantes(color) {
    if (!color.startsWith('blanco-')) {
      return [color, color[0]];
    }
    const c = color.slice(7);
    return [
      color, `blanco ${c}`, `blanco/${c}`, `blanco y ${c}`, `blanco-${c}`,
      `${c}-blanco`, `${c} blanco`, `${c}/blanco`, `${c} y blanco`, `b${c[0]}`, `blanco con ${c}`
    ];
  }

  function listaPines(norma) {
    return T568[norma].map((c, i) => `${i + 1} ${c}`).join(', ');
  }

  function genT568Colores() {
    const norma = Math.random() < 0.5 ? 'A' : 'B';
    const pin = Math.floor(Math.random() * 8) + 1;
    const color = T568[norma][pin - 1];
    if (Math.random() < 0.6) {
      return {
        enunciado: `T568${norma}, pin ${pin} → ¿color?`,
        respuesta: color,
        respuestas: variantes(color),
        formato: 'texto',
        pista: `T568${norma}: ${listaPines(norma)}.`
      };
    }
    return {
      enunciado: `T568${norma}: ¿en qué pin va el ${color}?`,
      respuesta: String(pin),
      formato: 'numero',
      pista: `T568${norma}: ${listaPines(norma)}.`
    };
  }

  /* ---------- Directo o cruzado ---------- */

  /* MDI: transmite por 1-2 y recibe por 3-6 (equipos finales y routers).
     MDI-X: al revés, lleva el cruce por dentro (switches y hubs). */
  const MDI = ['un PC', 'un portátil', 'un servidor', 'un router', 'una impresora de red', 'una cámara IP', 'otro PC'];
  const MDIX = ['un switch', 'un hub', 'otro switch', 'un puerto LAN del router de casa'];

  function tipo(aparato) {
    return MDIX.includes(aparato) ? 'MDI-X' : 'MDI';
  }

  function genDirectoOCruzado() {
    const todos = MDI.concat(MDIX);
    let a = elige(todos.filter(x => !x.startsWith('otro')));
    let b = elige(todos);
    if (b === a) return genDirectoOCruzado();
    /* "otro PC" solo tiene sentido si el primero es un PC, y "otro switch" si es un switch */
    if (b === 'otro PC' && a !== 'un PC') b = 'un PC';
    if (b === 'otro switch' && a !== 'un switch') b = 'un switch';
    if (a === b) return genDirectoOCruzado();

    const ta = tipo(a);
    const tb = tipo(b);
    const cruzado = ta === tb;
    const resp = cruzado ? 'cruzado' : 'directo';
    const casa = (a + b).includes('router de casa')
      ? ' Los puertos LAN del router de casa son un switch pequeño metido dentro, así que cuentan como switch.'
      : '';
    return {
      enunciado: `${a[0].toUpperCase()}${a.slice(1)} con ${b}`,
      respuesta: resp,
      respuestas: cruzado ? ['cruzado', 'cable cruzado', 'c', 'crossover'] : ['directo', 'cable directo', 'd', 'recto', 'paralelo'],
      formato: 'texto',
      pista: `${a[0].toUpperCase()}${a.slice(1)} es ${ta} y ${b} es ${tb}: ${cruzado ? 'iguales → cruzado' : 'distintos → directo'}.${casa} (Con Auto-MDIX funcionaría con cualquiera, pero aquí se pregunta el que toca.)`
    };
  }

  /* ---------- Topología y medio ---------- */

  const TOPO = [
    ['Todos los equipos cuelgan de un único cable troncal con un terminador en cada extremo', 'bus'],
    ['Si se corta el cable principal, se cae la red entera y los equipos no se ven entre sí', 'bus'],
    ['Red antigua de coaxial con conectores en T detrás de cada ordenador', 'bus'],
    ['La información da la vuelta pasando por todos los equipos, siempre en el mismo sentido', 'anillo'],
    ['Solo transmite quien tiene el testigo (token), que va pasando de equipo en equipo', 'anillo'],
    ['Se apaga un equipo cualquiera y deja de funcionar la comunicación entre todos', 'anillo'],
    ['Cada ordenador tiene su propio cable hasta un switch central', 'estrella'],
    ['Un cable de un PC se estropea y solo se queda sin red ese PC', 'estrella'],
    ['El aula del taller: 12 PC, cada uno con su latiguillo al switch de la mesa del profesor', 'estrella'],
    ['Si se estropea el aparato del centro, todos se quedan sin red, pero es muy fácil añadir equipos', 'estrella'],
    ['Un switch principal del que salen cables a los switches de cada planta, y de cada uno a sus PC', 'árbol'],
    ['Varias estrellas colgando de un nodo troncal, formando ramas', 'árbol'],
    ['Cada equipo está unido directamente con todos los demás', 'malla'],
    ['La que más cable necesita, pero si se corta un enlace el tráfico va por otro camino', 'malla'],
    ['Routers de Internet con varios caminos posibles entre ellos para que nunca se corte', 'malla'],
    ['Solo dos equipos unidos por un único cable, sin nada más en la red', 'punto a punto'],
    ['Conectas tu portátil directamente al de un compañero para pasaros un archivo', 'punto a punto']
  ];

  const MEDIO = [
    ['Par trenzado sin ningún apantallamiento, el más barato y el que usamos en el taller', 'UTP'],
    ['Par trenzado con una lámina de aluminio que envuelve los cuatro pares juntos', 'FTP'],
    ['Par trenzado con una pantalla en cada par y otra en el conjunto', 'STP'],
    ['Cable con un conductor central, un dieléctrico, una malla y la cubierta, todo concéntrico', 'coaxial'],
    ['El cable que llega a la toma de la antena de la tele', 'coaxial'],
    ['Latiguillo normal para unir un PC de la oficina con la roseta', 'UTP'],
    ['Cable de par trenzado con la máxima protección contra interferencias, aunque es el más caro y rígido', 'STP'],
    ['Cable que admite conectores BNC o F y lleva una sola señal por el centro', 'coaxial']
  ];

  function genTopologiaYMedio() {
    if (Math.random() < 0.6) {
      const [t, r] = elige(TOPO);
      const resp = [r];
      if (r === 'árbol') resp.push('arbol', 'estrella extendida', 'jerárquica', 'jerarquica');
      if (r === 'punto a punto') resp.push('punto-a-punto', 'p2p', 'ppp');
      if (r === 'malla') resp.push('malla completa');
      return {
        enunciado: `${t} → ¿qué topología?`,
        respuesta: r,
        respuestas: resp,
        formato: 'texto',
        pista: 'Topologías físicas: punto a punto, bus, anillo, estrella, árbol y malla.'
      };
    }
    const [t, r] = elige(MEDIO);
    const resp = [r, r.toLowerCase()];
    if (r === 'coaxial') resp.push('cable coaxial', 'coax');
    return {
      enunciado: `${t} → ¿qué cable?`,
      respuesta: r,
      respuestas: resp,
      formato: 'texto',
      pista: 'UTP sin pantalla · FTP pantalla global · STP pantalla por par y global · coaxial: conductor central y malla.'
    };
  }

  GENERADORES['t568-colores'] = genT568Colores;
  GENERADORES['directo-o-cruzado'] = genDirectoOCruzado;
  GENERADORES['topologia-y-medio'] = genTopologiaYMedio;
})();
