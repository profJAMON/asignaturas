/* ============================================================
   Calendario de ritmo — Operaciones Básicas (OACE, 3030)
   ============================================================

   Para qué
   --------
   Fecha prevista de cada unidad, de cada sesión y de cada examen, para
   saber a lo largo del curso si vamos bien de tiempo. Operaciones solo
   se da en 1º (un único grupo), así que, a diferencia de
   data/calendario-instalaciones.js, aquí NO hay nivel de "grupos":
   cada unidad lleva directamente { inicio, fin }, su "examen" y cada
   sesión su "fecha". Este archivo es la ÚNICA fuente de esas fechas:
   ni las sesiones ni curso-operaciones.json las llevan dentro.

   Quién lo usa
   ------------
   js/calendario.js (el mismo que usa Instalaciones) lo lee para pintar
   la fecha junto a cada sesión en la barra lateral, en la propia sesión
   y en calendario.html?a=operaciones.

   Cómo se ha calculado
   ---------------------
   - Horario 2026-27: lunes 2 h (15:00-16:50) + jueves 3 h (18:15-20:55).
   - Del 21/09/2026 al 18/06/2027 (en 1º no hay prácticas en empresa).
   - Sin clase: 12 y 13 oct, 1 nov, 7 y 8 dic, Navidad (23/12-06/01),
     26 feb, 1 y 2 mar, Pascua (25/03-04/04), 1 may. Salen 68 días de
     clase = 171 h (166 h antes de la semana de la 3ª evaluación).
   - Los exámenes son siempre en jueves, de 19:10 a 21:00 (2 h), así que
     cada unidad con examen termina en jueves y ese día quedan ~1 h de
     clase antes del examen (repaso de la unidad).
   - Horas por unidad: presupuesto de 165 h de la revisión crítica del
     curso (claude/revision-critica-curso.md), ajustado al jueves de
     examen más cercano — por eso el campo "horas" de alguna unidad no
     coincide exactamente con el presupuesto (p. ej. U1 42 h en vez de
     40 h). Las 2 h de examen van dentro de las horas de la unidad.
     "Antes de empezar" usa 1 h de las 6 h de la U0; la U0 no tiene examen.
   - Dentro de una unidad las sesiones se reparten a partes iguales sobre
     las horas de clase (mismo método que Instalaciones). La fecha de una
     sesión es el día en que empieza. Los glosarios no llevan fecha.
   - Las unidades 4 a 10 aún no existen en la web: sus id y títulos son
     provisionales (sesiones: []). Revísalos cuando se creen.

   Si falta tiempo
   ---------------
   El encaje es exacto (166 h de 166 h antes de la semana de la 3ª
   evaluación). Decisión de Carles: si el curso se retrasa o se pierden
   horas, lo que se recorta es la Unidad 10 (Python).

   Cómo actualizar
   ---------------
   Si el ritmo real se desvía: edita las fechas de la unidad afectada
   (y las siguientes si el desfase se arrastra), o pide que se
   recalcule a partir de la fecha real en la que vais.
   ============================================================ */
const CALENDARIO_OPERACIONES = 
{
  "actualizado": "2026-09-18",
  "nota": "Fechas calculadas a partir de las horas por unidad y el horario real (lunes 2 h + jueves 3 h), con el calendario escolar 2026-2027. Los exámenes son los jueves de 19:10 a 21:00. Pueden retrasarse; sirven para saber si vas bien de tiempo, no como fecha exacta.",
  "unidades": [
    {
      "id": "antes-de-empezar",
      "titulo": "Antes de empezar",
      "horas": 1,
      "sesiones": [
        "formas-de-evaluar"
      ],
      "fechas": {
        "inicio": "2026-09-21",
        "fin": "2026-09-21"
      }
    },
    {
      "id": "el-ordenador-y-tus-archivos",
      "titulo": "Unidad 0. El ordenador y tus archivos",
      "horas": 5,
      "sesiones": [
        "sesion-1-teclado-explorador",
        "sesion-2-rutas-descargas",
        "sesion-3-propiedades-este-equipo",
        "sesion-4-copia-seguridad-drive"
      ],
      "fechas": {
        "inicio": "2026-09-21",
        "fin": "2026-09-28"
      }
    },
    {
      "id": "html-css-practico",
      "titulo": "UNIDAD 1. Introducción a HTML/CSS",
      "horas": 42,
      "sesiones": [
        "sesion-1-primeros-pasos-html",
        "sesion-2-texto-listas-enlaces",
        "sesion-3-imagenes-estructura-semantica",
        "sesion-4-introduccion-css",
        "sesion-5-modelo-de-caja",
        "sesion-5b-repaso-modelo-de-caja",
        "sesion-6-tablas",
        "sesion-7-flexbox",
        "sesion-8-repaso-ejercicios-1",
        "sesion-9-proyecto-pagina-personal-parte-1",
        "sesion-10-proyecto-pagina-personal-parte-2",
        "sesion-11-repaso-ejercicios-2"
      ],
      "fechas": {
        "inicio": "2026-09-28",
        "fin": "2026-11-26"
      },
      "examen": "2026-11-26"
    },
    {
      "id": "fundamentos-internet",
      "titulo": "Unidad 2. Fundamentos de Internet",
      "horas": 13,
      "sesiones": [
        "sesion-1-cliente-servidor-ip-dns",
        "sesion-2-red-desde-la-terminal",
        "sesion-3-navegador-devtools",
        "sesion-4-url-http-basico",
        "sesion-5-que-hace-falta-publicar"
      ],
      "fechas": {
        "inicio": "2026-11-30",
        "fin": "2026-12-17"
      },
      "examen": "2026-12-17"
    },
    {
      "id": "publicacion-web",
      "titulo": "Unidad 3. Publicación en la web",
      "horas": 15,
      "sesiones": [
        "sesion-1-publicar-de-verdad",
        "sesion-2-blogs-wikis",
        "sesion-3-redes-sociales-nube",
        "sesion-4-gestores-contenidos-p2p"
      ],
      "fechas": {
        "inicio": "2026-12-21",
        "fin": "2027-01-21"
      },
      "examen": "2027-01-21"
    },
    {
      "id": "navegador-servicios-internet",
      "titulo": "Unidad 4. El navegador como usuario, buscadores, correo y mensajería",
      "horas": 10,
      "sesiones": [],
      "fechas": {
        "inicio": "2027-01-25",
        "fin": "2027-02-04"
      },
      "examen": "2027-02-04"
    },
    {
      "id": "sistemas-operativos",
      "titulo": "Unidad 5. Sistemas operativos: virtualización e instalación",
      "horas": 15,
      "sesiones": [],
      "fechas": {
        "inicio": "2027-02-08",
        "fin": "2027-02-25"
      },
      "examen": "2027-02-25"
    },
    {
      "id": "windows-linux",
      "titulo": "Unidad 6. Windows y Linux: archivos, usuarios, permisos y terminal",
      "horas": 25,
      "sesiones": [],
      "fechas": {
        "inicio": "2027-03-04",
        "fin": "2027-04-15"
      },
      "examen": "2027-04-15"
    },
    {
      "id": "redes-recursos-compartidos",
      "titulo": "Unidad 7. Redes: compartir recursos y permisos",
      "horas": 15,
      "sesiones": [],
      "fechas": {
        "inicio": "2027-04-19",
        "fin": "2027-05-06"
      },
      "examen": "2027-05-06"
    },
    {
      "id": "git-github",
      "titulo": "Unidad 8. Git y GitHub Pages",
      "horas": 10,
      "sesiones": [],
      "fechas": {
        "inicio": "2027-05-10",
        "fin": "2027-05-20"
      },
      "examen": "2027-05-20"
    },
    {
      "id": "javascript",
      "titulo": "Unidad 9. JavaScript",
      "horas": 10,
      "sesiones": [],
      "fechas": {
        "inicio": "2027-05-24",
        "fin": "2027-06-03"
      },
      "examen": "2027-06-03"
    },
    {
      "id": "python",
      "titulo": "Unidad 10. Python",
      "horas": 5,
      "sesiones": [],
      "fechas": {
        "inicio": "2027-06-07",
        "fin": "2027-06-10"
      },
      "examen": "2027-06-10"
    }
  ],
  "sesiones": {
    "formas-de-evaluar": {
      "titulo": "Formas de evaluar",
      "unidad": "antes-de-empezar",
      "fecha": "2026-09-21"
    },
    "sesion-1-teclado-explorador": {
      "titulo": "Sesión 1 — El teclado y el explorador de archivos",
      "unidad": "el-ordenador-y-tus-archivos",
      "fecha": "2026-09-21"
    },
    "sesion-2-rutas-descargas": {
      "titulo": "Sesión 2 — Rutas y descargas",
      "unidad": "el-ordenador-y-tus-archivos",
      "fecha": "2026-09-24"
    },
    "sesion-3-propiedades-este-equipo": {
      "titulo": "Sesión 3 — Propiedades de un archivo y Este equipo",
      "unidad": "el-ordenador-y-tus-archivos",
      "fecha": "2026-09-24"
    },
    "sesion-4-copia-seguridad-drive": {
      "titulo": "Sesión 4 — Copia de seguridad en Drive",
      "unidad": "el-ordenador-y-tus-archivos",
      "fecha": "2026-09-24"
    },
    "sesion-1-primeros-pasos-html": {
      "titulo": "Sesión 1 — Primeros pasos en HTML",
      "unidad": "html-css-practico",
      "fecha": "2026-09-28"
    },
    "sesion-2-texto-listas-enlaces": {
      "titulo": "Sesión 2 — Texto, listas y enlaces",
      "unidad": "html-css-practico",
      "fecha": "2026-10-01"
    },
    "sesion-3-imagenes-estructura-semantica": {
      "titulo": "Sesión 3 — Imágenes y estructura semántica",
      "unidad": "html-css-practico",
      "fecha": "2026-10-08"
    },
    "sesion-4-introduccion-css": {
      "titulo": "Sesión 4 — Introducción a CSS",
      "unidad": "html-css-practico",
      "fecha": "2026-10-15"
    },
    "sesion-5-modelo-de-caja": {
      "titulo": "Sesión 5 — Modelo de caja",
      "unidad": "html-css-practico",
      "fecha": "2026-10-19"
    },
    "sesion-5b-repaso-modelo-de-caja": {
      "titulo": "Sesión 5B — Repaso: modelo de caja",
      "unidad": "html-css-practico",
      "fecha": "2026-10-22"
    },
    "sesion-6-tablas": {
      "titulo": "Sesión 6 — Tablas de datos",
      "unidad": "html-css-practico",
      "fecha": "2026-10-29"
    },
    "sesion-7-flexbox": {
      "titulo": "Sesión 7 — Flexbox",
      "unidad": "html-css-practico",
      "fecha": "2026-11-02"
    },
    "sesion-8-repaso-ejercicios-1": {
      "titulo": "Sesión 8 — Repaso general 1",
      "unidad": "html-css-practico",
      "fecha": "2026-11-05"
    },
    "sesion-9-proyecto-pagina-personal-parte-1": {
      "titulo": "Sesión 9 — Proyecto: tu página personal (parte 1, el home)",
      "unidad": "html-css-practico",
      "fecha": "2026-11-12"
    },
    "sesion-10-proyecto-pagina-personal-parte-2": {
      "titulo": "Sesión 10 — Proyecto: tu página personal (parte 2, resúmenes)",
      "unidad": "html-css-practico",
      "fecha": "2026-11-16"
    },
    "sesion-11-repaso-ejercicios-2": {
      "titulo": "Sesión 11 — Repaso general 2",
      "unidad": "html-css-practico",
      "fecha": "2026-11-19"
    },
    "sesion-1-cliente-servidor-ip-dns": {
      "titulo": "Sesión 1. Cliente-servidor, IP y DNS",
      "unidad": "fundamentos-internet",
      "fecha": "2026-11-30"
    },
    "sesion-2-red-desde-la-terminal": {
      "titulo": "Sesión 2. La red desde la terminal",
      "unidad": "fundamentos-internet",
      "fecha": "2026-12-03"
    },
    "sesion-3-navegador-devtools": {
      "titulo": "Sesión 3. El navegador y sus herramientas (DevTools)",
      "unidad": "fundamentos-internet",
      "fecha": "2026-12-03"
    },
    "sesion-4-url-http-basico": {
      "titulo": "Sesión 4. Anatomía de una URL y HTTP básico",
      "unidad": "fundamentos-internet",
      "fecha": "2026-12-10"
    },
    "sesion-5-que-hace-falta-publicar": {
      "titulo": "Sesión 5. Qué hace falta para publicar",
      "unidad": "fundamentos-internet",
      "fecha": "2026-12-14"
    },
    "sesion-1-publicar-de-verdad": {
      "titulo": "Sesión 1. Publicar de verdad",
      "unidad": "publicacion-web",
      "fecha": "2026-12-21"
    },
    "sesion-2-blogs-wikis": {
      "titulo": "Sesión 2. Blogs, foros y wikis",
      "unidad": "publicacion-web",
      "fecha": "2027-01-07"
    },
    "sesion-3-redes-sociales-nube": {
      "titulo": "Sesión 3. Redes sociales, sindicación y la nube",
      "unidad": "publicacion-web",
      "fecha": "2027-01-11"
    },
    "sesion-4-gestores-contenidos-p2p": {
      "titulo": "Sesión 4. Gestores de contenidos y redes P2P",
      "unidad": "publicacion-web",
      "fecha": "2027-01-14"
    }
  }
}
;
