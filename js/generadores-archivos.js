/* ============================================================
   Generadores de la Unidad 1 de Operaciones (el ordenador y tus
   archivos).

   Archivo aparte, cargado DESPUÉS de js/generadores.js, igual que
   js/generadores-internet.js. Solo añade entradas al objeto global
   GENERADORES.

   simbolo-teclado   con qué teclas sale un símbolo (# → AltGr + 3)
   extension-tipo    qué tipo de archivo es por su extensión
   nombre-archivo    corrige un nombre para que cumpla la norma de clase
   ruta-archivo      ruta absoluta o relativa hasta un archivo
   nombre-copia      nombre de la copia .zip con la fecha año-mes-día

   Las respuestas se comparan con respuestaCorrecta() de
   js/generadores.js: sin mayúsculas, sin acentos y sin espacios de más.
   ============================================================ */

(function () {
  if (typeof GENERADORES === 'undefined') return;

  function elige(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  /* ---------- Símbolos del teclado ---------- */

  const NOMBRE_TECLA = {
    altgr: ['altgr', 'alt gr', 'alt-gr'],
    mayus: ['mayus', 'mayús', 'mayusculas', 'shift', 'may'],
    ctrl: ['ctrl', 'control'],
    alt: ['alt']
  };
  const UNION = ['+', ' + ', ' '];

  function formas(teclas) {
    let salida = [''];
    teclas.forEach((tec, i) => {
      const nombres = NOMBRE_TECLA[tec] || [tec];
      const nuevas = [];
      salida.forEach(f => nombres.forEach(n => {
        if (i === 0) nuevas.push(n);
        else UNION.forEach(u => nuevas.push(f + u + n));
      }));
      salida = nuevas;
    });
    return salida;
  }

  /* t: tecla con la que se combina; con AltGr también vale Ctrl + Alt. */
  const SIMBOLOS = [
    { s: '#', mod: 'altgr', t: '3', p: 'AltGr + 3. Es la almohadilla de los colores (#ff0000).' },
    { s: '@', mod: 'altgr', t: '2', p: 'AltGr + 2. La arroba de los correos.' },
    { s: '\\', mod: 'altgr', t: 'º', p: 'AltGr + la tecla º ª, a la izquierda del 1. La barra invertida de las rutas de Windows.' },
    { s: '/', mod: 'mayus', t: '7', p: 'Mayús + 7. La barra normal.' },
    { s: '=', mod: 'mayus', t: '0', p: 'Mayús + 0 (cero).' },
    { s: '"', mod: 'mayus', t: '2', p: 'Mayús + 2. Las comillas rectas.' },
    { s: '>', mod: 'mayus', t: '<', p: 'Mayús + la tecla < que está entre la Mayús izquierda y la Z.' },
    { s: ':', mod: 'mayus', t: '.', p: 'Mayús + punto.' },
    { s: ';', mod: 'mayus', t: ',', p: 'Mayús + coma.' },
    { s: '_', mod: 'mayus', t: '-', p: 'Mayús + la tecla del guion, a la izquierda de la Mayús derecha.' }
  ];

  function genSimbolo() {
    const d = elige(SIMBOLOS);
    let respuestas = formas([d.mod, d.t]);
    if (d.mod === 'altgr') respuestas = respuestas.concat(formas(['ctrl', 'alt', d.t]));
    return {
      enunciado: `${d.s}   →`,
      respuesta: `${d.mod === 'altgr' ? 'AltGr' : 'Mayús'} + ${d.t}`,
      respuestas,
      formato: 'texto',
      pista: d.p
    };
  }

  GENERADORES['simbolo-teclado'] = genSimbolo;

  /* ---------- Tipo de archivo por su extensión ---------- */

  const TIPO = {
    imagen: { nombre: 'imagen', r: ['imagen', 'una imagen', 'foto', 'una foto', 'fotografia', 'dibujo', 'img'] },
    web: { nombre: 'página web', r: ['pagina web', 'una pagina web', 'pagina', 'web', 'html', 'pagina html'] },
    css: { nombre: 'estilos', r: ['estilos', 'los estilos', 'estilo', 'hoja de estilos', 'css', 'estilos de una pagina web', 'estilos de la web'] },
    texto: { nombre: 'texto', r: ['texto', 'un texto', 'texto sin formato', 'documento de texto', 'bloc de notas', 'txt'] },
    pdf: { nombre: 'PDF', r: ['pdf', 'un pdf', 'documento pdf'] },
    word: { nombre: 'Word', r: ['word', 'un word', 'documento de word', 'docx'] },
    zip: { nombre: 'comprimido', r: ['comprimido', 'archivo comprimido', 'zip', 'un zip', 'carpeta comprimida', 'comprimida'] }
  };

  const EXT = [
    ['.jpg', 'imagen'], ['.jpeg', 'imagen'], ['.png', 'imagen'], ['.webp', 'imagen'], ['.gif', 'imagen'],
    ['.html', 'web'], ['.css', 'css'], ['.txt', 'texto'], ['.pdf', 'pdf'], ['.docx', 'word'], ['.zip', 'zip']
  ];
  const BASES = ['playa', 'index', 'estilos-nuevos', 'notas', 'horario', 'trabajo-final', 'perro', 'logo',
    'resumen-unidad1', 'copia-2026-10-05', 'apuntes', 'contacto', 'gato-bailando', 'factura', 'receta'];

  function genExtension() {
    const e = elige(EXT);
    const tipo = TIPO[e[1]];
    return {
      enunciado: `${elige(BASES)}${e[0]}   →`,
      respuesta: tipo.nombre,
      respuestas: tipo.r,
      formato: 'texto',
      pista: `Lo dice el final del nombre, la extensión: ${e[0]} = ${tipo.nombre}.`
    };
  }

  GENERADORES['extension-tipo'] = genExtension;

  /* ---------- Corrige el nombre ---------- */

  const PALABRAS = ['Mi', 'Foto', 'Canción', 'Verano', 'Tarea', 'Resumen', 'Playa', 'Año', 'Niño', 'Mañana',
    'Fútbol', 'Música', 'Trabajo', 'Final', 'Notas', 'Clase', 'Página', 'Perro', 'Logo', 'Vacaciones', 'Examen'];
  const ADORNOS = ['', '', '!', ' (nuevo)', ' (1)', '?', ' & '];
  const EXTENSIONES = ['.txt', '.TXT', '.html', '.HTML', '.jpg', '.JPG', '.png', '.PNG', '.css'];

  function quitarAcentos(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /* Convierte un nombre a la norma de clase. "ñ" puede ser "n" o "ny". */
  function aNorma(base, ene) {
    let s = base.toLowerCase().replace(/ñ/g, ene);
    s = quitarAcentos(s).replace(/[^a-z0-9 -]/g, ' ').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
    return s;
  }

  function genNombre() {
    const n = 2 + Math.floor(Math.random() * 2);
    const palabras = [];
    while (palabras.length < n) {
      const p = elige(PALABRAS);
      if (palabras.indexOf(p) === -1) palabras.push(p);
    }
    let base = palabras.join(' ');
    if (Math.random() < 0.35) base += ' ' + (1 + Math.floor(Math.random() * 9));
    const adorno = elige(ADORNOS);
    base = adorno === ' & ' ? palabras[0] + ' & ' + palabras.slice(1).join(' ') : base + adorno;
    const ext = elige(EXTENSIONES);
    const respuestas = [];
    ['n', 'ny'].forEach(ene => {
      const buena = aNorma(base, ene);
      respuestas.push(buena + ext.toLowerCase());
      respuestas.push(buena.replace(/-(\d+)$/, '$1') + ext.toLowerCase()); // tarea-1 o tarea1
    });
    return {
      enunciado: `${base}${ext}   →`,
      respuesta: respuestas[0],
      respuestas,
      formato: 'texto',
      pista: 'Todo en minúsculas (también la extensión), un guion entre palabras, sin tildes ni ñ y sin símbolos.'
    };
  }

  GENERADORES['nombre-archivo'] = genNombre;

  /* ---------- Rutas ---------- */

  const USUARIOS = ['alumno', 'alumna', 'aula3', 'invitado'];
  const SITIOS = [
    { es: 'el Escritorio', en: 'Desktop' },
    { es: 'Documentos', en: 'Documents' },
    { es: 'Descargas', en: 'Downloads' }
  ];
  const CARPETAS = ['practicas-u0', 'mi-web', 'trabajos', 'fotos-viaje'];
  /* Cada subcarpeta con los archivos que tienen sentido dentro de ella. */
  const SUBCARPETAS = {
    imagenes: ['perro.jpg', 'playa.webp', 'logo.png'],
    fotos: ['playa.webp', 'perro.jpg', 'cumple.png'],
    textos: ['notas.txt', 'horario.pdf', 'resumen.docx'],
    css: ['estilos.css']
  };
  const SUELTOS = ['index.html', 'notas.txt', 'contacto.html'];

  function genRuta() {
    const usuario = elige(USUARIOS);
    const sitio = elige(SITIOS);
    const carpeta = elige(CARPETAS);
    const sub = Math.random() < 0.75 ? elige(Object.keys(SUBCARPETAS)) : null;
    const archivo = sub ? elige(SUBCARPETAS[sub]) : elige(SUELTOS);
    const donde = sub
      ? `${archivo} está en la carpeta ${sub}, dentro de ${carpeta}`
      : `${archivo} está suelto dentro de ${carpeta}`;
    if (Math.random() < 0.5) {
      const ruta = `C:\\Users\\${usuario}\\${sitio.en}\\${carpeta}\\${sub ? sub + '\\' : ''}${archivo}`;
      return {
        enunciado: `${donde}, en ${sitio.es} del usuario ${usuario}. Ruta absoluta →`,
        respuesta: ruta,
        respuestas: [ruta],
        formato: 'texto',
        traducible: true,
        pista: `Desde el disco, carpeta a carpeta, con \\ y los nombres de Windows en inglés (${sitio.es} = ${sitio.en}): ${ruta}`
      };
    }
    const ruta = `${sub ? sub + '/' : ''}${archivo}`;
    return {
      enunciado: `${donde}. Estás dentro de ${carpeta}. Ruta relativa →`,
      respuesta: ruta,
      respuestas: [ruta, './' + ruta],
      formato: 'texto',
      traducible: true,
      pista: sub
        ? `Desde donde estás: primero la subcarpeta, una barra / y el archivo: ${ruta}`
        : `El archivo está en la misma carpeta que tú: basta con su nombre, ${ruta}`
    };
  }

  GENERADORES['ruta-archivo'] = genRuta;

  /* ---------- Nombre de la copia con la fecha ---------- */

  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
    'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function dos(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function genCopia() {
    const carpeta = elige(['mi-web', 'practicas-u0', 'trabajos']);
    const mes = Math.floor(Math.random() * 12);
    const anyo = mes >= 8 ? 2026 : 2027; // curso 2026-27
    const dia = 1 + Math.floor(Math.random() * 28);
    const nombre = `${carpeta}-${anyo}-${dos(mes + 1)}-${dos(dia)}`;
    return {
      enunciado: `Copia de ${carpeta} hecha el ${dia} de ${MESES[mes]} de ${anyo} →`,
      respuesta: nombre + '.zip',
      respuestas: [nombre + '.zip', nombre],
      formato: 'texto',
      traducible: true,
      pista: `Año-mes-día, con dos cifras en el mes y en el día: ${nombre}.zip`
    };
  }

  GENERADORES['nombre-copia'] = genCopia;
})();
