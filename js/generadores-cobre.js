/* ============================================================
   Generadores de la Unidad 3 de Instalaciones (medios de
   transmisión: cobre y topologías).

   Archivo aparte, cargado DESPUÉS de js/generadores.js, igual que
   js/generadores-riesgos.js. Solo añade entradas al objeto global
   GENERADORES.

   t568-colores        color de un pin, o pin de un color, en T568A/B
   directo-o-cruzado   qué cable une dos aparatos (sin Auto-MDIX)
   topologia-y-medio   descripción o avería → topología o tipo de cable
   categoria-ethernet  (18/11/2026, U3 S6) nombre de Ethernet → velocidad o
                       medio; necesidad → categoría mínima; enlace → ¿cumple?
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

  /* MDI: transmite por 1-2 y recibe por 3-6 (equipos finales).
     MDI-X: al revés, lleva el cruce por dentro (switches y hubs).
     Desde el 20/11/2026 sin «un router» (confundía con el de casa) y la
     pista dice «equipo» / «reparte la red» en vez de las siglas. */
  const MDI = ['un PC', 'un portátil', 'un servidor', 'una impresora de red', 'una cámara IP', 'otro PC'];
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
      pista: `${a[0].toUpperCase()}${a.slice(1)} ${ta === 'MDI' ? 'es un equipo' : 'reparte la red'} y ${b} ${tb === 'MDI' ? 'es un equipo' : 'reparte la red'}: ${cruzado ? 'iguales → cruzado' : 'distintos → directo'}.${casa} (Con Auto-MDIX funcionaría con cualquiera, pero aquí se pregunta el que toca.)`
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

  /* ---------- Categorías y Ethernet (18/11/2026, U3 S6) ---------- */

  /* [nombre, velocidad, medio]. Las letras: T = par trenzado; SX, LX, SR = fibra. */
  const ETHER = [
    ['10BASE-T', '10 Mbps', 'par trenzado'],
    ['100BASE-TX', '100 Mbps', 'par trenzado'],
    ['1000BASE-T', '1 Gbps', 'par trenzado'],
    ['10GBASE-T', '10 Gbps', 'par trenzado'],
    ['1000BASE-SX', '1 Gbps', 'fibra'],
    ['1000BASE-LX', '1 Gbps', 'fibra'],
    ['10GBASE-SR', '10 Gbps', 'fibra']
  ];
  function velocidades(v) {
    const n = parseInt(v, 10);
    const mega = v.includes('Gbps') ? n * 1000 : n;
    const r = [v, v.replace(' ', ''), v.replace('bps', ''), v.replace(' ', '').replace('bps', ''), `${mega} Mbps`, `${mega}mbps`, `${mega} mb/s`, `${mega}`];
    if (v.includes('Gbps')) r.push(`${n} gb/s`, `${n} gigas`, `${n} giga`);
    return r;
  }

  function genCategoriaEthernet() {
    const tipo = Math.random();
    if (tipo < 0.35) {
      const [nom, vel, medio] = elige(ETHER);
      if (Math.random() < 0.5) {
        return {
          enunciado: `${nom} → ¿velocidad?`,
          respuesta: vel,
          respuestas: velocidades(vel),
          formato: 'texto',
          pista: `La primera parte es la velocidad en Mbps; con G delante, en Gbps. ${nom}: ${vel}.`
        };
      }
      return {
        enunciado: `${nom} → ¿par trenzado o fibra?`,
        respuesta: medio,
        respuestas: medio === 'fibra' ? ['fibra', 'fibra optica', 'f'] : ['par trenzado', 'trenzado', 'cobre', 'utp', 'pt'],
        formato: 'texto',
        pista: `La última parte es el medio: si empieza por T, par trenzado; si no, fibra. ${nom}: ${medio}.`
      };
    }
    if (tipo < 0.7) {
      /* [velocidad, metros, respuesta, explicación] */
      const casos = [
        () => { const m = 20 + 5 * Math.floor(Math.random() * 17); return ['1 Gbps', m, 'Cat 5e', `1 Gbps lo da ya la Cat 5e, que llega a 100 m. Es la mínima.`]; },
        () => { const m = 20 + 5 * Math.floor(Math.random() * 17); return ['100 Mbps', m, 'Cat 5e', `La Cat 5 está obsoleta: la mínima que se admite hoy es la Cat 5e.`]; },
        () => { const m = 20 + 5 * Math.floor(Math.random() * 16); return ['10 Gbps', m, 'Cat 6A', `Para 10 Gbps hasta 100 m, la mínima es la Cat 6A.`]; },
        () => { const m = 10 + 5 * Math.floor(Math.random() * 5); return ['40 Gbps', m, 'Cat 8', `40 Gbps solo los da la Cat 8, y solo hasta 30 m.`]; },
        () => { const m = 105 + 5 * Math.floor(Math.random() * 8); return ['1 Gbps', m, 'ninguna', `Pasados los 100 m no vale ningún cable de cobre: otro switch más cerca, o fibra.`]; }
      ];
      const [vel, m, r, exp] = elige(casos)();
      const n = r.replace('Cat ', '').toLowerCase();
      return {
        enunciado: `Necesito ${vel} a ${m} m → ¿categoría mínima?`,
        respuesta: r,
        respuestas: r === 'ninguna' ? ['ninguna', 'ninguno', 'nada', 'no se puede', 'fibra', 'switch'] : [r, n, `cat${n}`, `categoria ${n}`, `cat. ${n}`],
        formato: 'texto',
        traducible: true,
        pista: exp
      };
    }
    /* ¿Cumple el enlace? Fijo ≤ 90 m y latiguillos ≤ 10 m en total. */
    const fijo = 60 + Math.floor(Math.random() * 38);
    const l1 = 1 + Math.floor(Math.random() * 6);
    const l2 = 1 + Math.floor(Math.random() * 6);
    const lat = l1 + l2;
    const fallos = [];
    if (fijo > 90) fallos.push(`el fijo pasa de 90 m (${fijo} m)`);
    if (lat > 10) fallos.push(`los latiguillos pasan de 10 m (${l1} + ${l2} = ${lat} m)`);
    const cumple = fallos.length === 0;
    return {
      enunciado: `Fijo ${fijo} m, latiguillos ${l1} m + ${l2} m → ¿cumple? (sí/no)`,
      respuesta: cumple ? 'sí' : 'no',
      respuestas: cumple ? ['si', 'sí'] : ['no'],
      formato: 'texto',
      traducible: true,
      pista: cumple
        ? `Sí: fijo ${fijo} ≤ 90 m y latiguillos ${l1} + ${l2} = ${lat} ≤ 10 m (total ${fijo + lat} m).`
        : `No: ${fallos.join(' y ')}. Total ${fijo + lat} m, pero hay que mirar las dos condiciones.`
    };
  }

  GENERADORES['t568-colores'] = genT568Colores;
  GENERADORES['directo-o-cruzado'] = genDirectoOCruzado;
  GENERADORES['topologia-y-medio'] = genTopologiaYMedio;
  GENERADORES['categoria-ethernet'] = genCategoriaEthernet;
})();
